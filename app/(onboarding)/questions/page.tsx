'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Question = {
  id: string
  question: string
  subtitle?: string
  type: 'single' | 'multi' | 'text'
  options?: { label: string; emoji: string }[]
}

const QUESTIONS: Question[] = [
  { id: 'genderIdentity', question: 'How do you identify?', subtitle: 'This helps us personalise your well-being experience', type: 'single', options: [{ label: 'Female', emoji: '♀️' }, { label: 'Male', emoji: '♂️' }] },
  { id: 'ageCohort', question: 'What is your age group?', subtitle: 'We calibrate recommendations by life stage', type: 'single', options: [{ label: 'Under 18', emoji: '🌱' }, { label: '18–24', emoji: '⚡' }, { label: '25–34', emoji: '🚀' }, { label: '35–44', emoji: '🌟' }, { label: '45–54', emoji: '🎯' }, { label: '55+', emoji: '🌿' }] },
  { id: 'nationality', question: 'Where are you from?', type: 'text' },
  { id: 'maritalStatus', question: 'What is your relationship status?', type: 'single', options: [{ label: 'Single', emoji: '🦋' }, { label: 'In a relationship', emoji: '💛' }, { label: 'Engaged', emoji: '💍' }, { label: 'Married', emoji: '💑' }, { label: 'Divorced', emoji: '🌿' }] },
  { id: 'relaxationTriggers', question: 'What helps you relax?', subtitle: 'Select all that apply', type: 'multi', options: [{ label: 'Music', emoji: '🎵' }, { label: 'Walking', emoji: '🚶' }, { label: 'Talking to someone', emoji: '💬' }, { label: 'Exercise', emoji: '🏋️' }, { label: 'Quiet time', emoji: '🤫' }] },
  { id: 'fatigueState', question: 'How do you usually feel after work?', subtitle: 'Your typical end-of-day state', type: 'single', options: [{ label: 'Energized', emoji: '⚡' }, { label: 'Tired', emoji: '😴' }, { label: 'Stressed', emoji: '😤' }, { label: 'Calm', emoji: '😌' }, { label: 'Unmotivated', emoji: '😶' }] },
  { id: 'microDesire', question: 'What do you most want to do right now?', type: 'single', options: [{ label: 'Fitness', emoji: '🏃' }, { label: 'Creativity', emoji: '🎨' }, { label: 'Socializing', emoji: '🫂' }, { label: 'Learning', emoji: '📚' }, { label: 'Resting', emoji: '🛋️' }] },
  { id: 'environmentalComfort', question: 'Where do you feel most at home?', type: 'single', options: [{ label: 'Nature', emoji: '🌲' }, { label: 'City', emoji: '🏙️' }, { label: 'Home', emoji: '🏡' }, { label: 'Gym', emoji: '🏋️' }, { label: 'Café', emoji: '☕' }] },
  { id: 'primaryMotivators', question: 'What motivates you most?', subtitle: 'Select all that apply', type: 'multi', options: [{ label: 'Achievement', emoji: '🏆' }, { label: 'Health', emoji: '💪' }, { label: 'Money', emoji: '💰' }, { label: 'Relationships', emoji: '❤️' }, { label: 'Personal growth', emoji: '🌱' }] },
  { id: 'stressCoping', question: 'How do you cope with stress?', subtitle: 'Select all that apply', type: 'multi', options: [{ label: 'Movement / Exercise', emoji: '🏃' }, { label: 'Music', emoji: '🎵' }, { label: 'Sleep', emoji: '💤' }, { label: 'Food / Drinks', emoji: '🍵' }, { label: 'Talking to others', emoji: '💬' }] },
  { id: 'contentFilters', question: 'What content interests you?', subtitle: 'Select all that apply', type: 'multi', options: [{ label: 'Well-being', emoji: '🧘' }, { label: 'Fashion', emoji: '👗' }, { label: 'Sports', emoji: '⚽' }, { label: 'Technology', emoji: '💻' }, { label: 'Business', emoji: '💼' }] },
  { id: 'focalPriority', question: 'What is your core focus right now?', type: 'single', options: [{ label: 'Career', emoji: '💼' }, { label: 'Fitness', emoji: '💪' }, { label: 'Emotional balance', emoji: '⚖️' }, { label: 'Relationships', emoji: '❤️' }, { label: 'Self-confidence', emoji: '✨' }] },
  { id: 'productivityWindows', question: 'When are you most productive?', subtitle: 'Select all that apply', type: 'multi', options: [{ label: 'Morning', emoji: '🌅' }, { label: 'Afternoon', emoji: '☀️' }, { label: 'Evening', emoji: '🌆' }, { label: 'Late night', emoji: '🌙' }] },
  { id: 'targetIntervention', question: 'What do you most need right now?', subtitle: 'Your immediate intention sets the tone', type: 'single', options: [{ label: 'More energy', emoji: '⚡' }, { label: 'Better mood', emoji: '😊' }, { label: 'Better focus', emoji: '🎯' }, { label: 'Less stress', emoji: '🌊' }] },
]

export default function QuestionsPage() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [textInput, setTextInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const q = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1
  const progress = ((step + 1) / QUESTIONS.length) * 100

  function getValue(id: string) {
    return answers[id] ?? (QUESTIONS.find(x => x.id === id)?.type === 'multi' ? [] : '')
  }

  function toggleOption(id: string, option: string, type: 'single' | 'multi') {
    if (type === 'single') {
      setAnswers(a => ({ ...a, [id]: option }))
    } else {
      const cur = (answers[id] as string[]) ?? []
      setAnswers(a => ({ ...a, [id]: cur.includes(option) ? cur.filter(x => x !== option) : [...cur, option] }))
    }
  }

  function canProceed() {
    if (q.type === 'text') return textInput.trim().length > 0
    if (q.type === 'single') return !!answers[q.id]
    return ((answers[q.id] as string[]) ?? []).length > 0
  }

  async function handleNext() {
    const final = q.type === 'text' ? { ...answers, [q.id]: textInput.trim() } : answers
    if (!isLast) {
      if (q.type === 'text') setAnswers(final)
      setStep(s => s + 1)
      setTextInput('')
    } else {
      setSaving(true)
      setSaveError('')
      const profile = q.type === 'text' ? final : answers
      const permissions = JSON.parse(localStorage.getItem('unicorn_permissions') ?? '{}')
      const smartwatchProvider = localStorage.getItem('unicorn_smartwatch') || null
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, permissions, smartwatchProvider }),
        })
        if (!res.ok) throw new Error('Failed to save')
        await update()
        router.push('/home')
      } catch {
        setSaveError('Failed to save your profile. Please try again.')
        setSaving(false)
      }
    }
  }

  const currentValue = getValue(q.id)

  return (
    <div className="animate-fade-in">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Question {step + 1} of {QUESTIONS.length}</span>
          <span className="text-xs font-semibold text-velvet-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-velvet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{q.question}</h2>
        {q.subtitle && <p className="text-sm text-muted-foreground mt-1">{q.subtitle}</p>}
      </div>

      {q.type === 'text' ? (
        <div className="mb-8">
          <Input placeholder="e.g. Georgian, American, French…" value={textInput} onChange={e => setTextInput(e.target.value)} className="h-12 text-base" autoFocus />
        </div>
      ) : (
        <div className={`grid gap-2.5 mb-8 ${q.options && q.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {q.options?.map(opt => {
            const isSelected = q.type === 'single'
              ? currentValue === opt.label
              : (currentValue as string[]).includes(opt.label)
            return (
              <button
                key={opt.label}
                onClick={() => toggleOption(q.id, opt.label, q.type as 'single' | 'multi')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-400/20'
                    : 'border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50/40'
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-black font-semibold' : 'text-black'}`}>{opt.label}</span>
                {isSelected && q.type === 'multi' && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {saveError && <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">{saveError}</div>}

      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center">
          <Button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="h-11 px-24 bg-velvet-500 text-white hover:bg-velvet-600 font-semibold rounded-xl disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLast ? 'Get Started' : <><span>Next</span><ChevronRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </div>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="text-sm text-muted-foreground hover:text-black transition-colors flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        )}
      </div>
    </div>
  )
}
