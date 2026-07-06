import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import CarProfile from '@/lib/models/CarProfile'
import { hasActivePremiumPlus } from '@/lib/carDating'

// Create or update the caller's CarProfile. Requires active Premium Plus.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await hasActivePremiumPlus(session.user.id))) {
    return NextResponse.json({ error: 'Premium Plus required' }, { status: 402 })
  }
  try {
    const body = await req.json()
    const update = {
      carMake: body.carMake, carModel: body.carModel, carYear: body.carYear,
      shortBio: body.shortBio, city: body.city,
      // Opt-in only. Never auto-populated from account email/phone.
      contactHandle: body.contactHandle,
      visibility: body.visibility === 'hidden' ? 'hidden' : 'active',
    }
    const profile = await CarProfile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    return NextResponse.json({ profile })
  } catch (err) {
    console.error('[car-dating/profile POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Pause/hide the profile. Allowed even if Premium Plus lapsed, so users can
// always stop surfacing themselves. Existing matches are untouched.
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { visibility } = await req.json()
    if (!['active', 'hidden'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 })
    }
    await connectDB()
    await CarProfile.updateOne({ userId: session.user.id }, { $set: { visibility } })
    return NextResponse.json({ ok: true, visibility })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete the profile. Match records are intentionally kept, matches persist even
// if one side goes inactive; they just stop appearing in browsing.
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    await CarProfile.deleteOne({ userId: session.user.id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Read own profile (any state, for editing).
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const profile = await CarProfile.findOne({ userId: session.user.id })
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
