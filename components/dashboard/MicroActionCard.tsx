'use client'
import { Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const MICRO_ACTIONS: Record<string, string[]> = {
  'More energy': ['Drink a tall glass of water right now ☕', 'Do 10 jumping jacks to wake up ⚡', 'Take 5 deep breaths, in through nose, out through mouth 🌬️'],
  'Better mood': ['Write 3 things you\'re grateful for today 🌟', 'Listen to your favourite song right now 🎵', 'Send a kind message to someone you care about 💌'],
  'Better focus': ['Clear your desk, a clear space is a clear mind ✨', 'Write your top 3 priorities for today 📋', 'Turn off notifications for the next 25 minutes 🔕'],
  'Less stress': ['Try box breathing: inhale 4s, hold 4s, exhale 4s 🌊', 'Step outside for 5 minutes of fresh air 🌿', 'Write down what\'s on your mind, then close the notebook 📓'],
}

const DEFAULT_ACTIONS = [
  'Move your body for 10 minutes today 🏃',
  'Drink a glass of water now 💧',
  'Take a deep breath and smile 😊',
]

interface MicroActionCardProps {
  targetIntervention?: string
}

export function MicroActionCard({ targetIntervention }: MicroActionCardProps) {
  const { t } = useLanguage()
  const pool = (targetIntervention && MICRO_ACTIONS[targetIntervention]) || DEFAULT_ACTIONS
  const action = pool[new Date().getDate() % pool.length]

  return (
    <div className="bg-velvet-500 rounded-2xl p-5 text-white shadow-lg shadow-velvet-100">
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-xl shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wide">{t('homeMicroAction')}</p>
          <p className="font-semibold leading-snug">{action}</p>
        </div>
      </div>
    </div>
  )
}
