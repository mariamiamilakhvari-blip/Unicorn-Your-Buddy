import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { LandingPage } from '@/components/LandingPage'

const PAID_PLANS = ['monthly', 'yearly', 'premium']

export default async function Page() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'admin'

  let isPaid = false
  if (session?.user?.id) {
    try {
      await connectDB()
      const user = await User.findById(session.user.id).select('subscription')
      isPaid = PAID_PLANS.includes(user?.subscription?.plan)
    } catch {}
  }

  return <LandingPage isLoggedIn={isLoggedIn} isAdmin={isAdmin} isPaid={isPaid} />
}
