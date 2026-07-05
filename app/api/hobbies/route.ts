import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import Hobby from '@/lib/models/Hobby'
import User from '@/lib/models/User'
import { getCurrentHobby } from '@/lib/hobby'

const DEFAULT_MILESTONES = [
  { stage: 'knowledge', title: 'Gather Basic Knowledge', targetMonth: 1 },
  { stage: 'equipment', title: 'Get the Necessary Equipment', targetMonth: 1 },
  { stage: 'feedback', title: 'Take Feedback', targetMonth: 1 },
  { stage: 'guides', title: 'Follow Step-by-Step Guides', targetMonth: 2 },
  { stage: 'community', title: 'Join a Community / Sell Your Product', targetMonth: 2 },
  { stage: 'technique', title: 'Try a New Technique', targetMonth: 2 },
  { stage: 'practice', title: 'Practice Regularly', targetMonth: 3 },
]

// DB is the single source of truth. GET returns the ACTIVE hobby (the one the
// notification system tracks) plus wellbeingPlan.hobby, which is kept in lockstep.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { hobby, planHobby } = await getCurrentHobby(session.user.id)
    return NextResponse.json({ hobby, planHobby })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create or replace the current hobby. Atomic: archives any existing active hobby
// (kept as history), creates the new one, and writes wellbeingPlan.hobby — all in
// one transaction so it can never end up half-updated.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  try {
    const { name, icon, learningMethod, duration } = await req.json()
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    await connectDB()

    const dur = duration === 9 ? 9 : 6
    const now = new Date()
    let created: unknown = null

    const dbSession = await mongoose.startSession()
    try {
      await dbSession.withTransaction(async () => {
        // Archive prior active hobbies (keep history, stop their check-ins).
        await Hobby.updateMany(
          { userId, status: { $ne: 'completed' } },
          { $set: { status: 'completed' } },
          { session: dbSession },
        )
        const [hobby] = await Hobby.create([{
          userId, name, icon: icon ?? '', learningMethod: learningMethod ?? '',
          startDate: now, status: 'active', milestones: DEFAULT_MILESTONES,
        }], { session: dbSession })
        created = hobby
        // Notification hobby, kept in lockstep with the Hobby record.
        await User.updateOne({ _id: userId }, {
          $set: {
            'wellbeingPlan.hobby': {
              name, learningMethod: learningMethod ?? '', duration: dur,
              startedAt: now, status: 'active',
            },
          },
        }, { session: dbSession })
      })
    } finally {
      await dbSession.endSession()
    }

    return NextResponse.json({ hobby: created }, { status: 201 })
  } catch (err) {
    console.error('[hobbies/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    await connectDB()

    // Lifecycle status change (active | paused | completed). Updates the active
    // Hobby doc and wellbeingPlan.hobby together so check-ins obey it.
    if (body.status && ['active', 'paused', 'completed'].includes(body.status)) {
      await Hobby.findOneAndUpdate(
        { userId: session.user.id, status: { $ne: 'completed' } },
        { $set: { status: body.status } },
        { sort: { createdAt: -1 } },
      )
      const set: Record<string, unknown> = { 'wellbeingPlan.hobby.status': body.status }
      if (body.status === 'active') set['wellbeingPlan.hobby.resumedAt'] = new Date()
      await User.updateOne(
        { _id: session.user.id, 'wellbeingPlan.hobby.name': { $exists: true, $ne: null } },
        { $set: set },
      )
      return NextResponse.json({ ok: true, status: body.status })
    }

    // Milestone toggle on the active hobby.
    const { milestoneStage, completed } = body
    await Hobby.findOneAndUpdate(
      { userId: session.user.id, status: { $ne: 'completed' }, 'milestones.stage': milestoneStage },
      { $set: { 'milestones.$.completedAt': completed ? new Date() : null } }
    )
    return NextResponse.json({ message: 'Updated' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Hard-stop delete: removes the active Hobby record and unsets the notification
// hobby so weekly check-ins stop immediately. Archived history is left intact.
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    await Hobby.deleteMany({ userId: session.user.id, status: { $ne: 'completed' } })
    await User.updateOne({ _id: session.user.id }, { $unset: { 'wellbeingPlan.hobby': '' } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
