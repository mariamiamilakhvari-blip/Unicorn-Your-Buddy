import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import {
  generateRitual,
  generateInvitation,
  generateSocialReminder,
  generateHobbyNotification,
  generateHobbyCheckIn,
  type HobbyStage,
} from '@/lib/ai'

const MS_24H = 24 * 60 * 60 * 1000
const MS_48H = 48 * 60 * 60 * 1000
const MS_7D  =  7 * 24 * 60 * 60 * 1000
const MS_10D = 10 * 24 * 60 * 60 * 1000
const MS_14D = 14 * 24 * 60 * 60 * 1000

function calcHobbyStage(
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

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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

      if (plan.hobby?.name && plan.hobby?.startedAt) {
        const [lastHobbyNotif, lastEngagedNotif] = await Promise.all([
          Notification.findOne({ userId: user._id, type: 'hobby' }).sort({ createdAt: -1 }),
          Notification.findOne({ userId: user._id, type: 'hobby', completedAt: { $exists: true } }).sort({ completedAt: -1 }),
        ])

        const lastHobbyAt = lastHobbyNotif?.createdAt ? new Date(lastHobbyNotif.createdAt) : new Date(0)
        const lastEngagementAt = lastEngagedNotif?.completedAt ? new Date(lastEngagedNotif.completedAt) : null

        const stage = calcHobbyStage(
          new Date(plan.hobby.startedAt),
          plan.hobby.duration ?? 6,
          lastEngagementAt,
        )

        // Lapse: send after 3+ days since last notif (immediate-ish, not spammy)
        // Normal: send after 7 days
        const lapseThreshold = 3 * MS_24H
        const normalThreshold = MS_7D
        const threshold = stage === 'lapse' ? lapseThreshold : normalThreshold
        const hobbyDue = now.getTime() - lastHobbyAt.getTime() >= threshold

        if (hobbyDue) {
          // Weekly check-in asks how they feel; a lapse gets a gentle, no-question re-entry.
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

    // ── Return current active notification ────────────────────────────────────
    const currentRitual = await Notification.findOne({ userId: user._id, type: 'ritual' }).sort({ createdAt: -1 })

    return NextResponse.json({
      hobby: plan?.hobby ?? null,
      ritual: currentRitual,
    })
  } catch (err) {
    console.error('[plan/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { notificationId } = await req.json()
    await connectDB()
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id },
      { completedAt: new Date() }
    )
    return NextResponse.json({ message: 'Marked as done' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
