'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ExternalLink, Check, MapPin, Phone, Mail, Users, DollarSign, Loader2, ChevronRight, Trash2, Star, Globe, Edit3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Venue {
  id: string; name: string; url: string; imageUrl: string; cost: number
  address: string; description: string; capacity: number | null
  phone: string; email: string; website: string; amenities: string[]
  isSelected: boolean; notes: string; createdAt: string
}

// ─── Add Venue Modal ──────────────────────────────────────────────────────────
function AddVenueModal({ onClose, onSave }: { onClose: () => void; onSave: (v: Venue) => void }) {
  const [step, setStep] = useState<'url' | 'details'>('url')
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', imageUrl: '', cost: '', address: '',
    description: '', capacity: '', phone: '', email: '', website: '', amenities: '', notes: '',
  })

  const scrapeUrl = async () => {
    if (!url.trim()) return
    setScraping(true); setScrapeError('')
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await res.json()
      if (data.error) { setScrapeError(data.error) } else {
        setForm(f => ({ ...f, name: data.name || '', imageUrl: data.image_url || '', description: data.description || '', address: data.address || '', phone: data.phone || '', website: data.website || url }))
        setStep('details')
      }
    } catch { setScrapeError('Could not fetch. Enter details manually.'); setStep('details') }
    finally { setScraping(false) }
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/venues', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, url: url || form.website, imageUrl: form.imageUrl,
          cost: parseFloat(form.cost) || 0, address: form.address, description: form.description,
          capacity: parseInt(form.capacity) || null, phone: form.phone, email: form.email,
          website: form.website || url,
          amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
          notes: form.notes, isSelected: false,
        }),
      })
      onSave(await res.json())
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add a venue</h2>
            <p className="text-xs text-stone-400 mt-0.5">{step === 'url' ? 'Paste the venue website to auto-fill' : 'Review and complete details'}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Venue website URL</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrapeUrl()}
                  placeholder="https://thebarnatstonegate.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] focus:ring-2 focus:ring-[#7A9C6E]/20" autoFocus />
                {scrapeError && <p className="text-xs text-amber-600 mt-1.5">⚠ {scrapeError}</p>}
              </div>
              <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-500">
                <p className="font-medium text-stone-700 mb-1">We&apos;ll automatically pull:</p>
                <ul className="space-y-0.5 text-xs"><li>• Venue name and description</li><li>• Hero image</li><li>• Address and phone number</li></ul>
                <p className="text-xs mt-2 text-stone-400">You&apos;ll enter the rental cost yourself.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={scrapeUrl} disabled={scraping || !url.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                  {scraping ? <><Loader2 size={14} className="animate-spin" />Fetching…</> : <><Globe size={14} />Fetch venue info</>}
                </button>
                <button onClick={() => { setForm(f => ({ ...f, website: url })); setStep('details') }}
                  className="px-4 py-2.5 rounded-xl text-sm text-stone-600 border border-stone-200 hover:bg-stone-50">Enter manually</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {form.imageUrl && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Venue name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="The Barn at Stonegate" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Rental cost ($) *</label>
                  <div className="relative"><DollarSign size={13} className="absolute left-3 top-2.5 text-stone-400" />
                    <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="w-full pl-8 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="8500" /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Capacity</label>
                  <div className="relative"><Users size={13} className="absolute left-3 top-2.5 text-stone-400" />
                    <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="w-full pl-8 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="200" /></div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Address</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="123 Main St, Nashville, TN" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Image URL</label>
                  <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Amenities <span className="text-stone-400">(comma separated)</span></label>
                  <input value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Parking, Catering kitchen, Bridal suite…" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50">
          {step === 'details' && <button onClick={() => setStep('url')} className="text-sm text-stone-500 hover:text-stone-700">← Back</button>}
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
            {step === 'details' && (
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}{saving ? 'Saving…' : 'Add venue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Venue Detail Slide-out ───────────────────────────────────────────────────
function VenueDetail({ venue, onClose, onSelect, onDelete, onUpdate }: {
  venue: Venue; onClose: () => void; onSelect: (v: Venue) => void; onDelete: (id: string) => void; onUpdate: (v: Venue) => void
}) {
  const [selecting, setSelecting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(venue.notes)
  const [saving, setSaving] = useState(false)

  const handleSelect = async () => {
    setSelecting(true)
    const res = await fetch(`/api/venues/${venue.id}/select`, { method: 'POST' })
    onSelect(await res.json())
    setSelecting(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Remove "${venue.name}"?`)) return
    setDeleting(true)
    await fetch(`/api/venues/${venue.id}`, { method: 'DELETE' })
    onDelete(venue.id)
  }

  const saveNotes = async () => {
    setSaving(true)
    const res = await fetch(`/api/venues/${venue.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) })
    onUpdate(await res.json())
    setSaving(false); setEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Hero */}
        <div className="relative h-64 bg-stone-200 flex-shrink-0">
          {venue.imageUrl
            ? <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />  // eslint-disable-line @next/next/no-img-element
            : <div className="w-full h-full flex items-center justify-center text-stone-400"><MapPin size={40} /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-stone-600 hover:bg-white"><X size={16} /></button>
          {venue.isSelected && <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#7A9C6E] text-white text-xs px-3 py-1 rounded-full"><Check size={12} /> Selected venue</div>}
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-2xl font-light text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{venue.name}</h2>
            {venue.address && <p className="text-white/80 text-sm flex items-center gap-1.5"><MapPin size={12} /> {venue.address}</p>}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#EDF4EA] rounded-xl p-3 text-center">
              <p className="text-lg font-medium text-[#4A6B3E]" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(venue.cost)}</p>
              <p className="text-xs text-[#7A9C6E]">Rental cost</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-lg font-medium text-stone-700" style={{ fontFamily: 'var(--font-display)' }}>{venue.capacity ?? '—'}</p>
              <p className="text-xs text-stone-400">Capacity</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <a href={venue.website} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-0.5 text-stone-500 hover:text-[#7A9C6E]">
                <ExternalLink size={16} /><span className="text-xs">Website</span>
              </a>
            </div>
          </div>
          {venue.description && <div><h3 className="text-sm font-medium text-stone-700 mb-2">About</h3><p className="text-sm text-stone-500 leading-relaxed">{venue.description}</p></div>}
          {(venue.phone || venue.email) && (
            <div><h3 className="text-sm font-medium text-stone-700 mb-2">Contact</h3>
              <div className="space-y-1.5">
                {venue.phone && <a href={`tel:${venue.phone}`} className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#7A9C6E]"><Phone size={14} />{venue.phone}</a>}
                {venue.email && <a href={`mailto:${venue.email}`} className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#7A9C6E]"><Mail size={14} />{venue.email}</a>}
              </div>
            </div>
          )}
          {venue.amenities?.length > 0 && (
            <div><h3 className="text-sm font-medium text-stone-700 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-1.5">{venue.amenities.map((a, i) => <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">{a}</span>)}</div>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-stone-700">Private notes</h3>
              {!editing && <button onClick={() => setEditing(true)} className="text-xs text-stone-400 hover:text-[#7A9C6E] flex items-center gap-1"><Edit3 size={12} />Edit</button>}
            </div>
            {editing ? (
              <div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" autoFocus />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveNotes} disabled={saving} className="text-xs px-3 py-1.5 rounded-lg text-white flex items-center gap-1 disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}Save
                  </button>
                  <button onClick={() => { setEditing(false); setNotes(venue.notes) }} className="text-xs px-3 py-1.5 rounded-lg text-stone-500 border border-stone-200">Cancel</button>
                </div>
              </div>
            ) : <p className="text-sm text-stone-400 italic">{notes || 'No notes yet.'}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50 flex-shrink-0">
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 disabled:opacity-50">
            <Trash2 size={14} />{deleting ? 'Removing…' : 'Remove'}
          </button>
          <div className="flex gap-2">
            {venue.website && <a href={venue.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-stone-200 text-stone-600 hover:bg-white"><ExternalLink size={13} />Visit site</a>}
            {venue.isSelected
              ? <div className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-[#4A6B3E] bg-[#EDF4EA]"><Check size={14} />Our venue</div>
              : <button onClick={handleSelect} disabled={selecting} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                  {selecting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}{selecting ? 'Selecting…' : 'Select as our venue'}
                </button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Venue Card ───────────────────────────────────────────────────────────────
function VenueCard({ venue, onClick }: { venue: Venue; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#7A9C6E] hover:shadow-lg transition-all duration-200 text-left w-full">
      <div className="relative h-48 bg-stone-100 overflow-hidden">
        {venue.imageUrl
          ? <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />  // eslint-disable-line @next/next/no-img-element
          : <div className="w-full h-full flex items-center justify-center"><MapPin size={32} className="text-stone-300" /></div>}
        {venue.isSelected && <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#7A9C6E] text-white text-xs px-2.5 py-1 rounded-full font-medium"><Check size={11} />Our venue</div>}
        <ChevronRight size={16} className="absolute bottom-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-stone-800 text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>{venue.name}</h3>
        {venue.address && <p className="text-xs text-stone-400 flex items-center gap-1 mb-3"><MapPin size={11} />{venue.address}</p>}
        <div className="flex items-center justify-between">
          <div className="bg-[#EDF4EA] px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-[#4A6B3E]">{formatCurrency(venue.cost)}</span>
            <span className="text-xs text-[#7A9C6E]"> /rental</span>
          </div>
          {venue.capacity && <span className="text-xs text-stone-400 flex items-center gap-1"><Users size={11} />{venue.capacity} guests</span>}
        </div>
      </div>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Venue | null>(null)

  useEffect(() => {
    fetch('/api/venues').then(r => r.json()).then(d => { setVenues(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSaved = (v: Venue) => { setVenues(p => [v, ...p]); setShowAdd(false); setSelected(v) }
  const handleSelect = (updated: Venue) => { setVenues(p => p.map(v => ({ ...v, isSelected: v.id === updated.id }))); setSelected(updated) }
  const handleDelete = (id: string) => { setVenues(p => p.filter(v => v.id !== id)); setSelected(null) }
  const handleUpdate = (updated: Venue) => { setVenues(p => p.map(v => v.id === updated.id ? updated : v)); setSelected(updated) }

  const selectedVenue = venues.find(v => v.isSelected)

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Venues</h1>
          <p className="text-sm text-stone-400 mt-0.5">{venues.length === 0 ? "Add venues you're considering" : `${venues.length} venue${venues.length !== 1 ? 's' : ''} · ${selectedVenue ? `"${selectedVenue.name}" selected` : 'None selected yet'}`}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all" style={{ background: '#7A9C6E' }}>
          <Plus size={15} />Add venue
        </button>
      </div>

      {/* Selected banner */}
      {selectedVenue && (
        <div className="mb-6 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(selectedVenue)}>
          <div className="relative h-28 bg-stone-200">
            {selectedVenue.imageUrl && <img src={selectedVenue.imageUrl} alt="" className="w-full h-full object-cover" />}  {/* eslint-disable-line @next/next/no-img-element */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
            <div className="absolute inset-0 flex items-center px-6 gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7A9C6E] flex items-center justify-center flex-shrink-0"><Check size={16} className="text-white" /></div>
              <div>
                <p className="text-xs text-white/70 uppercase tracking-wider">Our venue</p>
                <p className="text-white font-medium text-lg" style={{ fontFamily: 'var(--font-display)' }}>{selectedVenue.name}</p>
                <p className="text-white/70 text-sm">{selectedVenue.address}{selectedVenue.address && selectedVenue.cost ? ' · ' : ''}{selectedVenue.cost ? formatCurrency(selectedVenue.cost) : ''}</p>
              </div>
              <ChevronRight size={18} className="text-white/60 ml-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-stone-400"><Loader2 size={24} className="animate-spin" /></div>
      ) : venues.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4"><MapPin size={28} className="text-stone-300" /></div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-stone-600 mb-2">No venues yet</h3>
          <p className="text-sm text-stone-400 mb-6">Paste a venue website URL — we&apos;ll auto-fill the details.</p>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}><Plus size={14} />Add your first venue</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {venues.map(v => <VenueCard key={v.id} venue={v} onClick={() => setSelected(v)} />)}
          <button onClick={() => setShowAdd(true)} className="h-[264px] rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#7A9C6E] hover:bg-[#EDF4EA]/30 transition-all flex flex-col items-center justify-center gap-3 text-stone-400 hover:text-[#7A9C6E]">
            <Plus size={28} /><span className="text-sm font-medium">Add venue</span>
          </button>
        </div>
      )}

      {showAdd && <AddVenueModal onClose={() => setShowAdd(false)} onSave={handleSaved} />}
      {selected && <VenueDetail venue={selected} onClose={() => setSelected(null)} onSelect={handleSelect} onDelete={handleDelete} onUpdate={handleUpdate} />}
    </div>
  )
}
