'use client'
import { useEffect, useState } from 'react'
import { Zap, CheckCircle2, Calendar, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Category = 'social' | 'business' | 'relationships'
type Challenge = { id: string; title: string; description: string; category: Category; startDate: string; checkIns: string[] }

const COLORS: Record<Category, string> = {
  social: 'from-blue-400 to-blue-600',
  business: 'from-violet-400 to-violet-600',
  relationships: 'from-rose-400 to-rose-600',
}
const EMOJI: Record<Category, string> = { social: '🫂', business: '💼', relationships: '❤️' }
const BG: Record<Category, string> = {
  social: 'bg-blue-50 text-blue-700',
  business: 'bg-violet-50 text-violet-700',
  relationships: 'bg-rose-50 text-rose-700',
}

type DbChallenge = { _id: string; title: string; description: string; category: Category; startDate: string; checkIns: string[] }
function mapDb(c: DbChallenge): Challenge {
  return { id: String(c._id), title: c.title, description: c.description, category: c.category, startDate: c.startDate, checkIns: (c.checkIns ?? []).map(String) }
}

export default function ChallengesPage() {
  const { t } = useLanguage()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [busy, setBusy] = useState(false)

  // DB is the single source of truth. Load from the API on mount, refetch after
  // every mutation. No localStorage authority.
  async function refresh() {
    try {
      const res = await fetch('/api/challenges')
      const data = await res.json()
      setChallenges(((data.challenges ?? []) as DbChallenge[]).map(mapDb))
    } catch {}
  }

  useEffect(() => { refresh() }, [])

  async function newChallenge() {
    setBusy(true)
    try {
      const cats: Category[] = ['social', 'business', 'relationships']
      const category = cats[Math.floor(Math.random() * cats.length)]
      const res = await fetch('/api/challenges', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refresh()
    } catch {} finally { setBusy(false) }
  }

  async function checkIn(id: string) {
    try {
      const res = await fetch('/api/challenges', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: id, action: 'checkin' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {}
    // Refetch so the UI reflects exactly what the DB stored.
    await refresh()
  }

  function isToday(c: Challenge) {
    const today = new Date(); today.setHours(0,0,0,0)
    return c.checkIns.some(d => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.getTime() === today.getTime() })
  }

  const active = challenges[0]
  const daysElapsed = active ? Math.floor((Date.now() - new Date(active.startDate).getTime()) / 86400000) : 0
  const daysLeft = active ? Math.max(0, 21 - daysElapsed) : 0
  const progress = active ? Math.min((active.checkIns.length / 21) * 100, 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('challengesTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('challengesSubtitle')}</p>
        </div>
        <Button
          onClick={newChallenge}
          disabled={busy}
          className="bg-ochre-400 text-black hover:bg-velvet-500 hover:text-white rounded-xl h-10 px-5 font-semibold disabled:opacity-50 "
        >
          <Zap className="h-4 w-4 mr-2" /> {t('challengesNew')}
        </Button>
      </div>

      {!active ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-border text-center max-w-lg mx-auto">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('challengesNoActive')}</h3>
          <p className="text-muted-foreground mb-6">{t('challengesNoActiveDesc')}</p>
          <Button onClick={newChallenge} className="bg-ochre-400 text-black hover:bg-velvet-500 hover:text-white rounded-xl px-6">
            {t('challengesGetFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: challenge card (3/5) */}
          <div className="xl:col-span-3 space-y-6">
            <div className={`bg-gradient-to-br ${COLORS[active.category]} rounded-2xl p-8 text-white shadow-lg`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{EMOJI[active.category]}</span>
                <span className={`px-3 py-1 rounded-full bg-white/20 text-sm font-semibold capitalize`}>{active.category}</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{active.title}</h2>
              <p className="opacity-90 leading-relaxed mb-6">{active.description}</p>
              <div className="flex items-center gap-6 text-sm opacity-80 mb-6">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {t('challengesDayLabel')} {daysElapsed + 1} {t('challengesOfLabel')} 21</span>
                <span>{daysLeft} {t('challengesDays')} {t('challengesRemainingLabel')}</span>
                <span>{active.checkIns.length} {t('challengesCheckInsLabel')}</span>
              </div>
              <button
                onClick={() => checkIn(active.id)}
                disabled={isToday(active)}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all ${isToday(active) ? 'bg-white/30 cursor-default' : 'bg-white/20 hover:bg-white/30 active:scale-95'}`}
              >
                {isToday(active)
                  ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> {t('challengesCheckedToday')}</span>
                  : t('challengesCheckInToday')}
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t('challengesDaysElapsed'), value: daysElapsed + 1, icon: '📅' },
                { label: t('challengesCheckInsCount'), value: active.checkIns.length, icon: '✅' },
                { label: t('challengesDaysLeftLabel'), value: daysLeft, icon: '⏳' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-border text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: progress (2/5) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-ochre-400" /> {t('challengesYourProgress')}
              </h3>
              <div className="flex justify-center mb-6">
                <ProgressRing progress={progress} size={120} label={t('challengesProgress')} />
              </div>
              <HeatmapCalendar
                startDate={new Date(active.startDate)}
                checkIns={active.checkIns.map(d => new Date(d))}
                totalDays={21}
              />
            </div>

            {/* Category badge */}
            <div className={`rounded-2xl p-4 ${BG[active.category]}`}>
              <p className="font-semibold text-sm">{EMOJI[active.category]} {active.category.charAt(0).toUpperCase() + active.category.slice(1)} Challenge</p>
              <p className="text-xs opacity-80 mt-1">{t('challengesConsistency')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
