'use client'
import { useState } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toast } from '@/lib/use-toast'

interface Milestone {
  stage: string
  title: string
  targetMonth: number
  completedAt?: string | null
}

interface MilestoneTrackerProps {
  hobbyName: string
  hobbyIcon: string
  startDate: string
  milestones: Milestone[]
  durationMonths: 6 | 9
  onUpdate: (stage: string, completed: boolean) => Promise<void>
}

export function MilestoneTracker({ hobbyName, hobbyIcon, startDate, milestones, durationMonths, onUpdate }: MilestoneTrackerProps) {
  const [updatingStage, setUpdatingStage] = useState<string | null>(null)

  const months = Array.from({ length: durationMonths }, (_, i) => i + 1)

  async function toggle(stage: string, currentlyCompleted: boolean) {
    setUpdatingStage(stage)
    await onUpdate(stage, !currentlyCompleted)
    toast({ title: !currentlyCompleted ? '✅ Milestone completed!' : 'Milestone marked incomplete' })
    setUpdatingStage(null)
  }

  const start = new Date(startDate)
  const weeksSinceStart = Math.floor((Date.now() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const completedCount = milestones.filter(m => !!m.completedAt).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-ochre-50 border border-ochre-100 flex items-center justify-center text-2xl">
          {hobbyIcon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{hobbyName}</h3>
          <p className="text-xs text-muted-foreground">Week {weeksSinceStart + 1} · {completedCount}/{milestones.length} milestones</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-velvet-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / milestones.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{Math.round((completedCount / milestones.length) * 100)}% complete</p>
      </div>

      {months.map(m => {
        const monthMilestones = milestones.filter(ms => ms.targetMonth === m)
        if (!monthMilestones.length) return null
        return (
          <div key={m} className="mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Month {m}
            </h4>
            <div className="space-y-2">
              {monthMilestones.map(ms => {
                const done = !!ms.completedAt
                const updating = updatingStage === ms.stage
                return (
                  <button
                    key={ms.stage}
                    onClick={() => toggle(ms.stage, done)}
                    disabled={updating}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      done
                        ? 'bg-sage-50 border-sage-200'
                        : 'bg-white border-border hover:border-ochre-200'
                    }`}
                  >
                    {updating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />
                    ) : done ? (
                      <CheckCircle2 className="h-5 w-5 text-sage-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${done ? 'text-sage-700 line-through opacity-70' : 'text-gray-800'}`}>
                      {ms.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
