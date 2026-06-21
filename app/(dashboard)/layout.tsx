import { TopNav } from '@/components/dashboard/TopNav'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
