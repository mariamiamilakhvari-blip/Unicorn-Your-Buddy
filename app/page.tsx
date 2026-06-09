'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Menu, X, Moon, Sun } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function LandingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [dark, setDark] = useState(false)

  const STEPS = [
    { num: t('step1Num'), title: t('step1Title'), desc: t('step1Desc') },
    { num: t('step2Num'), title: t('step2Title'), desc: t('step2Desc') },
    { num: t('step3Num'), title: t('step3Title'), desc: t('step3Desc') },
  ]

  const PREMIUM_FEATURES = [
    t('pricingPremiumFeature1'),
    t('pricingPremiumFeature2'),
    t('pricingPremiumFeature3'),
  ]

  useEffect(() => {
    if (session?.user?.onboardingCompleted) {
      router.replace('/home')
    }
  }, [session, router])

  return (
    <div className={`min-h-screen bg-white text-black${dark ? ' dark' : ''}`}>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm font-black text-black dark:text-white">
          <div className="w-6 h-6 rounded-md bg-velvet-500 flex items-center justify-center text-sm">🦄</div>
          Unicorn
        </Link>

        <nav className="hidden md:flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-100 dark:border-gray-700 shadow-sm px-3 py-1.5 items-center gap-1 text-sm font-medium">
          <a href="#how-it-works" className="px-3 py-1.5 text-black dark:text-white hover:text-velvet-500 transition-colors">{t('navHowItWorks')}</a>
          <a href="#pricing" className="px-3 py-1.5 text-black dark:text-white hover:text-velvet-500 transition-colors">{t('navPricing')}</a>
          <a href="#about" className="px-3 py-1.5 text-black dark:text-white hover:text-velvet-500 transition-colors">{t('navAbout')}</a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setDark(v => !v)}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{t('navSignIn')}</Link>
          <Link href="/signup" className="text-sm font-semibold bg-velvet-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-velvet-700 transition-all">
            {t('navGetStarted')}
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setDark(v => !v)}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-700 shadow-sm text-black dark:text-white"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => setMenuOpen(v => !v)} className="p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-700 shadow-sm text-black dark:text-white">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute top-20 left-4 right-4 md:hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl px-6 py-5 flex flex-col gap-4 text-sm font-medium text-black dark:text-white">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{t('navHowItWorks')}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>{t('navPricing')}</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>{t('navAbout')}</a>
            <Link href="/login">{t('navSignIn')}</Link>
            <Link href="/signup" className="text-velvet-500 font-semibold">{t('navGetStarted')}</Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="min-h-screen bg-[#e8f0f8] dark:bg-gray-900 flex flex-col items-center justify-center text-center px-8">
        <p className="text-xs font-mono tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-6">{t('heroLabel')}</p>
        <h1 className="text-6xl md:text-8xl font-black text-black dark:text-white leading-none mb-10 max-w-3xl">
          {t('heroTitle1')}{' '}
          {t('heroTitleHighlight')}{' '}
          {t('heroTitle2')}
        </h1>
        <Link href="/signup" className="flex items-center gap-2 bg-velvet-600 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:bg-velvet-700 transition-all text-base">
          {t('heroStartFree')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-[#e8f0f8] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <p className="text-xs font-mono tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-16">{t('howLabel')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.num} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-7xl font-black text-velvet-300 dark:text-velvet-600 mb-4 leading-none">{s.num}</div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 bg-[#e8f0f8] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <p className="text-xs font-mono tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-16">{t('pricingLabel')}</p>

          <div className="flex mb-10">
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-1 flex gap-1">
              <button
                onClick={() => setPlan('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  plan === 'monthly'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {t('pricingMonthly')}
              </button>
              <button
                onClick={() => setPlan('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  plan === 'yearly'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {t('pricingYearly')}
                <span className="px-2 py-0.5 rounded-full bg-velvet-600 text-white text-xs font-bold">
                  {t('pricingSave')}
                </span>
              </button>
            </div>
          </div>

          <div className="max-w-sm">
            <div className="bg-velvet-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="text-sm font-semibold text-ochre-200 mb-2">{t('pricingPremium')}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-black">{plan === 'yearly' ? '$149' : '$14.99'}</span>
                <span className="text-ochre-200 text-sm">/ {plan === 'yearly' ? t('pricingPerYear') : t('pricingPerMonth')}</span>
              </div>
              <div className="text-ochre-200 text-sm mb-8">After your 21-day free trial · {t('pricingCancelAnytime')}</div>
              <ul className="space-y-3 mb-8">
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="h-4 w-4 text-ochre-300 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors">
                {t('pricingPremiumBtn')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="py-32 bg-[#e8f0f8] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <p className="text-xs font-mono tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-16">{t('aboutLabel')}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-black dark:text-white mb-3">{t('aboutCard2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{t('aboutCard2Body')}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-black dark:text-white mb-3">{t('aboutCard3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{t('aboutCard3Body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-velvet-500 flex items-center justify-center text-base">🦄</div>
              Unicorn Well-Being
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#pricing" className="hover:text-white transition-colors">{t('navPricing')}</a>
              <Link href="/login" className="hover:text-white transition-colors">{t('navSignIn')}</Link>
              <Link href="/signup" className="hover:text-white transition-colors">{t('navGetStarted')}</Link>
            </div>
            <p className="text-sm">{t('footerCopy')}</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
