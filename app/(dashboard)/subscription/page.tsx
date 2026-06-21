'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Crown, Sparkles, Zap, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function SubscriptionContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('none')

  // Real free tier is 5 messages with Buddy, not a time-based trial.
  useEffect(() => {
    fetch('/api/chat')
      .then(r => r.json())
      .then(data => {
        setRemaining(data.remaining ?? null)
        setIsPaid(data.isPaid ?? false)
        setUserPlan(data.subscriptionPlan ?? 'none')
      })
      .catch(() => {})
  }, [])

  // Dodo's webhook can't reach localhost in dev, so confirm payment directly
  // with the API as a fallback the moment the user lands back here.
  useEffect(() => {
    const success = searchParams.get('success')
    const subscriptionId = searchParams.get('subscription_id')
    if (success === 'true' && subscriptionId) {
      fetch('/api/dodo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === 'active') setIsPaid(true)
        })
        .catch(() => {})
    }
  }, [searchParams])

  const MONTHLY_PRICE = 12.99
  const YEARLY_PRICE = 99.76
  const monthlyEquivalent = (YEARLY_PRICE / 12).toFixed(2)
  const savingsAmount = (MONTHLY_PRICE * 12 - YEARLY_PRICE).toFixed(2)
  const savings = Math.round(((MONTHLY_PRICE * 12 - YEARLY_PRICE) / (MONTHLY_PRICE * 12)) * 100)
  const yearlyNote = t('subYearlyNote').replace('{monthly}', `$${monthlyEquivalent}`).replace('{save}', `$${savingsAmount}`)

  const FEATURES = [
    { icon: '💬', text: t('subPremiumFeature1') },
    { icon: '🧵', text: t('subPremiumFeature2') },
    { icon: '💞', text: t('subPremiumFeature3') },
  ]

  async function subscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/dodo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="-mx-6 -my-8 px-6 py-8 bg-gradient-to-b from-[#cce6f7] via-[#ddf0fb] to-[#e8f5fd] min-h-[calc(100vh-5rem)] space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to chat
        </button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('subTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('subSubtitle')}</p>
      </div>

      {/* Free-message status banner */}
      {remaining !== null && (
        <div className="bg-white rounded-2xl p-5 text-slate-800 flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
          <div className="bg-velvet-50 p-3 rounded-xl shrink-0">
            <Sparkles className="h-6 w-6 text-velvet-500" />
          </div>
          <div>
            {isPaid ? (
              <p className="font-semibold">{t('subPremiumActiveBadge')}</p>
            ) : (
              <>
                <p className="font-semibold">{remaining} {t('subFreeMessagesLeft')}</p>
                <p className="text-sm text-slate-600 mt-0.5">{t('subFreeMessagesNote')}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plan toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-xl p-1 flex gap-1 w-64">
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${plan === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-muted-foreground'}`}
          >
            {t('subMonthly')}
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${plan === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-muted-foreground'}`}
          >
            {t('subYearly')}
            <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded-full bg-sage-500 text-white text-[9px] font-bold">
              -{savings}%
            </span>
          </button>
        </div>
      </div>

      {/* Premium card */}
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-br from-[#cce6f7] via-[#ddf0fb] to-[#e8f5fd] rounded-2xl p-8 text-slate-800 shadow-xl shadow-sky-100 relative overflow-hidden border border-sky-100">
          <div className="absolute top-4 right-4">
            <Crown className="h-8 w-8 text-velvet-500/30" />
          </div>
          <div className="mb-6">
            <span className="text-sm font-semibold text-velvet-600 uppercase tracking-wide">{t('subPremium')}</span>
            <div className="mt-2">
              <span className="text-4xl font-black text-slate-900">
                {plan === 'yearly' ? `$${YEARLY_PRICE}` : `$${MONTHLY_PRICE}`}
              </span>
              <span className="text-slate-500 ml-1">/ {plan === 'yearly' ? t('subYear') : t('subMonth')}</span>
            </div>
            {plan === 'yearly'
              ? <p className="text-sage-600 text-sm font-semibold mt-1">{yearlyNote}</p>
              : <p className="text-slate-500 text-sm mt-1">{t('subMonthlyNote')}</p>}
          </div>

          <div className="space-y-3 mb-8">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-2.5">
                <span className="text-base shrink-0">{f.icon}</span>
                <span className="text-sm text-slate-600 leading-tight">{f.text}</span>
              </div>
            ))}
          </div>

          {isPaid && userPlan === plan ? (
            <div className="w-full h-12 flex items-center justify-center rounded-xl bg-white/60 text-velvet-600 font-bold text-base">
              {t('subCurrentPlan')}
            </div>
          ) : (
            <Button
              onClick={subscribe}
              disabled={loading}
              className="w-full h-12 bg-velvet-500 text-white hover:bg-velvet-600 font-bold rounded-xl text-base shadow-lg"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
              {t('subStartAfterTrial')} · {plan === 'yearly' ? `$${YEARLY_PRICE}/yr` : `$${MONTHLY_PRICE}/mo`}
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t('subSecure')}
      </p>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  )
}
