'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, Plus, Trash2, Search, ChevronDown, ChevronRight, Edit2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ContentDoc = {
  _id: string
  page: string
  key: string
  value: string
  updatedAt: string
}

const PAGE_DEFAULTS: Record<string, Record<string, string>> = {
  landing: {
    'hero.label': '001/ Your Buddy',
    'hero.title': 'Your mess is safe here',
    'hero.cta': 'Get advice',
    'hero.sub': 'First 5 questions are free',
    'process.label': '002/ Process',
    'process.step1.num': '01',
    'process.step1.title': 'Create your account',
    'process.step1.desc': 'Sign up for free. It takes under 60 seconds.',
    'process.step2.num': '02',
    'process.step2.title': 'Build your profile',
    'process.step2.desc': 'Answer 8 questions.',
    'process.step3.num': '03',
    'process.step3.title': 'Start chat',
    'process.step3.desc': 'Get advice about your romantic relationship.',
    'pricing.label': '003/ Pricing',
    'pricing.plan': 'Premium',
    'pricing.cta': 'Buy Premium',
    'about.label': '004/ About us',
    'about.mission.title': 'Our mission',
    'about.mission.text': 'Unicorn is your buddy who sits with you in the hard part…',
    'about.vision.title': 'Our vision',
    'about.vision.text': 'We believe that when your most important relationships are healthy…',
    'footer.brand': 'Unicorn, Your Buddy',
    'footer.copyright': '© 2026 Unicorn, Your Buddy. All rights reserved.',
  },
  login: {
    'title': 'Welcome back',
    'subtitle': 'Sign in to your Unicorn account',
    'cta': 'Sign in',
    'forgot': 'Forgot password?',
    'signup.prompt': "Don't have an account?",
    'signup.link': 'Sign up',
  },
  signup: {
    'title': 'Create your account',
    'subtitle': 'Start your journey with Unicorn',
    'cta': 'Get started',
    'login.prompt': 'Already have an account?',
    'login.link': 'Sign in',
  },
  onboarding: {
    'title': 'Tell us about yourself',
    'subtitle': "We'll personalize your experience",
    'cta': 'Continue',
    'skip': 'Skip for now',
  },
  home: {
    'greeting': 'Welcome back',
    'subtitle': "Here's your wellbeing overview",
    'chat.placeholder': 'How are you feeling today?',
    'chat.cta': 'Start chatting',
  },
}

const PAGE_LABELS: Record<string, string> = {
  landing: 'Landing Page',
  login: 'Login Page',
  signup: 'Sign Up Page',
  onboarding: 'Onboarding',
  home: 'Dashboard Home',
}

export default function ContentPage() {
  const [docs, setDocs] = useState<ContentDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ landing: true })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [addingPage, setAddingPage] = useState('')
  const [addKey, setAddKey] = useState('')
  const [addValue, setAddValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(d => { setDocs(d.content ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function saveEdit(doc: ContentDoc) {
    setSaving(doc._id)
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: doc.page, key: doc.key, value: editValue }),
    })
    setDocs(prev => prev.map(d => d._id === doc._id ? { ...d, value: editValue } : d))
    setEditingId(null)
    setSaving(null)
  }

  async function addContent() {
    if (!addingPage || !addKey || !addValue) return
    setSaving('new')
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: addingPage, key: addKey, value: addValue }),
    })
    const data = await res.json()
    if (data.content) setDocs(prev => [...prev, data.content])
    setAddKey('')
    setAddValue('')
    setSaving(null)
  }

  async function deleteContent(doc: ContentDoc) {
    if (!confirm(`Delete "${doc.page}.${doc.key}"?`)) return
    await fetch('/api/admin/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc._id }),
    })
    setDocs(prev => prev.filter(d => d._id !== doc._id))
  }

  async function seedDefaults(page: string) {
    const defaults = PAGE_DEFAULTS[page] || {}
    setSaving('seed')
    const ops = Object.entries(defaults).map(([key, value]) =>
      fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, key, value }),
      }).then(r => r.json())
    )
    const results = await Promise.all(ops)
    const newDocs = results.map(r => r.content).filter(Boolean)
    setDocs(prev => {
      const ids = new Set(prev.map(d => d._id))
      return [...prev, ...newDocs.filter((d: ContentDoc) => !ids.has(d._id))]
    })
    setSaving(null)
  }

  const pageGroups = Object.keys(PAGE_LABELS).reduce<Record<string, ContentDoc[]>>((acc, page) => {
    acc[page] = docs.filter(d => d.page === page)
    return acc
  }, {})

  // Also include any custom pages not in PAGE_LABELS
  docs.forEach(d => {
    if (!pageGroups[d.page]) pageGroups[d.page] = []
    if (!pageGroups[d.page].find(x => x._id === d._id)) pageGroups[d.page].push(d)
  })

  const filteredPages = Object.entries(pageGroups).filter(([page, pageDocs]) => {
    if (!search) return true
    return page.includes(search.toLowerCase()) || pageDocs.some(d => d.key.includes(search) || d.value.includes(search))
  })

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Edit text on any page — changes go live immediately</p>
      </div>

      {/* Search + Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search pages or keys…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Loading content…</div>
      ) : (
        <div className="space-y-3">
          {filteredPages.map(([page, pageDocs]) => {
            const isOpen = !!expanded[page]
            const hasDefaults = !!PAGE_DEFAULTS[page]
            const filteredDocs = search
              ? pageDocs.filter(d => d.key.includes(search) || d.value.includes(search))
              : pageDocs

            return (
              <Card key={page} className="bg-gray-900 border-gray-800 overflow-hidden">
                <button
                  onClick={() => setExpanded(e => ({ ...e, [page]: !e[page] }))}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                    <span className="font-semibold text-white">{PAGE_LABELS[page] || page}</span>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                      {pageDocs.length} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {hasDefaults && pageDocs.length === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => seedDefaults(page)}
                        disabled={saving === 'seed'}
                        className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Seed defaults
                      </Button>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-800">
                    {filteredDocs.length === 0 && (
                      <div className="px-5 py-4 text-gray-500 text-sm text-center">
                        No content yet.{hasDefaults && ' Click "Seed defaults" to populate.'}
                      </div>
                    )}

                    {filteredDocs.map(doc => (
                      <div key={doc._id} className="px-5 py-3.5 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs text-velvet-400 bg-velvet-900/30 px-1.5 py-0.5 rounded">{doc.key}</code>
                            </div>
                            {editingId === doc._id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white text-sm min-h-[80px]"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => saveEdit(doc)}
                                    disabled={saving === doc._id}
                                    className="bg-velvet-600 hover:bg-velvet-700 text-white h-7 text-xs"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    {saving === doc._id ? 'Saving…' : 'Save'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingId(null)}
                                    className="text-gray-400 h-7 text-xs"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-300 line-clamp-2">{doc.value}</p>
                            )}
                          </div>
                          {editingId !== doc._id && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingId(doc._id); setEditValue(doc.value) }}
                                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-200 transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteContent(doc)}
                                className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add new content entry for this page */}
                    <div className="px-5 py-4 bg-gray-800/20">
                      {addingPage === page ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="key (e.g. hero.title)"
                              value={addKey}
                              onChange={e => setAddKey(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm flex-1"
                            />
                          </div>
                          <Textarea
                            placeholder="value / content text"
                            value={addValue}
                            onChange={e => setAddValue(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={addContent} disabled={saving === 'new'} className="bg-velvet-600 hover:bg-velvet-700 text-white h-7 text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              {saving === 'new' ? 'Adding…' : 'Add'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setAddingPage('')} className="text-gray-400 h-7 text-xs">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingPage(page)}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add content entry
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
