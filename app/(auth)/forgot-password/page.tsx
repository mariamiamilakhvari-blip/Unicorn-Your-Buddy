'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Swallow: response is generic regardless, so we always show the sent state.
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <Card className="shadow-xl shadow-ochre-100/50 border-0">
      <CardContent className="pt-6 px-6 pb-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-100 mb-4">
              <Mail className="h-8 w-8 text-sage-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('forgotSentTitle')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('forgotSentDesc')} <strong>{email}</strong> {t('forgotSentDesc2')}
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-velvet-500 hover:underline">
              <ArrowLeft className="h-4 w-4" /> {t('forgotBack')}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('forgotTitle')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('forgotSubtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('forgotEmail')}</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="flex justify-center">
                <Button type="submit" disabled={loading} className="h-11 px-16 bg-velvet-500 text-white hover:bg-velvet-600 font-semibold rounded-xl">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t('forgotBtn')}
                </Button>
              </div>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link href="/login" className="font-semibold text-velvet-500 hover:underline">{t('forgotBack')}</Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
