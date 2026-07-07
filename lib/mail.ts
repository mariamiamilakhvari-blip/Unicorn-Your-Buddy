import nodemailer from 'nodemailer'

// Shared SMTP sender. Requires SMTP_HOST/PORT/USER/PASS + EMAIL_FROM in env.
export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    throw new Error('SMTP not configured (SMTP_HOST/USER/PASS missing)')
  }
  const port = Number(process.env.SMTP_PORT) || 587
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user, pass },
  })
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || user,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  })
}
