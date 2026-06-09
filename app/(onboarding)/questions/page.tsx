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
  type: 'single' | 'multi' | 'text' | 'select'
  options?: { label: string; emoji?: string }[]
}

const QUESTIONS: Question[] = [
  { id: 'genderIdentity', question: 'How do you identify?', subtitle: 'This helps us personalise your well-being experience', type: 'single', options: [{ label: 'Female' }, { label: 'Male' }] },
  { id: 'ageCohort', question: 'What is your age group?', subtitle: 'We calibrate recommendations by life stage', type: 'single', options: [{ label: 'Under 18' }, { label: '18–24' }, { label: '25–34' }, { label: '35–44' }, { label: '45–54' }, { label: '55+' }] },
  { id: 'occupation', question: 'What is your occupation?', subtitle: 'Select an option from the dropdown list below', type: 'select', options: [
    { label: 'Student' },
    { label: 'Healthcare & Medical' },
    { label: 'Technology & Engineering' },
    { label: 'Business & Finance' },
    { label: 'Education & Teaching' },
    { label: 'Creative & Arts & Design' },
    { label: 'Legal & Law' },
    { label: 'Marketing & Communications' },
    { label: 'Sales & Retail' },
    { label: 'Management & Executive' },
    { label: 'Entrepreneur & Self-employed' },
    { label: 'Government & Public sector' },
    { label: 'Non-profit & Social work' },
    { label: 'Hospitality & Tourism' },
    { label: 'Construction & Trades' },
    { label: 'Manufacturing & Production' },
    { label: 'Agriculture & Farming' },
    { label: 'Military & Defense' },
    { label: 'Sports & Fitness' },
    { label: 'Science & Research' },
    { label: 'Homemaker & Caregiver' },
    { label: 'Retired' },
    { label: 'Unemployed & Job seeking' },
    { label: 'Other' },
  ]},
  { id: 'energyEndOfDay', question: 'What does your energy feel like by end of day?', type: 'single', options: [
    { label: "I'm usually drained and need to decompress" },
    { label: "I'm restless and need to wind down actively" },
    { label: "I fluctuate: some days high, some days flat" },
    { label: "I'm fine but running on autopilot" },
  ]},
  { id: 'neglectedArea', question: 'Which area of your life feels most neglected right now?', type: 'single', options: [
    { label: 'My relationships and social life' },
    { label: 'My health and physical energy' },
    { label: 'My personal growth and creativity' },
    { label: 'My inner calm and sense of purpose' },
  ]},
  { id: 'preferExperience', question: 'How do you prefer to experience?', type: 'single', options: [
    { label: 'Making something with my hands' },
    { label: 'Learning and expanding my knowledge' },
    { label: 'Movement and physical challenge' },
    { label: 'Experiences and meeting new people' },
  ]},
  { id: 'nudgeType', question: 'What kind of nudge actually moves you?', type: 'single', options: [
    { label: 'A quiet reminder' },
    { label: 'A specific small action I can do in 5 minutes' },
    { label: 'Challenge me to do something uncomfortable' },
    { label: 'Push me gently out of my comfort zone' },
  ]},
  { id: 'betterLife', question: 'What would a better version of your life feel like?', type: 'single', options: [
    { label: 'More present with the people I love' },
    { label: 'More energized and physically alive' },
    { label: 'More creative and mentally stimulated' },
    { label: 'More at peace with where I am right now' },
  ]},
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
    if (q.type === 'select') return !!answers[q.id]
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
          <Input placeholder="Type your answer…" value={textInput} onChange={e => setTextInput(e.target.value)} className="h-12 text-base" autoFocus />
        </div>
      ) : q.type === 'select' ? (
        <div className="mb-8">
          <select
            value={currentValue as string}
            onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
            className="w-full h-12 px-4 rounded-xl border border-sky-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select an occupation…</option>
            {q.options?.map(opt => (
              <option key={opt.label} value={opt.label}>{opt.label}</option>
            ))}
          </select>
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
