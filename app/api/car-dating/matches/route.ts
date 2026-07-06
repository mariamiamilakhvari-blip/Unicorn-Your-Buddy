import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import Match from '@/lib/models/Match'
import CarProfile from '@/lib/models/CarProfile'
import User from '@/lib/models/User'

// List the caller's matches. Intentionally NOT gated by Premium Plus: matches
// remain visible even if the add-on lapses. Each match reveals the other user's
// car profile, name, and their opt-in contactHandle (only ever shown here, to a
// confirmed match). No chat thread, no contact info beyond what they chose to add.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const me = session.user.id
    const matches = await Match.find({ $or: [{ userIdA: me }, { userIdB: me }] }).sort({ matchedAt: -1 })

    const otherIds = matches.map(m => (String(m.userIdA) === me ? m.userIdB : m.userIdA))
    const [profiles, users] = await Promise.all([
      CarProfile.find({ userId: { $in: otherIds } }),
      User.find({ _id: { $in: otherIds } }).select('name'),
    ])
    const profileByUser = new Map(profiles.map(p => [String(p.userId), p]))
    const nameByUser = new Map(users.map(u => [String(u._id), u.name]))

    const result = matches.map(m => {
      const other = String(m.userIdA) === me ? String(m.userIdB) : String(m.userIdA)
      const p = profileByUser.get(other)
      return {
        userId: other,
        name: nameByUser.get(other) ?? 'Someone',
        matchedAt: m.matchedAt,
        carMake: p?.carMake, carModel: p?.carModel, carYear: p?.carYear,
        shortBio: p?.shortBio, city: p?.city,
        // Revealed only to a confirmed match, and only if they opted in.
        contactHandle: p?.contactHandle ?? null,
      }
    })

    return NextResponse.json({ matches: result })
  } catch (err) {
    console.error('[car-dating/matches]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
