import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Hobby from '@/lib/models/Hobby'
import Notification from '@/lib/models/Notification'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  if (session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await connectDB()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    freeTrialUsers,
    monthlyUsers,
    yearlyUsers,
    premiumUsers,
    premiumPlusUsers,
    activeUsers7d,
    totalNotifications,
    totalHobbies,
    signupsByDay,
    subscriptionBreakdown,
    onboardingStats,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': { $ne: 'free_trial' } }),
    User.countDocuments({ 'subscription.plan': 'free_trial' }),
    User.countDocuments({ 'subscription.plan': 'monthly' }),
    User.countDocuments({ 'subscription.plan': 'yearly' }),
    User.countDocuments({ 'subscription.plan': 'premium' }),
    User.countDocuments({ 'premiumPlus.active': true }),
    User.countDocuments({ lastActive: { $gte: sevenDaysAgo } }),
    Notification.countDocuments(),
    Hobby.countDocuments(),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      {
        $group: {
          _id: '$onboardingCompleted',
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  const days: { date: string; users: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    const found = signupsByDay.find((s: { _id: string; count: number }) => s._id === dateStr)
    days.push({ date: dateStr, users: found ? found.count : 0 })
  }

  return NextResponse.json({
    totals: {
      users: totalUsers,
      newThisMonth: newUsersThisMonth,
      activeSubscriptions,
      activeUsers7d,
      premiumPlus: premiumPlusUsers,
      notifications: totalNotifications,
      hobbies: totalHobbies,
    },
    subscriptions: {
      free_trial: freeTrialUsers,
      monthly: monthlyUsers,
      yearly: yearlyUsers,
      premium: premiumUsers,
    },
    signupsByDay: days,
    subscriptionBreakdown: subscriptionBreakdown.map((s: { _id: string; count: number }) => ({
      plan: s._id || 'none',
      count: s.count,
    })),
    onboarding: {
      completed: onboardingStats.find((s: { _id: boolean; count: number }) => s._id === true)?.count ?? 0,
      pending: onboardingStats.find((s: { _id: boolean; count: number }) => s._id === false)?.count ?? 0,
    },
  })
}
