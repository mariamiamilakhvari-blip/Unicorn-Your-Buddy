import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, email } = await req.json()
    const update: Record<string, string> = {}

    if (name && typeof name === 'string' && name.trim()) {
      update.name = name.trim()
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
