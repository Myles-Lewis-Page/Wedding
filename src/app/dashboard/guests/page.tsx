'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, X, Loader2, Check, AlertCircle } from 'lucide-react'

interface Guest {
  id: string; name: string; email: string | null; side: string
  hasPlusOne: boolean; plusOneName: string | null; dietary: string | null
  rsvpStatus: string; tableId: string | null; createdAt: string
}

const DIETARY_OPTIONS = ['', 'Vegetarian', 'Vegan', 'Gluten-free', 'Nut allergy', 'Halal', 'Kosher', 'Other']

function AddGuestModal({ onClose, onSave }: { onClose: () => void; onSave: (g: Guest) => void }) {
  const [form, setForm] = useState({
    name: '', email: '', side: 'bride', hasPlusOne: false, dietary: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          side: form.side,
          hasPlusOne: form.hasPlusOne,
          dietary: form.dietary || null,
          rsvpStatus: 'pending',
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Something went wrong. Is your database connected?')
        setSaving(false)
        return
      }
      const g = await res.json()
      onSave(g)
    } catch {
      setError('Could not connect to the database. Check your DATABASE_URL.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add guest</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs rounded-xl p-3">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Full name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && save()}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] focus:ring-1 focus:ring-[#7A9C6E]/30"
              placeholder="Katie Marsh"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] focus:ring-1 focus:ring-[#7A9C6E]/30"
              placeholder="katie@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Side</label>
              <select
                value={form.side}
                onChange={e => setForm(f => ({ ...f, side: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white"
              >
                <option value="bride">Bride&apos;s side</option>
                <option value="groom">Groom&apos;s side</option>
                <option value="both">Both / Mutual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Dietary</label>
              <select
                value={form.dietary}
                onChange={e => setForm(f => ({ ...f, dietary: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white"
              >
                {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o || 'None'}</option>)}
              </select>
            </div>
          </div>

          {/* Plus one toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-stone-700">Plus one allowed</p>
              <p className="text-xs text-stone-400">Guest can bring a plus one</p>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, hasPlusOne: !f.hasPlusOne }))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${form.hasPlusOne ? 'bg-[#7A9C6E]' : 'bg-stone-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.hasPlusOne ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all"
            style={{ background: '#7A9C6E' }}
          >
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Plus size={14} />Add guest</>}
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  attending: { label: 'Attending', cls: 'bg-emerald-50 text-emerald-700' },
  declined:  { label: 'Declined',  cls: 'bg-red-50 text-red-500' },
  pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-600' },
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'attending' | 'declined' | 'pending'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/guests')
      .then(r => r.json())
      .then(d => { setGuests(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setError('Could not load guests. Check your database connection.'); setLoading(false) })
  }, [])

  const handleSave = (g: Guest) => { setGuests(prev => [g, ...prev]); setShowAdd(false) }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this guest?')) return
    setDeleting(id)
    await fetch(`/api/guests/${id}`, { method: 'DELETE' })
    setGuests(prev => prev.filter(g => g.id !== id))
    setDeleting(null)
  }

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Side', 'RSVP', 'Plus One', 'Dietary', 'Table']]
    guests.forEach(g => rows.push([g.name, g.email || '', g.side, g.rsvpStatus, g.plusOneName || '', g.dietary || '', g.tableId || '']))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'guests.csv'
    a.click()
  }

  const filtered = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchFilter = filter === 'all' || g.rsvpStatus === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    declined:  guests.filter(g => g.rsvpStatus === 'declined').length,
    pending:   guests.filter(g => g.rsvpStatus === 'pending').length,
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Guest list</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {stats.total} guests · {stats.attending} attending · {stats.pending} pending
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#7A9C6E' }}
          >
            <Plus size={14} /> Add guest
          </button>
        </div>
      </div>

      {/* DB error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          { key: 'all',       label: `All (${stats.total})` },
          { key: 'attending', label: `Attending (${stats.attending})` },
          { key: 'declined',  label: `Declined (${stats.declined})` },
          { key: 'pending',   label: `Pending (${stats.pending})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === key ? 'bg-[#7A9C6E] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-stone-400">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {['Name', 'Side', 'RSVP', 'Plus one', 'Dietary', 'Table', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-stone-400 text-sm">
                      {guests.length === 0 ? 'No guests yet — add your first guest above.' : 'No guests match your search.'}
                    </td>
                  </tr>
                ) : filtered.map((g, i) => {
                  const st = STATUS_CONFIG[g.rsvpStatus] ?? STATUS_CONFIG.pending
                  return (
                    <tr key={g.id} className={`hover:bg-stone-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-stone-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#EDF4EA] flex items-center justify-center text-xs font-medium text-[#4A6B3E] flex-shrink-0">
                            {g.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate">{g.name}</p>
                            {g.email && <p className="text-xs text-stone-400 truncate">{g.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs capitalize whitespace-nowrap">{g.side}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">
                        {g.hasPlusOne
                          ? g.plusOneName || <span className="text-[#7A9C6E]">✓ allowed</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">{g.dietary || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {g.tableId
                          ? <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">Assigned</span>
                          : <span className="px-2 py-0.5 bg-stone-100 text-stone-400 rounded-full text-xs">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(g.id)}
                          disabled={deleting === g.id}
                          className="text-stone-300 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deleting === g.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddGuestModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
    </div>
  )
}
