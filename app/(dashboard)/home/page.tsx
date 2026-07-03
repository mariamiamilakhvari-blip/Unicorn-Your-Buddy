'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Sparkles, Lock, Heart, HeartCrack } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Message = { role: 'user' | 'assistant'; content: string }

const OPENING = "Hey, I am your buddy Unicorn. I'm here for you. Whatever is going on in your relationship, you can share it with me. What's been happening?"

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: OPENING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [paywalled, setPaywalled] = useState(false)
  const [initialising, setInitialising] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const userName = session?.user?.name?.split(' ')[0] ?? ''

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login'); return }

    fetch('/api/chat')
      .then(r => r.json())
      .then(data => {
        setRemaining(data.remaining ?? null)
        setIsPaid(data.isPaid ?? false)
        if (!data.isPaid && (data.remaining ?? 5) <= 0) setPaywalled(true)
        // Load saved conversation: prefer DB (cross-device), fall back to this
        // browser's cached copy so older local chats still show.
        let hist: Message[] | null = null
        if (Array.isArray(data.history) && data.history.length > 1) {
          hist = data.history
        } else {
          try {
            const stored = localStorage.getItem(`unicorn_chat_${session?.user?.id}`)
            const parsed = stored ? JSON.parse(stored) : null
            if (Array.isArray(parsed) && parsed.length > 1) hist = parsed
          } catch {}
        }
        if (hist) {
          hist[0] = { role: 'assistant', content: OPENING }
          setMessages(hist)
        }
      })
      .catch(() => {})
      .finally(() => setInitialising(false))
  }, [status, router, session?.user?.id])

  // Persist chat history on every change
  useEffect(() => {
    if (!session?.user?.id || messages.length <= 1) return
    localStorage.setItem(`unicorn_chat_${session.user.id}`, JSON.stringify(messages))
  }, [messages, session?.user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: next }),
      })
      const data = await res.json()

      if (data.paywalled) {
        setPaywalled(true)
        setRemaining(0)
        setLoading(false)
        return
      }

      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
      setRemaining(data.isPaid ? null : Math.max(0, 5 - data.messageCount))
      setIsPaid(data.isPaid)
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "I'm here — just had a tiny hiccup. Try again?" }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  async function unlockBuddy() {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/dodo/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
        setCheckoutLoading(false)
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
      setCheckoutLoading(false)
    }
  }

  if (initialising) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-100 rounded" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-velvet-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-velvet-500">Unicorn</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{userName ? `Hey, ${userName}` : 'Hey'}</h1>
        </div>
        {!isPaid && remaining !== null && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground font-medium">
              {remaining} {remaining === 1 ? 'question' : 'questions'} left
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) =>
                i < (5 - remaining) ? (
                  <Heart key={i} className="h-4 w-4 fill-rose-400 text-rose-400" strokeWidth={1.5} />
                ) : (
                  <HeartCrack key={i} className="h-4 w-4 text-rose-200/70" strokeWidth={1.5} />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-400 [&::-webkit-scrollbar-thumb]:rounded-full">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-velvet-500 text-white rounded-br-sm'
                : 'bg-white border border-border text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-velvet-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-velvet-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-velvet-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {paywalled && (
          <div className="flex justify-start">
            <div className="bg-white border border-velvet-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm max-w-[85%]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-velvet-500" />
                <span className="text-sm font-bold text-gray-900">You've used your 5 free messages</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Unicorn is still here — unlock unlimited conversations to keep going.</p>
              <button
                onClick={unlockBuddy}
                disabled={checkoutLoading}
                className="inline-flex items-center justify-center bg-velvet-500 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-velvet-600 transition-colors disabled:opacity-60"
              >
                {checkoutLoading ? 'Redirecting…' : 'Unlock Unicorn'}
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!paywalled && (
        <div className="shrink-0 flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell Unicorn about your relationship. What's going on..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-velvet-400/30 focus:border-velvet-400 transition-all disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="h-12 w-12 rounded-full bg-velvet-500 text-white flex items-center justify-center hover:bg-velvet-600 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
