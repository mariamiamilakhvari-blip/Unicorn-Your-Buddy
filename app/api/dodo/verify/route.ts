import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

// Fallback path for local dev / immediate UI feedback where the Dodo webhook
// can't reach localhost. Confirms subscription status directly with Dodo's
// API instead of waiting on the webhook, then syncs the user record.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subscriptionId }: { subscriptionId?: string } = await req.json().catch(() => ({}))
    const userId = String(session.user.id)

    // Resolve the subscription either from the id Dodo appended to the return URL,
    // or — when none was passed — by finding this user's active subscription.
    let sub
    if (subscriptionId) {
      sub = await dodo.subscriptions.retrieve(subscriptionId)
      if (sub.metadata?.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      const list = await dodo.subscriptions.list({ status: 'active', page_size: 20 })
      sub = list.items?.find(s => s.metadata?.userId === userId)
      if (!sub) return NextResponse.json({ status: 'pending' })
    }

    await connectDB()

    if (sub.status === 'active') {
      await User.findByIdAndUpdate(userId, {
        'subscription.plan': 'premium',
        'subscription.status': 'active',
        'subscription.dodoCustomerId': sub.customer.customer_id,
        'subscription.dodoSubscriptionId': sub.subscription_id,
      })
    }

    return NextResponse.json({ status: sub.status })
  } catch (err) {
    console.error('Dodo verify error:', err)
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 })
  }
}
