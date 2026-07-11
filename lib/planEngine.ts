import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import {
  generateRitual,
  generateInvitation,
  generateSocialReminder,
  generateHobbyNotification,
  generateHobbyCheckIn,
  generateHobbyCompletion,
  type HobbyStage,
} from '@/lib/ai'

const MS_24H = 24 * 60 * 60 * 1000
const MS_48H = 48 * 60 * 60 * 1000
const MS_7D  =  7 * 24 * 60 * 60 * 1000
const MS_10D = 10 * 24 * 60 * 60 * 1000
const MS_14D = 14 * 24 * 60 * 60 * 1000

export function calcHobbyStage(
  startedAt: Date,
  durationMonths: number,
  lastEngagementAt: Date | null,
): HobbyStage {
  const now = Date.now()
  // Lapse takes priority: no engagement for 10+ days (only if user has engaged before)
  if (lastEngagementAt && now - lastEngagementAt.getTime() >= MS_10D) return 'lapse'
  const totalMs = durationMonths * 30 * MS_24H
  const progress = Math.min((now - startedAt.getTime()) / totalMs, 1)
  if (progress < 0.15) return 'early'
  if (progress < 0.40) return 'building'
  if (progress < 0.70) return 'plateau'
  return 'late'
}

export type PlanResult = { hobby: unknown; ritual: unknown } | null

// Per-user notification engine. Called both by the client-facing GET /api/plan
// (self-service, on app foreground) and by the daily cron (all hobby users).
// Timestamp checks live here so both paths share one source of truth.
export async function evaluateUserPlan(userId: string): Promise<PlanResult> {
  await connectDB()
  const user = await User.findById(userId)
  if (!user) return null

  const now = new Date()
  const profile = user.profile as Record<string, string | string[]>
  const plan = user.wellbeingPlan

  // ── Ritual (every 48h) — works for all users ──────────────────────────────
  const [lastRitualNotif, ritualHistory, cycleCount] = await Promise.all([
    Notification.findOne({ userId: user._id, type: 'ritual' }).sort({ createdAt: -1 }),
    Notification.find({ userId: user._id, type: 'ritual' })
      .sort({ createdAt: -1 }).limit(5).select('body'),
    Notification.countDocuments({ userId: user._id, type: 'ritual' }),
  ])

  const lastRitualAt = lastRitualNotif?.createdAt ? new Date(lastRitualNotif.createdAt) : new Date(0)
  const ritualDue = now.getTime() - lastRitualAt.getTime() >= MS_48H

  if (ritualDue) {
    const historyBodies = ritualHistory.map((n: { body: string }) => n.body)
    const ritual = await generateRitual(profile, user.name, historyBodies, cycleCount)
    await Notification.create({
      userId: user._id,
      type: 'ritual',
      title: ritual.title,
      body: ritual.body,
      scheduledFor: now,
    })
    if (plan) {
      await User.findByIdAndUpdate(user._id, {
        'wellbeingPlan.ritualIndex': (plan.ritualIndex ?? 0) + 1,
        'wellbeingPlan.lastRitualAt': now,
      })
    }
  }

  // ── Invitation + hobby (only if wellbeingPlan exists) ─────────────────────
  if (plan) {
    const lastInvitationAt = plan.lastInvitationAt ? new Date(plan.lastInvitationAt) : new Date(0)
    const invitationDue = now.getTime() - lastInvitationAt.getTime() >= MS_14D

    if (invitationDue) {
      const invitation = await generateInvitation(profile)
      await Notification.create({
        userId: user._id,
        type: 'invitation',
        title: invitation.title,
        body: invitation.body,
        scheduledFor: now,
      })
      await User.findByIdAndUpdate(user._id, {
        'wellbeingPlan.lastInvitationAt': now,
        'wellbeingPlan.invitationIndex': (plan.invitationIndex ?? 0) + 1,
      })
    }

    if (!invitationDue) {
      const msSinceInvitation = now.getTime() - lastInvitationAt.getTime()
      if (msSinceInvitation >= MS_7D && msSinceInvitation < MS_14D) {
        const alreadySent = await Notification.findOne({
          userId: user._id,
          type: 'reminder',
          category: 'social',
          createdAt: { $gte: lastInvitationAt },
        })
        if (!alreadySent) {
          const socialReminder = await generateSocialReminder()
          await Notification.create({
            userId: user._id,
            type: 'reminder',
            category: 'social',
            title: socialReminder.title,
            body: socialReminder.body,
            scheduledFor: now,
          })
        }
      }
    }

    // Only active hobbies get weekly encouragement. Paused/completed are skipped
    // (missing status is treated as active for legacy plans).
    const hobbyActive = plan.hobby?.name && plan.hobby?.startedAt &&
      plan.hobby?.status !== 'paused' && plan.hobby?.status !== 'completed'
    if (hobbyActive) {
      // Completion: once the planned duration has elapsed, mark the hobby
      // completed, send ONE final congratulations, and stop weekly nudges.
      const startedAt = new Date(plan.hobby.startedAt)
      const totalMs = (plan.hobby.duration ?? 6) * 30 * MS_24H
      if (now.getTime() - startedAt.getTime() >= totalMs) {
        await User.findByIdAndUpdate(user._id, { 'wellbeingPlan.hobby.status': 'completed' })
        const alreadyCongratulated = await Notification.findOne({
          userId: user._id, type: 'hobby', category: 'completed',
        })
        if (!alreadyCongratulated) {
          const done = await generateHobbyCompletion(plan.hobby.name, profile)
          await Notification.create({
            userId: user._id,
            type: 'hobby',
            category: 'completed',
            title: done.title,
            body: done.body,
            scheduledFor: now,
          })
        }
        const currentRitualDone = await Notification.findOne({ userId: user._id, type: 'ritual' }).sort({ createdAt: -1 })
        return { hobby: { ...plan.hobby, status: 'completed' }, ritual: currentRitualDone }
      }

      const [lastHobbyNotif, lastEngagedNotif] = await Promise.all([
        Notification.findOne({ userId: user._id, type: 'hobby' }).sort({ createdAt: -1 }),
        Notification.findOne({ userId: user._id, type: 'hobby', completedAt: { $exists: true } }).sort({ completedAt: -1 }),
      ])

      // Resuming a paused hobby resets the 7-day clock from the resume date.
      const lastNotifAt = lastHobbyNotif?.createdAt ? new Date(lastHobbyNotif.createdAt) : new Date(0)
      const resumedAt = plan.hobby?.resumedAt ? new Date(plan.hobby.resumedAt) : null
      const lastHobbyAt = resumedAt && resumedAt.getTime() > lastNotifAt.getTime() ? resumedAt : lastNotifAt
      const lastEngagementAt = lastEngagedNotif?.completedAt ? new Date(lastEngagedNotif.completedAt) : null

      const stage = calcHobbyStage(
        new Date(plan.hobby.startedAt),
        plan.hobby.duration ?? 6,
        lastEngagementAt,
      )

      // Fixed 7-day cadence to match the "every 7 days" promise made in chat
      // (see ai.ts hobby check-in copy). Stage now only tunes tone, not timing:
      // a lapse still gets a gentle no-question re-entry instead of a check-in.
      const hobbyDue = now.getTime() - lastHobbyAt.getTime() >= MS_7D

      if (hobbyDue) {
        const hobbyNotif = stage === 'lapse'
          ? await generateHobbyNotification(plan.hobby.name, profile, stage)
          : await generateHobbyCheckIn(plan.hobby.name, profile, stage)
        await Notification.create({
          userId: user._id,
          type: 'hobby',
          category: stage,
          title: hobbyNotif.title,
          body: hobbyNotif.body,
          scheduledFor: now,
        })
      }
    }
  }

  const currentRitual = await Notification.findOne({ userId: user._id, type: 'ritual' }).sort({ createdAt: -1 })

  return { hobby: plan?.hobby ?? null, ritual: currentRitual }
}
