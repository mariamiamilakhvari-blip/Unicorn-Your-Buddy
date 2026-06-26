import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Challenge from '@/lib/models/Challenge'
import Hobby from '@/lib/models/Hobby'
import Notification from '@/lib/models/Notification'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, email, active, image } = await req.json()
    const update: Record<string, string | boolean> = {}

    // Deactivate / reactivate account
    if (typeof active === 'boolean') {
      await connectDB()
      await User.findByIdAndUpdate(session.user.id, { active })
      return NextResponse.json({ ok: true, active })
    }

    if (name && typeof name === 'string' && name.trim()) {
      update.name = name.trim()
    }
    if (image && typeof image === 'string' && image.trim()) {
      update.image = image.trim()
    }
    if (email && typeof email === 'string' && email.trim()) {
      // Check email not already taken by another user
      await connectDB()
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: session.user.id } })
      if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      update.email = email.toLowerCase().trim()
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    await connectDB()
    await User.findByIdAndUpdate(session.user.id, update)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const userId = session.user.id
    // Remove user + all related records
    await Promise.all([
      User.findByIdAndDelete(userId),
      Challenge.deleteMany({ userId }),
      Hobby.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
    ])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
