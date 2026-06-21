'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, ShieldCheck } from 'lucide-react'
import { clearUser, getUser } from '@/lib/mock-auth'
import { signOut as nextAuthSignOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [userName, setUserName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = session?.user?.role === 'admin'

  const NAV_LINKS = [
    { href: '/home', label: t('topNavHome') },
  ]

  useEffect(() => {
    const user = getUser()
    if (user) setUserName(user.name.split(' ')[0])
  }, [])

  function signOut() {
    clearUser()
    nextAuthSignOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Logo — pill style matching landing page */}
      <Link href="/" className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm font-black text-black">
        <div className="w-6 h-6 rounded-md bg-velvet-500 flex items-center justify-center text-sm">🦄</div>
        Unicorn
      </Link>


      {/* Right side */}
      <div className="relative flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#a8d8f0] bg-white/80 backdrop-blur-md text-black hover:bg-[#e8f5fd] transition-colors text-sm font-semibold shadow-sm"
        >
          <div className="w-5 h-5 rounded-full bg-velvet-500 flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="hidden sm:block">{userName || t('topNavAccount')}</span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-1 z-50">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4" />
                {t('topNavProfile')}
              </Link>
              {isAdmin && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-velvet-700 hover:bg-velvet-50 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </>
              )}
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('topNavSignOut')}
              </button>
            </div>
          </>
        )}
      </div>

    </header>
  )
}
