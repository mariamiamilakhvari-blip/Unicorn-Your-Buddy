import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { generateBuddyResponse, extractHobbyTag, stripHobbyTag, type ChatMessage } from '@/lib/ai'

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
    // Read the current hobby fresh every message (user was just re-fetched above),
    // so a hobby switch/complete/delete made elsewhere is reflected on the next turn.
    const currentHobby = user.wellbeingPlan?.hobby
      ? { name: user.wellbeingPlan.hobby.name, status: user.wellbeingPlan.hobby.status }
      : null
    const rawReply = await generateBuddyResponse(user.profile as Record<string, string>, history, messageNumber, isPaid, currentHobby)

    // The buddy may embed a hidden hobby tag when the user commits to one.
    // Detect it, persist the hobby (only if none is currently active), then
    // strip the tag so it never appears in the message the user sees.
    const hobbyTag = extractHobbyTag(rawReply)
    const reply = stripHobbyTag(rawReply)

    const hasActiveHobby = currentHobby?.name && currentHobby.status === 'active'
    const setOps: Record<string, unknown> = { lastActive: new Date() }
    if (hobbyTag && !hasActiveHobby) {
      setOps['wellbeingPlan.hobby'] = {
        name: hobbyTag.name,
        category: 'healing',
        duration: hobbyTag.duration,
        learningMethod: 'self paced',
        description: `A ${hobbyTag.duration} month journey with ${hobbyTag.name} to rebuild balance and rhythm.`,
        startedAt: new Date(),
        status: 'active',
      }
    }

    // Append to the DB history (the source of truth) instead of overwriting it
    // with the client's array. A client that sends only a partial history (a
    // stale tab, a test, a race) must never be able to wipe stored messages.
    const dbHistory = Array.isArray(user.chatHistory) ? user.chatHistory : []
    const lastUserMsg = history[history.length - 1]
    const appended = [...dbHistory]
    if (lastUserMsg && lastUserMsg.role === 'user') {
      appended.push({ role: 'user', content: lastUserMsg.content, at: (lastUserMsg as { at?: string }).at ?? new Date().toISOString() })
    }
    appended.push({ role: 'assistant', content: reply, at: new Date().toISOString() })
    setOps.chatHistory = appended
    await User.findByIdAndUpdate(user._id, {
      $inc: { chatMessageCount: 1 },
      $set: setOps,
    })

    return NextResponse.json({ reply, messageCount: count + 1, isPaid, hobbyStarted: hobbyTag && !hasActiveHobby ? hobbyTag.name : null })
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
    const user = await User.findById(session.user.id).select('chatMessageCount subscription profile chatHistory wellbeingPlan.hobby')
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Opening the chat counts as activity.
    User.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } }).catch(() => {})

    const isPaid = PAID_PLANS.includes(user.subscription?.plan)
    const count = user.chatMessageCount ?? 0

    return NextResponse.json({
      messageCount: count,
      isPaid,
      remaining: isPaid ? null : Math.max(0, FREE_LIMIT - count),
      profile: user.profile,
      subscriptionPlan: user.subscription?.plan ?? 'none',
      history: user.chatHistory ?? [],
      hobby: user.wellbeingPlan?.hobby?.name
        ? { name: user.wellbeingPlan.hobby.name, status: user.wellbeingPlan.hobby.status ?? 'active' }
        : null,
    })
  } catch (err) {
    console.error('[chat/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
