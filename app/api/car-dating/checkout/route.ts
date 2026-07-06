import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? '',
  environment: 'test_mode',
})

// Checkout for the Premium Plus (Car Dating) add-on. Reuses the same Dodo
// integration as the base plan, just a separate product + a tier tag in
// metadata so the webhook credits the add-on independently.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { plan }: { plan?: 'monthly' | 'yearly' } = await req.json().catch(() => ({}))
    const productId = plan === 'yearly'
      ? process.env.DODO_CARDATING_YEARLY_PRODUCT_ID
      : process.env.DODO_CARDATING_MONTHLY_PRODUCT_ID
    if (!productId) {
      return NextResponse.json({ error: 'Premium Plus product not configured' }, { status: 500 })
    }

    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const checkout = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/car-dating?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/car-dating`,
      metadata: { userId: String(session.user.id), tier: 'premium_plus', plan: plan ?? 'monthly' },
      customization: { theme: 'light' },
    })

    return NextResponse.json({ url: checkout.checkout_url })
  } catch (err) {
    console.error('[car-dating/checkout]', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
