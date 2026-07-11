import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  if (session.user.role !== 'admin') return null
  return session
}

const ALLOWED_COLLECTIONS = ['users', 'hobbies', 'notifications', 'siteconfigs', 'pagecontents']

function getCollection(name: string) {
  if (!ALLOWED_COLLECTIONS.includes(name.toLowerCase())) return null
  return mongoose.connection.collection(name)
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await connectDB()

  const col = req.nextUrl.searchParams.get('collection')
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

  if (!col) {
    const collections = await mongoose.connection.db!.listCollections().toArray()
    return NextResponse.json({
      collections: collections
        .map(c => c.name)
        .filter(n => ALLOWED_COLLECTIONS.includes(n.toLowerCase()))
    })
  }

  const collection = getCollection(col)
  if (!collection) return NextResponse.json({ error: 'Collection not allowed' }, { status: 403 })

  const skip = (page - 1) * limit
  const [docs, total] = await Promise.all([
    collection.find({}).skip(skip).limit(limit).toArray(),
    collection.countDocuments(),
  ])

  return NextResponse.json({
    docs: docs.map(d => ({ ...d, _id: d._id.toString() })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { collection: col, data } = await req.json()
  if (!col || !data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await connectDB()
  const collection = getCollection(col)
  if (!collection) return NextResponse.json({ error: 'Collection not allowed' }, { status: 403 })

  const result = await collection.insertOne({ ...data, createdAt: new Date(), updatedAt: new Date() })
  return NextResponse.json({ insertedId: result.insertedId.toString() })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { collection: col, id, data } = await req.json()
  if (!col || !id || !data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await connectDB()
  const collection = getCollection(col)
  if (!collection) return NextResponse.json({ error: 'Collection not allowed' }, { status: 403 })

  const { _id, ...updateData } = data
  await collection.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { collection: col, id } = await req.json()
  if (!col || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await connectDB()
  const collection = getCollection(col)
  if (!collection) return NextResponse.json({ error: 'Collection not allowed' }, { status: 403 })

  await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) })
  return NextResponse.json({ ok: true })
}
