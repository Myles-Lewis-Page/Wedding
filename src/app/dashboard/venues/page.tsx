'use client'
import { useState, useEffect } from 'react'
import { Plus, X, Trash2, Loader2, Check, MapPin, Phone, Mail, Users, Globe, Edit3, Star, ExternalLink, ChevronRight } from 'lucide-react'
import { Modal, Field, Input, Btn, PageHeader, Card } from '@/components/ui'
import { $get, $post, $patch, $del, fmt$ } from '@/lib/utils'

interface Venue {
  id: string; name: string; url: string; imageUrl: string; cost: number
  address: string; description: string; capacity: number | null
  phone: string; email: string; website: string; amenities: string[]
  isSelected: boolean; notes: string
}

export default function VenuesPage() {
  const [venues, setVenues]     = useState<Venue[]>([])
  const [loading, setLoading]   = useState(true)
  const [detail, setDetail]     = useState<Venue | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [step, setStep]         = useState<'url' | 'form'>('url')
  const [url, setUrl]           = useState('')
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ name: '', imageUrl: '', cost: '', address: '', description: '', capacity: '', phone: '', email: '', website: '', amenities: '', notes: '' })
  const [editVenue, setEditVenue] = useState({ name: '', imageUrl: '', cost: '', address: '', description: '', capacity: '', phone: '', email: '', website: '', amenities: '', notes: '' })

  useEffect(() => {
    $get('venues').then(d => { setVenues(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const scrape = async () => {
    if (!url.trim()) return
    setScraping(true)
    const res = await $post('scrape', { url })
    if (!res.error) setForm(f => ({ ...f, name: res.name || '', imageUrl: res.imageUrl || '', description: res.description || '', address: res.address || '', phone: res.phone || '', website: res.website || url }))
    setStep('form'); setScraping(false)
  }

  const saveVenue = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await $post('venue', { ...form, cost: parseFloat(form.cost) || 0, capacity: parseInt(form.capacity) || null, amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [], url })
    setVenues(p => [res, ...p]); setShowAdd(false); setDetail(res); setSaving(false)
    setForm({ name: '', imageUrl: '', cost: '', address: '', description: '', capacity: '', phone: '', email: '', website: '', amenities: '', notes: '' })
    setUrl(''); setStep('url')
  }

  const saveEdit = async () => {
    if (!detail || !editVenue.name.trim()) return
    const res = await $patch('venue', { id: detail.id, ...editVenue, cost: parseFloat(editVenue.cost) || 0, capacity: parseInt(editVenue.capacity) || null, amenities: editVenue.amenities ? editVenue.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : [] })
    setVenues(p => p.map(v => v.id === res.id ? res : v)); setDetail(res); setShowEdit(false)
  }

  const selectVenue = async (v: Venue) => {
    const res = await $post('venue-select', { id: v.id })
    // Sync date to rsvp-settings so public page stays current
    setVenues(p => p.map(x => ({ ...x, isSelected: x.id === res.id }))); setDetail(res)
  }

  const unselectVenue = async (v: Venue) => {
    const res = await $patch('venue', { id: v.id, isSelected: false })
    setVenues(p => p.map(x => x.id === v.id ? { ...x, isSelected: false } : x)); setDetail(res)
  }

  const delVenue = async (id: string) => {
    if (!confirm('Remove venue?')) return
    await $del('venue', id); setVenues(p => p.filter(v => v.id !== id)); setDetail(null)
  }

  const selected = venues.find(v => v.isSelected)

  return (
    <div>
      <PageHeader
        title="Venues"
        sub={`${venues.length} venue${venues.length !== 1 ? 's' : ''}${selected ? ` · "${selected.name}" selected` : ''}`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add venue</Btn>}
      />

      {/* Selected banner */}
      {selected && (
        <button onClick={() => setDetail(selected)} className="w-full mb-6 rounded-3xl overflow-hidden text-left hover:shadow-md transition-shadow">
          <div className="relative h-24 bg-stone-300">
            {selected.imageUrl && <img src={selected.imageUrl} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center px-5 gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0"><Check size={16} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 uppercase tracking-wider">Our venue</p>
                <p className="text-white font-medium truncate">{selected.name}</p>
                {selected.address && <p className="text-white/60 text-xs truncate">{selected.address}</p>}
              </div>
              <ChevronRight size={17} className="text-white/60 shrink-0" />
            </div>
          </div>
        </button>
      )}

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : venues.length === 0
          ? (
            <div className="text-center py-20">
              <MapPin size={36} className="text-[#2a3828] mx-auto mb-4" />
              <p className="text-[#5a7057] mb-4">No venues yet — paste a website URL and we&apos;ll fill in the details</p>
              <Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add venue</Btn>
            </div>
          )
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map(v => (
                <button key={v.id} onClick={() => setDetail(v)} className="group rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] hover:border-[var(--sage)] hover:shadow-md transition-all text-left overflow-hidden">
                  <div className="relative h-44 bg-[#1f2b1e]">
                    {v.imageUrl
                      ? <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><MapPin size={30} className="text-[var(--body)]" /></div>}
                    {v.isSelected && <div className="absolute top-2 left-2 bg-[var(--accent)] text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1"><Check size={10} />Selected</div>}
                  </div>
                  <div className="p-5">
                    <p className="font-semibold text-[#e8f0e6] mb-1" style={{ fontFamily: 'var(--font-display)' }}>{v.name}</p>
                    {v.address && <p className="text-xs text-[#5a7057] flex items-center gap-1 mb-3"><MapPin size={10} />{v.address}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--sage)] bg-[#1e3a1e] px-3 py-1 rounded-full">{fmt$(v.cost)}</span>
                      {v.capacity && <span className="text-xs text-[#5a7057] flex items-center gap-1"><Users size={10} />{v.capacity}</span>}
                    </div>
                  </div>
                </button>
              ))}
              <button onClick={() => setShowAdd(true)} className="h-56 rounded-3xl border-2 border-dashed border-[#2a3829] hover:border-[var(--sage)] hover:bg-[#1e3a1e]/30 flex flex-col items-center justify-center gap-2 text-[#5a7057] hover:text-[var(--sage)] transition-all">
                <Plus size={26} /><span className="text-sm">Add venue</span>
              </button>
            </div>
          )}

      {/* Add modal */}
      {showAdd && (
        <Modal
          title="Add venue"
          onClose={() => { setShowAdd(false); setStep('url'); setUrl('') }}
          footer={step === 'form' ? (
            <>
              <Btn variant="ghost" onClick={() => setStep('url')}>← Back</Btn>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={saveVenue} disabled={saving || !form.name.trim()}>
                {saving ? <><Loader2 size={17} className="animate-spin" />Saving…</> : <><Plus size={17} />Add venue</>}
              </Btn>
            </>
          ) : undefined}
        >
          {step === 'url' ? (
            <div className="space-y-4">
              <Field label="Venue website URL">
                <Input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrape()} placeholder="https://thebarnatstonegate.com" autoFocus />
              </Field>
              <Card style={{ padding: 16 }}>
                <p className="text-sm font-medium text-[var(--title)] mb-1">We&apos;ll auto-fill: name, image, address, phone</p>
                <p className="text-xs text-[#7a9878]">You enter the rental cost yourself.</p>
              </Card>
              <div className="flex gap-3">
                <Btn onClick={scrape} disabled={scraping || !url.trim()}>
                  {scraping ? <><Loader2 size={17} className="animate-spin" />Fetching…</> : <><Globe size={17} />Fetch info</>}
                </Btn>
                <Btn variant="ghost" onClick={() => setStep('form')}>Enter manually</Btn>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {form.imageUrl && <div className="h-32 rounded-xl overflow-hidden bg-[#1f2b1e]"><img src={form.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
              <Field label="Venue name *"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="The Barn at Stonegate" autoFocus /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rental cost ($)"><Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="8500" /></Field>
                <Field label="Capacity"><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="200" /></Field>
              </div>
              <Field label="Address"><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Nashville, TN" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone"><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Field>
                <Field label="Email"><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] text-sm focus:outline-none focus:border-[var(--sage)] resize-none" style={{ color: 'var(--title)' }} />
              </Field>
              <Field label="Image URL"><Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
              <Field label="Amenities (comma separated)"><Input value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} placeholder="Parking, Bridal suite, Kitchen…" /></Field>
            </div>
          )}
        </Modal>
      )}

      {/* Edit modal */}
      {showEdit && detail && (
        <Modal
          title={`Edit — ${detail.name}`}
          onClose={() => setShowEdit(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Btn><Btn onClick={saveEdit} disabled={!editVenue.name.trim()}><Check size={17} />Save changes</Btn></>}
        >
          <Field label="Venue name *"><Input value={editVenue.name} onChange={e => setEditVenue(f => ({ ...f, name: e.target.value }))} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rental cost ($)"><Input type="number" value={editVenue.cost} onChange={e => setEditVenue(f => ({ ...f, cost: e.target.value }))} /></Field>
            <Field label="Capacity"><Input type="number" value={editVenue.capacity} onChange={e => setEditVenue(f => ({ ...f, capacity: e.target.value }))} /></Field>
          </div>
          <Field label="Address"><Input value={editVenue.address} onChange={e => setEditVenue(f => ({ ...f, address: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone"><Input value={editVenue.phone} onChange={e => setEditVenue(f => ({ ...f, phone: e.target.value }))} /></Field>
            <Field label="Email"><Input value={editVenue.email} onChange={e => setEditVenue(f => ({ ...f, email: e.target.value }))} /></Field>
          </div>
          <Field label="Description">
            <textarea value={editVenue.description} onChange={e => setEditVenue(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] text-sm focus:outline-none focus:border-[var(--sage)] resize-none" style={{ color: 'var(--title)' }} />
          </Field>
          <Field label="Image URL"><Input value={editVenue.imageUrl} onChange={e => setEditVenue(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
          <Field label="Amenities (comma separated)"><Input value={editVenue.amenities} onChange={e => setEditVenue(f => ({ ...f, amenities: e.target.value }))} /></Field>
          <Field label="Notes">
            <textarea value={editVenue.notes} onChange={e => setEditVenue(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] text-sm focus:outline-none focus:border-[var(--sage)] resize-none" style={{ color: 'var(--title)' }} />
          </Field>
        </Modal>
      )}

      {/* Detail slide-out */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/35" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="w-full max-w-xl bg-[var(--bg3,#1a2419)] h-full flex flex-col overflow-y-auto shadow-2xl">
            <div className="relative h-56 bg-[#243022] shrink-0">
              {detail.imageUrl && <img src={detail.imageUrl} alt={detail.name} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setDetail(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"><X size={16} className="text-white" /></button>
              {detail.isSelected && <div className="absolute top-4 left-4 bg-[var(--accent)] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"><Check size={11} />Selected venue</div>}
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>{detail.name}</h2>
                {detail.address && <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5"><MapPin size={11} />{detail.address}</p>}
              </div>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1e3a1e] rounded-xl p-3 text-center"><p className="text-base font-semibold text-[var(--sage)]">{fmt$(detail.cost)}</p><p className="text-xs text-[var(--sage)]">Rental</p></div>
                <div className="bg-[#1a2419] rounded-xl p-3 text-center"><p className="text-base font-semibold text-[var(--title)]">{detail.capacity ?? '—'}</p><p className="text-xs text-[var(--body)]">Capacity</p></div>
                {detail.website && <a href={detail.website} target="_blank" rel="noreferrer" className="bg-[#1a2419] rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-[#7a9878] hover:text-[var(--sage)] transition-colors"><ExternalLink size={16} /><span className="text-xs">Website</span></a>}
              </div>
              {detail.description && <div><p className="text-xs font-semibold text-[#7a9878] uppercase tracking-wider mb-2">About</p><p className="text-sm text-[#a8c4a4] leading-relaxed">{detail.description}</p></div>}
              {(detail.phone || detail.email) && (
                <div>
                  <p className="text-xs font-semibold text-[#7a9878] uppercase tracking-wider mb-2">Contact</p>
                  {detail.phone && <a href={`tel:${detail.phone}`} className="flex items-center gap-2 text-sm text-[#7a9878] hover:text-[var(--sage)] mb-1"><Phone size={14} />{detail.phone}</a>}
                  {detail.email && <a href={`mailto:${detail.email}`} className="flex items-center gap-2 text-sm text-[#7a9878] hover:text-[var(--sage)]"><Mail size={14} />{detail.email}</a>}
                </div>
              )}
              {detail.amenities?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#7a9878] uppercase tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">{detail.amenities.map((a, i) => <span key={i} className="text-xs bg-[#1f2b1e] text-[#a8c4a4] px-2.5 py-1 rounded-full">{a}</span>)}</div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#202e1f] flex items-center justify-between shrink-0">
              <button onClick={() => delVenue(detail.id)} className="text-sm text-red-400 flex items-center gap-1.5"><Trash2 size={14} />Remove</button>
              <div className="flex gap-3">
                <Btn variant="ghost" onClick={() => { setEditVenue({ name: detail.name, imageUrl: detail.imageUrl, cost: String(detail.cost), address: detail.address, description: detail.description, capacity: detail.capacity ? String(detail.capacity) : '', phone: detail.phone, email: detail.email, website: detail.website, amenities: detail.amenities.join(', '), notes: detail.notes }); setShowEdit(true) }}><Edit3 size={15} />Edit</Btn>
                {detail.isSelected
                  ? <Btn variant="ghost" onClick={() => unselectVenue(detail)}><X size={15} />Unselect</Btn>
                  : <Btn onClick={() => selectVenue(detail)}><Star size={15} />Select as our venue</Btn>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
