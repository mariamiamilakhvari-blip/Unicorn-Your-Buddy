'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WEARABLES = [
  { id: 'garmin', name: 'Garmin', logo: '⌚', description: 'Connect your Garmin device to sync heart rate, stress, sleep & activity data.', available: true, badge: 'Recommended' },
  { id: 'apple', name: 'Apple Watch', logo: '🍎', description: 'Apple Watch integration, coming soon.', available: false },
  { id: 'fitbit', name: 'Fitbit', logo: '🔵', description: 'Fitbit integration, coming soon.', available: false },
  { id: 'samsung', name: 'Samsung Galaxy Watch', logo: '🌀', description: 'Samsung Watch integration, coming soon.', available: false },
]

export default function SmartwatchPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  function handleContinue() {
    if (selected) localStorage.setItem('unicorn_smartwatch', selected)
    router.push('/questions')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ochre-100 text-velvet-600 text-xs font-semibold mb-4">
          Step 1 of 2, Wearable
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Connect your wearable</h1>
        <p className="text-muted-foreground mt-1.5">Sync biometric data to power your well-being insights</p>
      </div>

      <div className="space-y-3 mb-8">
        {WEARABLES.map(w => (
          <button
            key={w.id}
            onClick={() => w.available && setSelected(w.id)}
            disabled={!w.available}
            className={`w-full text-left bg-white rounded-2xl p-4 border transition-all ${
              !w.available
                ? 'opacity-50 cursor-not-allowed'
                : selected === w.id
                ? 'border-velvet-500 ring-2 ring-velvet-500/20 shadow-md'
                : 'border-border hover:border-velvet-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">{w.logo}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{w.name}</span>
                  {w.badge && <span className="px-2 py-0.5 rounded-full bg-ochre-100 text-velvet-600 text-xs font-semibold">{w.badge}</span>}
                  {!w.available && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Soon</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{w.description}</p>
              </div>
              {selected === w.id && (
                <div className="w-6 h-6 rounded-full bg-velvet-500 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          className="h-11 px-24 bg-velvet-500 text-white hover:bg-velvet-600 font-semibold rounded-xl"
        >
          {selected ? 'Connect & Continue' : 'Skip for now'} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
