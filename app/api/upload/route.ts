import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // No Cloudinary configured → return an inline data URL so uploads still work.
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`
    return NextResponse.json({ url: dataUrl })
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'unicorn-avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })
    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error('[upload] Cloudinary error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
