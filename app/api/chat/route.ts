import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { generateBuddyResponse, type ChatMessage } from '@/lib/ai'

const FREE_LIMIT = 5
const PAID_PLANS = ['monthly', 'yearly', 'premium']

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { history }: { history: ChatMessage[] } = await req.json()

    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isPaid = PAID_PLANS.includes(user.subscription?.plan)
    const count = user.chatMessageCount ?? 0

    if (!isPaid && count >= FREE_LIMIT) {
      return NextResponse.json({ paywalled: true, messageCount: count })
    }

    // messageNumber is 1-based: count=0 → this is message 1
    const messageNumber = Math.min(count + 1, 5)
    const reply = await generateBuddyResponse(user.profile as Record<string, string>, history, messageNumber, isPaid)

    // Persist the full conversation so it loads across devices/sessions
    const fullHistory = [...history, { role: 'assistant', content: reply }]
    await User.findByIdAndUpdate(user._id, {
      $inc: { chatMessageCount: 1 },
      $set: { chatHistory: fullHistory },
    })

    return NextResponse.json({ reply, messageCount: count + 1, isPaid })
  } catch (err) {
    console.error('[chat/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const user = await User.findById(session.user.id).select('chatMessageCount subscription profile chatHistory')
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isPaid = PAID_PLANS.includes(user.subscription?.plan)
    const count = user.chatMessageCount ?? 0

    return NextResponse.json({
      messageCount: count,
      isPaid,
      remaining: isPaid ? null : Math.max(0, FREE_LIMIT - count),
      profile: user.profile,
      subscriptionPlan: user.subscription?.plan ?? 'none',
      history: user.chatHistory ?? [],
    })
  } catch (err) {
    console.error('[chat/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
