'use client'

import { useEffect, useState } from 'react'
import { Users, TrendingUp, CreditCard, BookOpen, Bell, Zap, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

type Stats = {
  totals: { users: number; newThisMonth: number; activeSubscriptions: number; activeUsers7d: number; premiumPlus: number; notifications: number; hobbies: number }
  subscriptions: { free_trial: number; monthly: number; yearly: number; premium: number }
  signupsByDay: { date: string; users: number }[]
  subscriptionBreakdown: { plan: string; count: number }[]
  onboarding: { completed: number; pending: number }
}

const signupChartConfig: ChartConfig = {
  users: { label: 'New Users', color: '#73306b' },
}

const subChartConfig: ChartConfig = {
  free_trial: { label: 'Free Trial', color: '#b876ab' },
  monthly: { label: 'Monthly', color: '#73306b' },
  yearly: { label: 'Yearly', color: '#3f0e3b' },
}

const PIE_COLORS = ['#b876ab', '#73306b', '#3f0e3b', '#96508c', '#561a50']

const onboardingConfig: ChartConfig = {
  completed: { label: 'Completed', color: '#22c55e' },
  pending: { label: 'Pending', color: '#73306b' },
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; sub?: string }) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </div>
          <div className="w-12 h-12 rounded-xl bg-velvet-600/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-velvet-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 bg-gray-800 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 bg-gray-800 rounded-xl" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">Failed to load stats. Make sure you are signed in as admin.</p>
      </div>
    )
  }

  const subBarData = [
    { plan: 'Free Trial', count: stats.subscriptions.free_trial },
    { plan: 'Monthly', count: stats.subscriptions.monthly },
    { plan: 'Yearly', count: stats.subscriptions.yearly },
    { plan: 'Premium', count: stats.subscriptions.premium },
  ]

  const onboardingData = [
    { name: 'completed', value: stats.onboarding.completed, fill: '#22c55e' },
    { name: 'pending', value: stats.onboarding.pending, fill: '#73306b' },
  ]

  const formattedDays = stats.signupsByDay.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totals.users} icon={Users} />
        <StatCard label="New This Month" value={stats.totals.newThisMonth} icon={TrendingUp} sub="+last 30 days" />
        <StatCard label="Active (7d)" value={stats.totals.activeUsers7d} icon={UserCheck} sub="recently used the app" />
        <StatCard label="Active Subs" value={stats.totals.activeSubscriptions} icon={CreditCard} />
        <StatCard label="Premium Plus" value={stats.totals.premiumPlus} icon={Zap} sub="car dating add-on" />
        <StatCard label="Notifications" value={stats.totals.notifications} icon={Bell} sub="sent all-time" />
        <StatCard label="Hobbies" value={stats.totals.hobbies} icon={BookOpen} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Signups area chart */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">New Signups (30 days)</CardTitle>
            <CardDescription className="text-gray-500">Daily user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={signupChartConfig} className="h-52 w-full">
              <AreaChart data={formattedDays}>
                <defs>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#73306b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#73306b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="users" stroke="#73306b" fill="url(#fillUsers)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Onboarding pie */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Onboarding</CardTitle>
            <CardDescription className="text-gray-500">Completion rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={onboardingConfig} className="h-44 w-full">
              <PieChart>
                <Pie data={onboardingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {onboardingData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Completed ({stats.onboarding.completed})
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-velvet-500" />
                Pending ({stats.onboarding.pending})
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription bar chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Subscription Plans</CardTitle>
            <CardDescription className="text-gray-500">Users per plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={subChartConfig} className="h-52 w-full">
              <BarChart data={subBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="plan" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {subBarData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscription breakdown pie */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base">Plan Distribution</CardTitle>
            <CardDescription className="text-gray-500">All plan types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={subChartConfig} className="h-52 w-full">
              <PieChart>
                <Pie
                  data={stats.subscriptionBreakdown}
                  dataKey="count"
                  nameKey="plan"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ plan, percent }) => `${plan} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.subscriptionBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
