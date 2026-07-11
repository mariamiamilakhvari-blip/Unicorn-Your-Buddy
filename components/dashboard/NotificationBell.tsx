'use client'
import { useEffect, useState, useCallback } from 'react'
import { Bell } from 'lucide-react'

type Notification = {
  _id: string
  type: string
  title: string
  body: string
  readAt?: string
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setItems(data.notifications ?? [])
    } catch {
      // Silent: bell just shows no items if the fetch fails.
    }
  }, [])

  useEffect(() => {
    load()
    // Poll so cron-generated hobby check-ins show up without a reload.
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [load])

  const unread = items.filter(n => !n.readAt).length

  async function markRead(id: string) {
    setItems(prev => prev.map(n => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
    } catch {
      // Optimistic update stays even if the PATCH fails.
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#a8d8f0] bg-white/80 backdrop-blur-md text-black hover:bg-[#e8f5fd] transition-colors shadow-sm"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-velvet-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Notifications</span>
              {unread > 0 && <span className="text-xs text-velvet-600 font-semibold">{unread} new</span>}
            </div>
            <div className="border-t border-gray-100" />
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet</p>
            ) : (
              items.map(n => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${n.readAt ? '' : 'bg-velvet-50/50'}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.readAt && <span className="mt-1.5 w-2 h-2 rounded-full bg-velvet-500 shrink-0" />}
                    <div className={n.readAt ? 'pl-4' : ''}>
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-snug">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
