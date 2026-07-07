import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { sendMail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    await connectDB()
    const user = await User.findOne({ email: email?.toLowerCase() })

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      user.resetToken = token
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      try {
        await sendMail({
          to: user.email,
          subject: 'Reset your Unicorn password',
          text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
          html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#561a50">Reset your password</h2>
            <p>We received a request to reset your Unicorn password. Click below to set a new one. This link expires in 1 hour.</p>
            <p style="margin:24px 0">
              <a href="${resetUrl}" style="background:#73306b;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:bold">Reset password</a>
            </p>
            <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
          </div>`,
        })
      } catch (mailErr) {
        // Don't leak whether the account exists; log for ops but still respond generically.
        console.error('[forgot-password] email send failed:', mailErr)
        console.log('[Password Reset] fallback URL:', resetUrl)
      }
    }

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
