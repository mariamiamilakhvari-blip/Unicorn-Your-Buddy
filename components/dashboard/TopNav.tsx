'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { clearUser, getUser } from '@/lib/mock-auth'
import { signOut as nextAuthSignOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [userName, setUserName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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
      <Link href="/home" className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm font-black text-black">
        <div className="w-6 h-6 rounded-md bg-velvet-500 flex items-center justify-center text-sm">🦄</div>
        Unicorn
      </Link>

      {/* Desktop nav — pill container matching landing page */}
      <nav className="hidden md:flex bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm px-3 py-1.5 items-center gap-1 text-sm font-medium">
        {NAV_LINKS.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                active
                  ? 'text-velvet-500 font-semibold bg-velvet-50'
                  : 'text-black hover:text-velvet-500'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div className="relative flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-ochre-300 bg-white/80 backdrop-blur-md text-black hover:bg-ochre-50 transition-colors text-sm font-semibold shadow-sm"
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

      {/* Mobile bottom nav row */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-2 flex justify-around z-50">
        {NAV_LINKS.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                active ? 'bg-velvet-50 text-velvet-500 font-semibold' : 'text-gray-500 hover:text-black'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
