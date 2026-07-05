import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { evaluateUserPlan } from '@/lib/planEngine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_LIMIT = 100

// Daily Vercel cron. Runs the per-user plan engine for every user with an active
// hobby so the promised 7-day hobby check-in (and ritual/invitation/social)
// fire on schedule, without the user needing the app open.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const authorized =
    !!secret && req.headers.get('authorization') === `Bearer ${secret}`
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()

    const users = await User.find({
      active: { $ne: false },
      'wellbeingPlan.hobby.name': { $exists: true, $ne: null },
      // Only active hobbies (missing status = legacy active); skip paused/completed.
      'wellbeingPlan.hobby.status': { $nin: ['paused', 'completed'] },
    })
      .select('_id')
      .limit(BATCH_LIMIT)

    let evaluated = 0
    let failed = 0
    for (const user of users) {
      try {
        await evaluateUserPlan(String(user._id))
        evaluated++
      } catch (e) {
        failed++
        console.error('[cron/plan] user failed:', user._id, e)
      }
    }

    return NextResponse.json({ ok: true, users: users.length, evaluated, failed })
  } catch (err) {
    console.error('[cron/plan]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
