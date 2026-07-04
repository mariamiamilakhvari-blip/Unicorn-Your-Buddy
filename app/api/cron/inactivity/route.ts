import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import { generateInactivityCheckIn } from '@/lib/ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const INACTIVITY_DAYS = 3
const BATCH_LIMIT = 50

// Runs on a daily Vercel cron. Finds users inactive for 3+ days and sends one
// warm re-engagement notification per inactivity spell.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const authorized =
    !!secret && req.headers.get('authorization') === `Bearer ${secret}`
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()

    const threshold = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000)

    // Eligible: inactive 3+ days, notifications allowed, and not already pinged
    // for this inactivity spell (no ping since their last activity).
    const users = await User.find({
      active: { $ne: false },
      'permissions.notifications': true,
      lastActive: { $lte: threshold },
      $expr: { $lt: [{ $ifNull: ['$lastInactivityPingAt', new Date(0)] }, '$lastActive'] },
    })
      .select('name profile lastActive')
      .limit(BATCH_LIMIT)

    let sent = 0
    for (const user of users) {
      try {
        const { title, body } = await generateInactivityCheckIn(
          (user.profile ?? {}) as Record<string, string>,
          user.name,
        )
        await Notification.create({ userId: user._id, type: 'reminder', title, body })
        await User.updateOne({ _id: user._id }, { $set: { lastInactivityPingAt: new Date() } })
        sent++
      } catch (e) {
        console.error('[cron/inactivity] user failed:', user._id, e)
      }
    }

    return NextResponse.json({ ok: true, eligible: users.length, sent })
  } catch (err) {
    console.error('[cron/inactivity]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
