import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import CarProfile from '@/lib/models/CarProfile'
import Interest from '@/lib/models/Interest'
import Match from '@/lib/models/Match'
import User from '@/lib/models/User'
import { hasActivePremiumPlus } from '@/lib/carDating'

// Feed of other active CarProfiles. Requires active Premium Plus.
// Excludes self, hidden profiles, anyone already expressed interest in, and
// existing matches. contactHandle is NEVER included here (browsing only).
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await hasActivePremiumPlus(session.user.id))) {
    return NextResponse.json({ error: 'Premium Plus required' }, { status: 402 })
  }
  try {
    await connectDB()
    const me = session.user.id
    const cityFilter = new URL(req.url).searchParams.get('city')

    const [sentInterests, matches] = await Promise.all([
      Interest.find({ fromUserId: me }).select('toUserId'),
      Match.find({ $or: [{ userIdA: me }, { userIdB: me }] }).select('userIdA userIdB'),
    ])
    const excludeIds = new Set<string>([me])
    sentInterests.forEach(i => excludeIds.add(String(i.toUserId)))
    matches.forEach(m => { excludeIds.add(String(m.userIdA)); excludeIds.add(String(m.userIdB)) })

    const query: Record<string, unknown> = {
      visibility: 'active',
      userId: { $nin: Array.from(excludeIds) },
    }
    if (cityFilter) query.city = cityFilter

    const profiles = await CarProfile.find(query)
      .select('userId carMake carModel carYear shortBio city')  // no contactHandle
      .limit(50)

    // Attach display names (no contact info).
    const users = await User.find({ _id: { $in: profiles.map(p => p.userId) } }).select('name')
    const nameById = new Map(users.map(u => [String(u._id), u.name]))

    const feed = profiles.map(p => ({
      userId: String(p.userId),
      name: nameById.get(String(p.userId)) ?? 'Someone',
      carMake: p.carMake, carModel: p.carModel, carYear: p.carYear,
      shortBio: p.shortBio, city: p.city,
    }))

    return NextResponse.json({ profiles: feed })
  } catch (err) {
    console.error('[car-dating/browse]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
