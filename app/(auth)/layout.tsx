'use client'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-velvet-600 flex-col p-12 text-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-velvet-500 flex items-center justify-center text-lg">🦄</div>
            <span className="text-xl font-bold">Unicorn</span>
          </Link>
          <LanguageSwitcher variant="dark" />
        </div>

        <div className="flex-1 flex items-center justify-center px-12">
          <h2 className="text-6xl font-black leading-tight text-center">Start conversation with your Unicorn</h2>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-velvet-500 flex items-center justify-center text-base">🦄</div>
              <span className="text-lg font-bold text-black">Unicorn</span>
            </Link>
            <LanguageSwitcher />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
