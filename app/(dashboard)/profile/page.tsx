'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Camera, ArrowLeft, Zap, Lock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Image from 'next/image'
import Link from 'next/link'

const QUESTION_LABELS: Record<string, string> = {
  maritalStatus:    'Relationship Status',
  ageCohort:        'Age Group',
  occupation:       'Occupation',
  carThoughts:      'What you think about when alone',
  neglectedArea:    'Most neglected area of life',
  preferExperience: 'Preferred experiences',
  nudgeType:        'What kind of nudge moves you',
  betterLife:       'What a better life feels like',
}

const FREE_LIMIT = 5

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Record<string, string | string[]>>({})
  const [avatar, setAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [displayEmail, setDisplayEmail] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login'); return }

    fetch('/api/chat')
      .then(r => r.json())
      .then(data => {
        setIsPaid(data.isPaid ?? false)
        setMessageCount(data.messageCount ?? 0)
        if (data.profile && typeof data.profile === 'object') setProfile(data.profile)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    setAvatar(localStorage.getItem('unicorn_avatar'))
    setDisplayName(session?.user?.name ?? '')
    setDisplayEmail(session?.user?.email ?? '')
  }, [status, router, session?.user?.name, session?.user?.email])

  function signOut() { nextAuthSignOut({ callbackUrl: '/login' }) }

  async function saveField(field: 'name' | 'email') {
    setSaving(true)
    setSaveError('')
    const value = field === 'name' ? nameInput.trim() : emailInput.trim()
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error ?? 'Failed to save'); return }
      if (field === 'name') { setDisplayName(value); setEditingName(false) }
      else { setDisplayEmail(value); setEditingEmail(false) }
    } catch { setSaveError('Failed to save') }
    finally { setSaving(false) }
  }

  async function cancelSubscription() {
    setCancelling(true)
    setCancelError('')
    try {
      const res = await fetch('/api/dodo/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setCancelError(data.error ?? 'Failed to cancel'); return }
      setIsPaid(false)
      setCancelConfirm(false)
    } catch { setCancelError('Failed to cancel') }
    finally { setCancelling(false) }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) { setAvatar(data.url); localStorage.setItem('unicorn_avatar', data.url) }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const profileEntries = Object.entries(QUESTION_LABELS).filter(([key]) => {
    const val = profile[key]
    return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)
  })

  if (loading) {
    return (
      <div className="-mx-6 -my-8 min-h-screen bg-[#EBF5FB] px-6 py-8">
        <div className="max-w-3xl space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-36 bg-white rounded-2xl" />
          <div className="h-24 bg-white rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-6 -my-8 min-h-screen bg-[#EBF5FB] px-6 py-8">
      <div className="max-w-3xl space-y-6">
        <div>
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('profileTitle')}</h1>
        </div>

        {/* Account card — avatar + name/email edit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{t('profileAccount')}</h2>
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-velvet-400 to-velvet-600 flex items-center justify-center group shrink-0"
            >
              {avatar ? <Image src={avatar} alt="Avatar" fill className="object-cover" /> : <User className="h-8 w-8 text-white" />}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

            <div className="flex-1 space-y-3">
              {/* Name field */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">NAME</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveField('name'); if (e.key === 'Escape') setEditingName(false) }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-velvet-300 text-sm outline-none focus:ring-2 focus:ring-velvet-400/30"
                    />
                    <button onClick={() => saveField('name')} disabled={saving} className="text-velvet-500 hover:text-velvet-700 disabled:opacity-40"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingName(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{displayName || session?.user?.name || '—'}</p>
                    <button
                      onClick={() => { setNameInput(displayName || session?.user?.name || ''); setEditingName(true) }}
                      className="text-xs text-velvet-500 hover:text-velvet-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email field */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">EMAIL</p>
                {editingEmail ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveField('email'); if (e.key === 'Escape') setEditingEmail(false) }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-velvet-300 text-sm outline-none focus:ring-2 focus:ring-velvet-400/30"
                    />
                    <button onClick={() => saveField('email')} disabled={saving} className="text-velvet-500 hover:text-velvet-700 disabled:opacity-40"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingEmail(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{displayEmail || session?.user?.email || '—'}</p>
                    <button
                      onClick={() => { setEmailInput(displayEmail || session?.user?.email || ''); setEditingEmail(true) }}
                      className="text-xs text-velvet-500 hover:text-velvet-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            </div>
          </div>
        </div>

        {/* Subscription card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">SUBSCRIPTION</h2>
          {isPaid ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-velvet-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-velvet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unicorn Premium</p>
                    <p className="text-sm text-sage-600 font-medium">Active — unlimited conversations</p>
                  </div>
                </div>
              </div>

              {/* Cancel subscription */}
              <div className="border-t border-gray-100 pt-4">
                {cancelConfirm ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 font-medium">Cancel your subscription?</p>
                    <p className="text-xs text-muted-foreground">You'll lose access to unlimited conversations immediately.</p>
                    {cancelError && <p className="text-xs text-red-500">{cancelError}</p>}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={cancelSubscription}
                        disabled={cancelling}
                        className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                      </button>
                      <button
                        onClick={() => { setCancelConfirm(false); setCancelError('') }}
                        className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Keep Premium
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Cancel subscription
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free plan</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.min(messageCount, FREE_LIMIT)} of {FREE_LIMIT} free messages used
                  </p>
                </div>
              </div>
              <Link
                href="/subscription"
                className="px-4 py-1.5 rounded-full bg-velvet-500 text-white text-sm font-semibold hover:bg-velvet-600 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>

        {/* Profile answers */}
        {profileEntries.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{t('profileWellBeing')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {profileEntries.map(([key, label]) => {
                const val = profile[key]
                const display = Array.isArray(val) ? val.join(', ') : val
                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{display || '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="flex">
          <Button
            variant="outline"
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            {t('profileSignOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
