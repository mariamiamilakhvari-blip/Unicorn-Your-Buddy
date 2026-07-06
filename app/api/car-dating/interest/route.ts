import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import Interest from '@/lib/models/Interest'
import Match from '@/lib/models/Match'
import { hasActivePremiumPlus, sortedPair } from '@/lib/carDating'

// Express interest in another user. Requires active Premium Plus.
// If the other user already expressed interest back, flip both Interests to
// "matched" and create a Match record. No chat is created, ever.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await hasActivePremiumPlus(session.user.id))) {
    return NextResponse.json({ error: 'Premium Plus required' }, { status: 402 })
  }
  try {
    const { toUserId } = await req.json()
    const me = session.user.id
    if (!toUserId || toUserId === me) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 })
    }
    await connectDB()

    // Reciprocal interest already exists? Then it's a match.
    const reciprocal = await Interest.findOne({ fromUserId: toUserId, toUserId: me })

    if (reciprocal) {
      const [a, b] = sortedPair(me, toUserId)
      await Promise.all([
        Interest.updateOne({ fromUserId: me, toUserId }, { $set: { status: 'matched' } }, { upsert: true }),
        Interest.updateOne({ fromUserId: toUserId, toUserId: me }, { $set: { status: 'matched' } }),
        Match.updateOne(
          { userIdA: a, userIdB: b },
          { $setOnInsert: { userIdA: a, userIdB: b, matchedAt: new Date() } },
          { upsert: true },
        ),
      ])
      return NextResponse.json({ matched: true })
    }

    await Interest.updateOne(
      { fromUserId: me, toUserId },
      { $setOnInsert: { fromUserId: me, toUserId, status: 'pending' } },
      { upsert: true },
    )
    return NextResponse.json({ matched: false })
  } catch (err) {
    console.error('[car-dating/interest]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
