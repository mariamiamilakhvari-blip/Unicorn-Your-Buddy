'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Database, Plus, Trash2, Pencil, X, Check,
  ChevronLeft, ChevronRight, RefreshCw, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

type Doc = Record<string, unknown>

const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  users: 'Registered user accounts',
  hobbies: '3-month hobby programs',
  notifications: 'User notification records',
  siteconfigs: 'Theme & site configuration',
  pagecontents: 'Editable page text content',
}

function JsonDisplay({ data }: { data: unknown }) {
  return (
    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function truncate(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return '{…}'
  const str = String(val)
  return str.length > 40 ? str.slice(0, 40) + '…' : str
}

function getDisplayColumns(docs: Doc[]): string[] {
  if (!docs.length) return ['_id']
  const allKeys = new Set<string>()
  docs.slice(0, 5).forEach(d => Object.keys(d).forEach(k => allKeys.add(k)))
  const priority = ['name', 'email', 'key', 'value', 'page', 'plan', 'status', 'title', 'createdAt']
  const cols: string[] = ['_id']
  priority.forEach(k => { if (allKeys.has(k)) cols.push(k) })
  allKeys.forEach(k => { if (!cols.includes(k) && cols.length < 6) cols.push(k) })
  return cols
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCol, setSelectedCol] = useState<string | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [viewDoc, setViewDoc] = useState<Doc | null>(null)
  const [editDoc, setEditDoc] = useState<Doc | null>(null)
  const [editJson, setEditJson] = useState('')
  const [editError, setEditError] = useState('')
  const [adding, setAdding] = useState(false)
  const [addJson, setAddJson] = useState('{}')
  const [addError, setAddError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/collections')
      .then(r => r.json())
      .then(d => setCollections(d.collections ?? []))
  }, [])

  const loadDocs = useCallback((col: string, pg: number) => {
    setLoading(true)
    fetch(`/api/admin/collections?collection=${col}&page=${pg}&limit=20`)
      .then(r => r.json())
      .then(d => {
        setDocs(d.docs ?? [])
        setTotal(d.total ?? 0)
        setPages(d.pages ?? 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function selectCollection(col: string) {
    setSelectedCol(col)
    setPage(1)
    setDocs([])
    loadDocs(col, 1)
  }

  function refresh() {
    if (selectedCol) loadDocs(selectedCol, page)
  }

  async function deleteDoc(id: string) {
    if (!selectedCol) return
    if (!confirm('Delete this document? Cannot be undone.')) return
    await fetch('/api/admin/collections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: selectedCol, id }),
    })
    setDocs(prev => prev.filter(d => String(d._id) !== id))
    setTotal(t => t - 1)
  }

  function startEdit(doc: Doc) {
    setEditDoc(doc)
    const { _id, ...rest } = doc
    setEditJson(JSON.stringify(rest, null, 2))
    setEditError('')
  }

  async function saveEdit() {
    if (!selectedCol || !editDoc) return
    let parsed: Doc
    try {
      parsed = JSON.parse(editJson)
    } catch {
      setEditError('Invalid JSON')
      return
    }
    setSaving(true)
    await fetch('/api/admin/collections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: selectedCol, id: String(editDoc._id), data: parsed }),
    })
    setDocs(prev => prev.map(d => String(d._id) === String(editDoc._id) ? { ...d, ...parsed } : d))
    setEditDoc(null)
    setSaving(false)
  }

  async function saveNew() {
    if (!selectedCol) return
    let parsed: Doc
    try {
      parsed = JSON.parse(addJson)
    } catch {
      setAddError('Invalid JSON')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: selectedCol, data: parsed }),
    })
    const data = await res.json()
    setSaving(false)
    setAdding(false)
    setAddJson('{}')
    if (data.insertedId) loadDocs(selectedCol, page)
  }

  function goPage(p: number) {
    setPage(p)
    if (selectedCol) loadDocs(selectedCol, p)
  }

  const cols = getDisplayColumns(docs)

  return (
    <div className="flex h-full">
      {/* Collection sidebar */}
      <div className="w-56 border-r border-gray-800 bg-gray-900 p-3 space-y-1 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mb-2">Collections</p>
        {collections.map(col => (
          <button
            key={col}
            onClick={() => selectCollection(col)}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
              selectedCol === col
                ? 'bg-velvet-600/20 text-velvet-300 border border-velvet-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{col}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedCol ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Database className="h-12 w-12 text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium">Select a collection</p>
            <p className="text-gray-600 text-sm mt-1">Pick a collection from the sidebar to browse and edit documents</p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm">
              {collections.map(col => (
                <button key={col} onClick={() => selectCollection(col)}
                  className="p-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-500 text-left transition-all">
                  <p className="text-sm font-medium text-white">{col}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{COLLECTION_DESCRIPTIONS[col] ?? 'MongoDB collection'}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedCol}</h2>
                <p className="text-xs text-gray-500">{total} documents</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={refresh} className="border-gray-700 text-gray-300 hover:bg-gray-800 h-8">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" onClick={() => { setAdding(true); setAddJson('{}'); setAddError('') }}
                  className="bg-velvet-600 hover:bg-velvet-700 text-white h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Insert document
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-velvet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : docs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No documents in this collection</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      {cols.map(col => (
                        <TableHead key={col} className="text-gray-400 text-xs font-semibold">{col}</TableHead>
                      ))}
                      <TableHead className="text-right text-gray-400 text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((doc, i) => (
                      <TableRow key={i} className="border-gray-800 hover:bg-gray-800/40">
                        {cols.map(col => (
                          <TableCell key={col} className="text-xs text-gray-300 font-mono max-w-[200px]">
                            {col === '_id'
                              ? <span className="text-gray-500">{String(doc._id).slice(-8)}</span>
                              : truncate(doc[col])}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewDoc(doc)}
                              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-200 transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => startEdit(doc)}
                              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-200 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteDoc(String(doc._id))}
                              className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">Page {page} of {pages} · {total} total</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => goPage(page - 1)} disabled={page <= 1}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 w-7 p-0">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => goPage(page + 1)} disabled={page >= pages}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 w-7 p-0">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Document</DialogTitle>
            <DialogDescription className="text-gray-500">Full document view</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 bg-gray-950 rounded-lg">
              <JsonDisplay data={viewDoc} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Document</DialogTitle>
            <DialogDescription className="text-gray-500">Edit JSON — _id is excluded</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={editJson}
              onChange={e => { setEditJson(e.target.value); setEditError('') }}
              className="bg-gray-950 border-gray-700 text-green-400 font-mono text-xs min-h-[300px]"
            />
            {editError && <p className="text-red-400 text-xs">{editError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditDoc(null)} className="text-gray-400">Cancel</Button>
              <Button onClick={saveEdit} disabled={saving} className="bg-velvet-600 hover:bg-velvet-700 text-white">
                <Check className="h-4 w-4 mr-2" />
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insert dialog */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Insert Document</DialogTitle>
            <DialogDescription className="text-gray-500">Enter JSON for the new document</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={addJson}
              onChange={e => { setAddJson(e.target.value); setAddError('') }}
              className="bg-gray-950 border-gray-700 text-green-400 font-mono text-xs min-h-[200px]"
            />
            {addError && <p className="text-red-400 text-xs">{addError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setAdding(false)} className="text-gray-400">Cancel</Button>
              <Button onClick={saveNew} disabled={saving} className="bg-velvet-600 hover:bg-velvet-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {saving ? 'Inserting…' : 'Insert'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
