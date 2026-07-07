'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Menu, X, Moon, Sun, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface LandingPageProps {
  isLoggedIn: boolean
  isAdmin: boolean
  isPaid?: boolean
}

export function LandingPage({ isLoggedIn, isAdmin, isPaid = false }: LandingPageProps) {
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [dark, setDark] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const MONTHLY_PRICE = 12.99
  const YEARLY_PRICE = 99.76
  const landingSavings = Math.round(((MONTHLY_PRICE * 12 - YEARLY_PRICE) / (MONTHLY_PRICE * 12)) * 100)

  async function handleSubscribe() {
    setSubscribing(true)
    try {
      const res = await fetch('/api/dodo/checkout', { method: 'POST' })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setSubscribing(false)
    }
  }

  const STEPS = [
    { num: t('step1Num'), title: t('step1Title'), desc: t('step1Desc') },
    { num: t('step2Num'), title: t('step2Title'), desc: t('step2Desc') },
    { num: t('step3Num'), title: t('step3Title'), desc: t('step3Desc') },
  ]

  const PREMIUM_FEATURES = [
    t('pricingPremiumFeature1'),
    t('pricingPremiumFeature2'),
  ]

  return (
    <div className={`min-h-screen bg-white text-black${dark ? ' dark' : ''}`}>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between bg-white/70 dark:bg-gray-900/80 backdrop-blur-md border-b border-sky-100/50 dark:border-gray-700">
        <Link href="/" className="flex items-center gap-2 font-black text-black dark:text-white">
          <div className="w-8 h-8 rounded-full bg-velvet-600 flex items-center justify-center text-sm">🦄</div>
          Unicorn
        </Link>

        <nav className="hidden md:flex bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-full border border-sky-100 dark:border-gray-700 shadow-sm px-3 py-1.5 items-center gap-1 text-sm font-medium absolute left-1/2 -translate-x-1/2">
          <a href="#how-it-works" className="px-3 py-1.5 text-slate-700 dark:text-white hover:text-velvet-500 transition-colors">{t('navHowItWorks')}</a>
          <a href="#pricing" className="px-3 py-1.5 text-slate-700 dark:text-white hover:text-velvet-500 transition-colors">{t('navPricing')}</a>
          <a href="#about" className="px-3 py-1.5 text-slate-700 dark:text-white hover:text-velvet-500 transition-colors">{t('navAbout')}</a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setDark(v => !v)}
            className="p-2 rounded-full border border-sky-200 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 text-slate-700 dark:text-white hover:bg-sky-50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-velvet-200 bg-velvet-50 text-velvet-700 hover:bg-velvet-100 transition-colors">
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link href="/home" className="text-sm font-semibold bg-velvet-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-velvet-700 transition-all">
                Go to app
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-full border border-sky-200 dark:border-gray-600 bg-white/80 dark:bg-gray-900/80 text-slate-800 dark:text-white hover:bg-sky-50 transition-colors">{t('navSignIn')}</Link>
              <Link href="/signup" className="text-sm font-semibold bg-velvet-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-velvet-700 transition-all">
                {t('navGetStarted')}
              </Link>
            </>
          )}
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
            {isLoggedIn ? (
              <>
                {isAdmin && <Link href="/admin" className="text-velvet-700 font-semibold flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />Admin</Link>}
                <Link href="/home" className="text-velvet-500 font-semibold">Go to app</Link>
              </>
            ) : (
              <>
                <Link href="/login">{t('navSignIn')}</Link>
                <Link href="/signup" className="text-velvet-500 font-semibold">{t('navGetStarted')}</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="min-h-screen bg-gradient-to-b from-[#cce6f7] via-[#ddf0fb] to-[#e8f5fd] dark:bg-gray-900 flex flex-col items-center justify-center text-center px-8">
        <p className="text-xs font-mono tracking-widest text-sky-400 dark:text-sky-500 uppercase mb-6">{t('heroLabel')}</p>
        <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white leading-tight mb-6 max-w-3xl">
          {t('heroTitle1')}{' '}
          <span className="text-velvet-600">{t('heroTitleHighlight')}</span>{' '}
          {t('heroTitle2')}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 max-w-xl leading-relaxed">
          {t('heroSubtitle')}
        </p>
        <Link href="/signup" className="mt-12 flex items-center gap-2 bg-velvet-600 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:bg-velvet-700 transition-all text-base">
          {t('heroStartFree')} <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-sm text-sky-400 dark:text-sky-500">{t('heroFreeNote')}</p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-[#ddeefa] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <p className="text-xs font-mono tracking-widest text-sky-400 dark:text-sky-500 uppercase mb-16">{t('howLabel')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.num} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-7xl font-black text-velvet-700 dark:text-velvet-400 mb-4 leading-none">{s.num}</div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 bg-[#ddeefa] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <p className="text-xs font-mono tracking-widest text-sky-400 dark:text-sky-500 uppercase mb-16">{t('pricingLabel')}</p>

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
                  Save {landingSavings}%
                </span>
              </button>
            </div>
          </div>

          <div className="max-w-lg">
            {/* Base Premium */}
            <div className="bg-velvet-700 rounded-2xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-velvet-600 rounded-full -translate-y-1/3 translate-x-1/4" />
              <div className="text-sm font-bold text-white mb-3">{t('pricingPremium')}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-black">{plan === 'yearly' ? `$${YEARLY_PRICE}` : `$${MONTHLY_PRICE}`}</span>
                <span className="text-white/70 text-sm">/ {plan === 'yearly' ? t('pricingPerYear') : t('pricingPerMonth')}</span>
              </div>
              <div className="text-sky-300 text-sm mb-8">{t('pricingCancelAnytime')}</div>
              <ul className="space-y-3 mb-10">
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="h-4 w-4 text-sky-300 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {isPaid ? (
                <div className="mt-3 w-full text-center py-3.5 rounded-full bg-white/10 border border-white/20 text-white/80 font-bold">
                  ✓ Current plan
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="mt-3 block w-full text-center py-3.5 rounded-full bg-velvet-500 border border-white/30 text-white font-bold hover:bg-velvet-400 transition-colors disabled:opacity-60"
                >
                  {subscribing ? 'Loading…' : 'Buy Premium'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="py-32 bg-[#ddeefa] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <p className="text-xs font-mono tracking-widest text-sky-400 dark:text-sky-500 uppercase mb-6">{t('aboutLabel')}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t('aboutCard2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{t('aboutCard2Body')}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t('aboutCard3Title')}</h3>
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
              Unicorn, Your Buddy
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
