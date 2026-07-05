import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import { evaluateUserPlan } from '@/lib/planEngine'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await evaluateUserPlan(session.user.id)
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[plan/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Change the active hobby's lifecycle status: pause, complete, or resume.
// Resuming resets the weekly clock from now.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { status } = await req.json() as { status?: 'active' | 'paused' | 'completed' }
    if (!status || !['active', 'paused', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await connectDB()
    const update: Record<string, unknown> = { 'wellbeingPlan.hobby.status': status }
    if (status === 'active') update['wellbeingPlan.hobby.resumedAt'] = new Date()

    const user = await User.findOneAndUpdate(
      { _id: session.user.id, 'wellbeingPlan.hobby.name': { $exists: true, $ne: null } },
      { $set: update },
      { new: true },
    ).select('wellbeingPlan.hobby')

    if (!user) return NextResponse.json({ error: 'No active hobby' }, { status: 404 })
    return NextResponse.json({ ok: true, hobby: user.wellbeingPlan?.hobby ?? null })
  } catch (err) {
    console.error('[plan/POST]', err)
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
