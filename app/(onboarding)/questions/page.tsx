'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, Check, Loader2 } from 'lucide-react'
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

const COUNTRIES: string[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Brazzaville)', 'Congo (Kinshasa)',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Other',
]

const QUESTIONS: Question[] = [
  { id: 'genderIdentity', question: 'How do you identify?', subtitle: 'This helps us personalise your experience', type: 'single', options: [{ label: 'Male' }, { label: 'Female' }, { label: 'Non-binary' }] },
  { id: 'ageCohort', question: 'What is your age group?', type: 'single', options: [{ label: '18–24' }, { label: '25–34' }, { label: '35–44' }, { label: '45–54' }, { label: '55+' }] },
  { id: 'country', question: 'Where do you live?', type: 'select', options: COUNTRIES.map(c => ({ label: c })) },
  { id: 'occupation', question: 'What is your occupation?', type: 'select', options: [
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
  { id: 'maritalStatus', question: 'What is your relationship status?', type: 'single', options: [
    { label: 'Single' },
    { label: 'In a relationship' },
    { label: 'Married' },
    { label: 'Divorced / Separated' },
  ]},
  { id: 'emotionalState', question: 'Where are you right now emotionally?', type: 'single', options: [
    { label: 'Lost and confused' },
    { label: 'Hurt or heartbroken' },
    { label: 'Angry and frustrated' },
    { label: 'Anxious and overthinking' },
  ]},
  { id: 'needFromBuddy', question: 'What do you need from Unicorn?', type: 'single', options: [
    { label: 'I just need someone to listen' },
    { label: 'I want honest advice, even if it\'s hard to hear' },
    { label: 'Help me understand what I\'m feeling' },
  ]},
  { id: 'timeframe', question: 'How long has this been going on?', type: 'single', options: [
    { label: 'Just happened' },
    { label: 'A few days' },
    { label: 'Weeks' },
    { label: 'A long time: months or more' },
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
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
        <div className="mb-8 relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(v => !v)}
            className={`w-full h-12 px-4 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-all ${
              dropdownOpen
                ? 'border-sky-400 ring-2 ring-sky-400/20 bg-sky-50'
                : 'border-sky-200 bg-white hover:border-sky-400'
            }`}
          >
            <span className={currentValue ? 'text-gray-900' : 'text-gray-400'}>
              {(currentValue as string) || 'Select an option from the list below'}
            </span>
            <ChevronDown className={`h-4 w-4 text-sky-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-sky-300 rounded-xl shadow-xl shadow-sky-200/60 overflow-hidden max-h-72 overflow-y-auto">
              {q.options?.map(opt => {
                const isChosen = currentValue === opt.label
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setAnswers(a => ({ ...a, [q.id]: opt.label }))
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3.5 text-sm flex items-center justify-between transition-colors border-b border-sky-50 last:border-0 ${
                      isChosen
                        ? 'bg-sky-100 text-sky-800 font-semibold'
                        : 'text-gray-800 hover:bg-sky-100 hover:text-sky-800'
                    }`}
                  >
                    {opt.label}
                    {isChosen && <Check className="h-4 w-4 text-sky-600 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
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
