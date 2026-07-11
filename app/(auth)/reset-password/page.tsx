'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }, 800)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-sage-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Password updated!</h2>
        <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New password</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input id="password" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" type={showPw ? 'text' : 'password'} placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">{error}</div>}
        <Button type="submit" disabled={loading} className="w-full bg-[#60a5fa] text-white hover:bg-[#3b82f6] font-semibold h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Reset Password
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        <Link href="/login" className="font-semibold text-velvet-500 hover:underline">Back to sign in</Link>
      </p>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Card className="shadow-xl shadow-ochre-100/50 border-0">
      <CardContent className="pt-6 px-6 pb-8">
        <Suspense fallback={<div className="py-8 text-center text-muted-foreground text-sm">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </CardContent>
    </Card>
  )
}
