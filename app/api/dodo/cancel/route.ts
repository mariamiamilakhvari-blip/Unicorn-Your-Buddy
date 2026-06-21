import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const user = await User.findById(session.user.id).select('subscription')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const subId = user.subscription?.dodoSubscriptionId
    if (!subId) return NextResponse.json({ error: 'No active subscription' }, { status: 400 })

    await dodo.subscriptions.update(subId, { status: 'cancelled' })

    await User.findByIdAndUpdate(session.user.id, {
      'subscription.status': 'cancelled',
      'subscription.plan': 'none',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Dodo cancel error:', err)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
