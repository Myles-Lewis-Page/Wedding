'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { $get, $post, $patch, $del, fmt$ } from '@/lib/utils'
import {
  Plus, X, Trash2, Loader2, Check, Search, ChevronRight,
  MapPin, Phone, Mail, Users, DollarSign, Globe, Edit3,
  Star, ExternalLink, AlertCircle, Wine, UtensilsCrossed,
  QrCode, Heart, Music, Camera, Gift, Flower2, Shirt, Clock
} from 'lucide-react'

// ─── tiny shared components ────────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
        <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
      </div>
      <div className="overflow-y-auto p-6 space-y-4 flex-1">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex justify-end gap-2 shrink-0">{footer}</div>}
    </div>
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>{children}</div>
)

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] focus:ring-1 focus:ring-[#7A9C6E]/20 bg-white ${props.className || ''}`} />
)

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} className={`w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] bg-white ${props.className || ''}`} />
)

const Btn = ({ children, variant = 'primary', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) => (
  <button {...p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 ${
    variant === 'primary' ? 'text-white' : variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-stone-600 border border-stone-200 hover:bg-stone-50'
  } ${p.className || ''}`} style={variant === 'primary' ? { background: '#7A9C6E', ...p.style } : p.style}>
    {children}
  </button>
)

const Tag = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: color + '20', color }}>{children}</span>
)

const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-3xl font-light text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
      {sub && <p className="text-sm text-stone-400">{sub}</p>}
    </div>
    {action}
  </div>
)

// ─── DASHBOARD HOME ────────────────────────────────────────────────────────
function TabHome({ onTab }: { onTab?: (t: string) => void }) {
  const [stats, setStats] = useState({ total: 0, attending: 0, declined: 0, pending: 0 })
  const [venue, setVenue] = useState<{ name: string; address: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([$get('guest-stats'), $get('venues')]).then(([s, vs]) => {
      setStats(s)
      setVenue(Array.isArray(vs) ? (vs.find((v: { isSelected: boolean }) => v.isSelected) ?? null) : null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const rate = stats.total ? Math.round(((stats.attending + stats.declined) / stats.total) * 100) : 0

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-stone-300" size={28} /></div>

  return (
    <div className="max-w-3xl">
      <PageHeader title="Good morning 🌿" sub="Here's where your wedding planning stands." />

      {venue && (
        <button onClick={() => onTab?.('venues')} className="w-full mb-6 bg-[#EDF4EA] rounded-2xl p-4 flex items-center gap-3 hover:bg-[#e0eddb] transition-colors text-left">
          <MapPin size={16} className="text-[#7A9C6E] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#7A9C6E] font-medium uppercase tracking-wider">Selected venue</p>
            <p className="text-sm font-medium text-[#3d6b2e] truncate">{venue.name}{venue.address ? ` · ${venue.address}` : ''}</p>
          </div>
          <ChevronRight size={14} className="text-[#7A9C6E] shrink-0" />
        </button>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Total guests', val: stats.total, sub: 'on the list', color: '#7A9C6E' },
          { label: 'Attending', val: stats.attending, sub: `${rate}% responded`, color: '#5DCAA5' },
          { label: 'Pending RSVP', val: stats.pending, sub: 'no reply yet', color: '#EF9F27' },
          { label: 'Declined', val: stats.declined, sub: 'unable to come', color: '#D85A30' },
        ].map(({ label, val, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-3xl font-light mb-0.5" style={{ fontFamily: 'var(--font-display)', color }}>{val}</p>
            <p className="text-xs text-stone-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="font-medium text-stone-700">RSVP progress</span>
          <span className="text-stone-400">{stats.attending + stats.declined} / {stats.total}</span>
        </div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-[#7A9C6E] rounded-full transition-all" style={{ width: `${stats.total ? (stats.attending / stats.total) * 100 : 0}%` }} />
          <div className="h-full bg-red-300 transition-all" style={{ width: `${stats.total ? (stats.declined / stats.total) * 100 : 0}%` }} />
        </div>
        <div className="flex gap-5 mt-3 text-xs text-stone-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7A9C6E] inline-block" />Attending</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" />Declined</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-stone-200 inline-block" />Pending</span>
        </div>
      </div>
    </div>
  )
}

// ─── GUESTS ────────────────────────────────────────────────────────────────
interface Guest { id: string; name: string; email: string | null; side: string; hasPlusOne: boolean; plusOneName: string | null; dietary: string | null; rsvpStatus: string; tableId: string | null; isInvitee: boolean; notes: string | null }

function TabGuests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ name: '', email: '', side: 'bride', hasPlusOne: false, dietary: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { $get('guests').then(d => { setGuests(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true); setErr('')
    const res = await $post('guest', form)
    if (res.error) { setErr(res.error); setSaving(false); return }
    setGuests(p => [res, ...p]); setShowAdd(false); setSaving(false)
    setForm({ name: '', email: '', side: 'bride', hasPlusOne: false, dietary: '' })
  }

  const del = async (id: string) => {
    if (!confirm('Remove guest?')) return
    await $del('guest', id); setGuests(p => p.filter(g => g.id !== id))
  }

  const stats = { all: guests.length, attending: guests.filter(g => g.rsvpStatus === 'attending').length, declined: guests.filter(g => g.rsvpStatus === 'declined').length, pending: guests.filter(g => g.rsvpStatus === 'pending').length }
  const filtered = guests.filter(g => (filter === 'all' || g.rsvpStatus === filter) && (g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase())))

  const STATUS: Record<string, [string, string]> = { attending: ['Attending', '#059669'], declined: ['Declined', '#dc2626'], pending: ['Pending', '#d97706'] }

  const exportCSV = () => {
    const csv = [['Name','Email','Side','RSVP','Plus One','Dietary'], ...guests.map(g => [g.name, g.email||'', g.side, g.rsvpStatus, g.plusOneName||'', g.dietary||''])].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'guests.csv'; a.click()
  }

  return (
    <div>
      <PageHeader title="Guest list" sub={`${stats.all} guests · ${stats.attending} attending · ${stats.pending} pending`}
        action={<div className="flex gap-2"><Btn variant="ghost" onClick={exportCSV}>Export CSV</Btn><Btn onClick={() => setShowAdd(true)}><Plus size={14} />Add guest</Btn></div>} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all','attending','declined','pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? 'bg-[#7A9C6E] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
            {f === 'all' ? `All (${stats.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${stats[f]})`}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-3 text-stone-400" />
        <Input placeholder="Search guests…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-stone-300" size={24} /></div> : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead><tr className="border-b border-stone-100 bg-stone-50 text-left text-xs text-stone-400 uppercase tracking-wider">
                {['Name','Side','RSVP','Plus one','Dietary','Table',''].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-stone-400">{guests.length === 0 ? 'No guests yet — add your first one.' : 'No matches found.'}</td></tr>
                ) : filtered.map(g => {
                  const [label, color] = STATUS[g.rsvpStatus] ?? STATUS.pending
                  return (
                    <tr key={g.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EDF4EA] flex items-center justify-center text-xs font-semibold text-[#3d6b2e] shrink-0">
                            {g.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-stone-800">{g.name}</p>
                            {g.isInvitee && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">Invitee</span>}
                          </div>
                          {g.email && <p className="text-xs text-stone-400">{g.email}</p>}
                          {g.notes && <p className="text-xs text-stone-300 italic">{g.notes}</p>}
                        </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs capitalize">{g.side}</td>
                      <td className="px-4 py-3"><Tag color={color}>{label}</Tag></td>
                      <td className="px-4 py-3 text-xs text-stone-500">{g.hasPlusOne ? (g.plusOneName || <span className="text-[#7A9C6E]">✓ allowed</span>) : '—'}</td>
                      <td className="px-4 py-3 text-xs text-stone-500">{g.dietary || '—'}</td>
                      <td className="px-4 py-3"><Tag color={g.tableId ? '#2563eb' : '#78716c'}>{g.tableId ? 'Assigned' : 'Unassigned'}</Tag></td>
                      <td className="px-4 py-3"><button onClick={() => del(g.id)} className="text-stone-300 hover:text-red-400 transition-colors"><Trash2 size={14} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add guest" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving || !form.name.trim()}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Plus size={14} />Add guest</>}</Btn></>}>
          {err && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs rounded-xl p-3"><AlertCircle size={14} />{err}</div>}
          <Field label="Full name *"><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Katie Marsh" autoFocus /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="katie@email.com" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Side"><Select value={form.side} onChange={e => setForm(f => ({...f, side: e.target.value}))}><option value="bride">Bride&apos;s side</option><option value="groom">Groom&apos;s side</option><option value="both">Both</option></Select></Field>
            <Field label="Dietary"><Select value={form.dietary} onChange={e => setForm(f => ({...f, dietary: e.target.value}))}><option value="">None</option><option>Vegetarian</option><option>Vegan</option><option>Gluten-free</option><option>Nut allergy</option><option>Halal</option><option>Kosher</option></Select></Field>
          </div>
          <div className="flex items-center justify-between py-1 px-1">
            <div><p className="text-sm font-medium text-stone-700">Plus one allowed</p><p className="text-xs text-stone-400">Can bring a guest</p></div>
            <button onClick={() => setForm(f => ({...f, hasPlusOne: !f.hasPlusOne}))} className={`w-11 h-6 rounded-full transition-colors relative ${form.hasPlusOne ? 'bg-[#7A9C6E]' : 'bg-stone-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.hasPlusOne ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── VENUES ────────────────────────────────────────────────────────────────
interface Venue { id: string; name: string; url: string; imageUrl: string; cost: number; address: string; description: string; capacity: number | null; phone: string; email: string; website: string; amenities: string[]; isSelected: boolean; notes: string }

function TabVenues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<Venue | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [step, setStep] = useState<'url'|'form'>('url')
  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [weddingDate, setWeddingDate] = useState('')
  const [dateSaved, setDateSaved] = useState(false)
  const [form, setForm] = useState({ name:'', imageUrl:'', cost:'', address:'', description:'', capacity:'', phone:'', email:'', website:'', amenities:'', notes:'' })

  useEffect(() => {
    $get('venues').then(d => { setVenues(Array.isArray(d) ? d : []); setLoading(false) })
    const d = localStorage.getItem('weddingDate'); if (d) setWeddingDate(d)
  }, [])

  const scrape = async () => {
    if (!url.trim()) return
    setScraping(true)
    const res = await $post('scrape', { url })
    if (!res.error) setForm(f => ({ ...f, name: res.name||'', imageUrl: res.imageUrl||'', description: res.description||'', address: res.address||'', phone: res.phone||'', website: res.website||url }))
    setStep('form'); setScraping(false)
  }

  const saveVenue = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await $post('venue', { ...form, cost: parseFloat(form.cost)||0, capacity: parseInt(form.capacity)||null, amenities: form.amenities ? form.amenities.split(',').map(s=>s.trim()).filter(Boolean) : [], url })
    setVenues(p => [res, ...p]); setShowAdd(false); setDetail(res); setSaving(false)
    setForm({ name:'', imageUrl:'', cost:'', address:'', description:'', capacity:'', phone:'', email:'', website:'', amenities:'', notes:'' }); setUrl(''); setStep('url')
  }

  const [showEdit, setShowEdit] = useState(false)
  const [editVenue, setEditVenue] = useState({ name:'', imageUrl:'', cost:'', address:'', description:'', capacity:'', phone:'', email:'', website:'', amenities:'', notes:'' })

  const selectVenue = async (v: Venue) => {
    const res = await $post('venue-select', { id: v.id })
    setVenues(p => p.map(x => ({ ...x, isSelected: x.id === res.id }))); setDetail(res)
  }

  const unselectVenue = async (v: Venue) => {
    const res = await $patch('venue', { id: v.id, isSelected: false })
    setVenues(p => p.map(x => x.id === v.id ? { ...x, isSelected: false } : x)); setDetail(res)
  }

  const saveEdit = async () => {
    if (!detail || !editVenue.name.trim()) return
    const res = await $patch('venue', {
      id: detail.id,
      name: editVenue.name, imageUrl: editVenue.imageUrl, cost: parseFloat(editVenue.cost) || 0,
      address: editVenue.address, description: editVenue.description,
      capacity: parseInt(editVenue.capacity) || null, phone: editVenue.phone,
      email: editVenue.email, website: editVenue.website,
      amenities: editVenue.amenities ? editVenue.amenities.split(',').map((s:string) => s.trim()).filter(Boolean) : [],
      notes: editVenue.notes,
    })
    setVenues(p => p.map(v => v.id === res.id ? res : v)); setDetail(res); setShowEdit(false)
  }

  const delVenue = async (id: string) => {
    if (!confirm('Remove venue?')) return
    await $del('venue', id); setVenues(p => p.filter(v => v.id !== id)); setDetail(null)
  }

  const saveDate = () => {
    if (!weddingDate) return
    localStorage.setItem('weddingDate', weddingDate)
    setDateSaved(true); setTimeout(() => setDateSaved(false), 2000)
  }

  const selected = venues.find(v => v.isSelected)
  const fmtDate = weddingDate ? new Date(weddingDate + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : null

  return (
    <div>
      <PageHeader title="Venues" sub={`${venues.length} venue${venues.length !== 1 ? 's' : ''}${selected ? ` · "${selected.name}" selected` : ''}`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} />Add venue</Btn>} />

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
        <p className="text-sm font-medium text-stone-700 mb-1">Wedding date</p>
        <p className="text-xs text-stone-400 mb-3">{fmtDate || 'Pick your date — it shows across the whole app'}</p>
        <div className="flex gap-3">
          <Input type="date" value={weddingDate} onChange={e => { setWeddingDate(e.target.value); setDateSaved(false) }} className="flex-1" />
          <Btn onClick={saveDate} disabled={!weddingDate} style={{ background: dateSaved ? '#5DCAA5' : '#7A9C6E' }}>
            {dateSaved ? <><Check size={14} />Saved!</> : 'Save date'}
          </Btn>
        </div>
      </div>

      {/* Selected banner */}
      {selected && (
        <button onClick={() => setDetail(selected)} className="w-full mb-6 rounded-2xl overflow-hidden text-left hover:shadow-md transition-shadow">
          <div className="relative h-24 bg-stone-300">
            {selected.imageUrl && <img src={selected.imageUrl} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center px-5 gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7A9C6E] flex items-center justify-center shrink-0"><Check size={15} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 uppercase tracking-wider">Our venue</p>
                <p className="text-white font-medium truncate">{selected.name}</p>
                {selected.address && <p className="text-white/60 text-xs truncate">{selected.address}</p>}
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>
          </div>
        </button>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-stone-300" size={24} /></div>
      : venues.length === 0 ? (
        <div className="text-center py-20">
          <MapPin size={36} className="text-stone-200 mx-auto mb-4" />
          <p className="text-stone-400 mb-4">No venues yet — paste a website URL and we&apos;ll fill in the details</p>
          <Btn onClick={() => setShowAdd(true)}><Plus size={14} />Add venue</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map(v => (
            <button key={v.id} onClick={() => setDetail(v)} className="group bg-white rounded-2xl border border-stone-200 hover:border-[#7A9C6E] hover:shadow-md transition-all text-left overflow-hidden">
              <div className="relative h-44 bg-stone-100">
                {v.imageUrl ? <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><MapPin size={28} className="text-stone-300" /></div>}
                {v.isSelected && <div className="absolute top-2 left-2 bg-[#7A9C6E] text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1"><Check size={10} />Selected</div>}
              </div>
              <div className="p-4">
                <p className="font-semibold text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>{v.name}</p>
                {v.address && <p className="text-xs text-stone-400 flex items-center gap-1 mb-3"><MapPin size={10} />{v.address}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#3d6b2e] bg-[#EDF4EA] px-3 py-1 rounded-full">{fmt$(v.cost)}</span>
                  {v.capacity && <span className="text-xs text-stone-400 flex items-center gap-1"><Users size={10} />{v.capacity}</span>}
                </div>
              </div>
            </button>
          ))}
          <button onClick={() => setShowAdd(true)} className="h-56 rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#7A9C6E] hover:bg-[#EDF4EA]/30 flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-[#7A9C6E] transition-all">
            <Plus size={24} /><span className="text-sm">Add venue</span>
          </button>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add venue" onClose={() => { setShowAdd(false); setStep('url'); setUrl('') }}
          footer={step === 'form' ? <><Btn variant="ghost" onClick={() => setStep('url')}>← Back</Btn><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={saveVenue} disabled={saving || !form.name.trim()}>{saving ? <><Loader2 size={14} className="animate-spin"/>Saving…</> : <><Plus size={14}/>Add venue</>}</Btn></> : undefined}>
          {step === 'url' ? (
            <div className="space-y-4">
              <Field label="Venue website URL">
                <Input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrape()} placeholder="https://thebarnatstonegate.com" autoFocus />
              </Field>
              <div className="bg-stone-50 rounded-xl p-4 text-xs text-stone-500 space-y-1">
                <p className="font-medium text-stone-700">We&apos;ll auto-fill: name, image, address, phone</p>
                <p>You enter the rental cost yourself.</p>
              </div>
              <div className="flex gap-2">
                <Btn onClick={scrape} disabled={scraping || !url.trim()} className="flex-1 justify-center">
                  {scraping ? <><Loader2 size={14} className="animate-spin"/>Fetching…</> : <><Globe size={14}/>Fetch info</>}
                </Btn>
                <Btn variant="ghost" onClick={() => setStep('form')}>Enter manually</Btn>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {form.imageUrl && <div className="h-32 rounded-xl overflow-hidden bg-stone-100"><img src={form.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
              <Field label="Venue name *"><Input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="The Barn at Stonegate" autoFocus /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rental cost ($)"><Input type="number" value={form.cost} onChange={e => setForm(f=>({...f,cost:e.target.value}))} placeholder="8500" /></Field>
                <Field label="Capacity"><Input type="number" value={form.capacity} onChange={e => setForm(f=>({...f,capacity:e.target.value}))} placeholder="200" /></Field>
              </div>
              <Field label="Address"><Input value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="123 Main St, Nashville, TN" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone"><Input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></Field>
                <Field label="Email"><Input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></Field>
              </div>
              <Field label="Description"><textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" /></Field>
              <Field label="Image URL"><Input value={form.imageUrl} onChange={e => setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." /></Field>
              <Field label="Amenities (comma separated)"><Input value={form.amenities} onChange={e => setForm(f=>({...f,amenities:e.target.value}))} placeholder="Parking, Bridal suite, Kitchen…" /></Field>
            </div>
          )}
        </Modal>
      )}

      {/* Edit venue modal */}
      {showEdit && detail && (
        <Modal title={`Edit — ${detail.name}`} onClose={() => setShowEdit(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Btn><Btn onClick={saveEdit} disabled={!editVenue.name.trim()}><Check size={14}/>Save changes</Btn></>}>
          <Field label="Venue name *"><Input value={editVenue.name} onChange={e=>setEditVenue(f=>({...f,name:e.target.value}))} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rental cost ($)"><Input type="number" value={editVenue.cost} onChange={e=>setEditVenue(f=>({...f,cost:e.target.value}))} /></Field>
            <Field label="Capacity"><Input type="number" value={editVenue.capacity} onChange={e=>setEditVenue(f=>({...f,capacity:e.target.value}))} /></Field>
          </div>
          <Field label="Address"><Input value={editVenue.address} onChange={e=>setEditVenue(f=>({...f,address:e.target.value}))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><Input value={editVenue.phone} onChange={e=>setEditVenue(f=>({...f,phone:e.target.value}))} /></Field>
            <Field label="Email"><Input value={editVenue.email} onChange={e=>setEditVenue(f=>({...f,email:e.target.value}))} /></Field>
          </div>
          <Field label="Description"><textarea value={editVenue.description} onChange={e=>setEditVenue(f=>({...f,description:e.target.value}))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" /></Field>
          <Field label="Image URL"><Input value={editVenue.imageUrl} onChange={e=>setEditVenue(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." /></Field>
          <Field label="Amenities (comma separated)"><Input value={editVenue.amenities} onChange={e=>setEditVenue(f=>({...f,amenities:e.target.value}))} placeholder="Parking, Bridal suite…" /></Field>
          <Field label="Notes"><textarea value={editVenue.notes} onChange={e=>setEditVenue(f=>({...f,notes:e.target.value}))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" /></Field>
        </Modal>
      )}

      {/* Detail slide-out */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/35" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="w-full max-w-xl bg-white h-full flex flex-col overflow-y-auto shadow-2xl">
            <div className="relative h-56 bg-stone-200 shrink-0">
              {detail.imageUrl && <img src={detail.imageUrl} alt={detail.name} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setDetail(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"><X size={15} /></button>
              {detail.isSelected && <div className="absolute top-4 left-4 bg-[#7A9C6E] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"><Check size={11} />Selected venue</div>}
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>{detail.name}</h2>
                {detail.address && <p className="text-white/70 text-sm flex items-center gap-1.5 mt-0.5"><MapPin size={11} />{detail.address}</p>}
              </div>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#EDF4EA] rounded-xl p-3 text-center"><p className="text-lg font-semibold text-[#3d6b2e]">{fmt$(detail.cost)}</p><p className="text-xs text-[#7A9C6E]">Rental</p></div>
                <div className="bg-stone-50 rounded-xl p-3 text-center"><p className="text-lg font-semibold text-stone-700">{detail.capacity ?? '—'}</p><p className="text-xs text-stone-400">Capacity</p></div>
                <a href={detail.website} target="_blank" rel="noreferrer" className="bg-stone-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-[#7A9C6E] transition-colors"><ExternalLink size={15} /><span className="text-xs">Website</span></a>
              </div>
              {detail.description && <div><p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">About</p><p className="text-sm text-stone-600 leading-relaxed">{detail.description}</p></div>}
              {(detail.phone || detail.email) && (
                <div><p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Contact</p>
                  {detail.phone && <a href={`tel:${detail.phone}`} className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#7A9C6E] mb-1"><Phone size={13}/>{detail.phone}</a>}
                  {detail.email && <a href={`mailto:${detail.email}`} className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#7A9C6E]"><Mail size={13}/>{detail.email}</a>}
                </div>
              )}
              {detail.amenities?.length > 0 && (
                <div><p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">{detail.amenities.map((a,i) => <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">{a}</span>)}</div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
              <button onClick={() => delVenue(detail.id)} className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1.5"><Trash2 size={13}/>Remove</button>
              <div className="flex gap-2">
                {detail.website && <Btn variant="ghost" onClick={() => window.open(detail.website, '_blank')}><ExternalLink size={13}/>Visit site</Btn>}
                <Btn variant="ghost" onClick={() => {
                  setEditVenue({
                    name: detail.name, imageUrl: detail.imageUrl, cost: String(detail.cost),
                    address: detail.address, description: detail.description, capacity: detail.capacity ? String(detail.capacity) : '',
                    phone: detail.phone, email: detail.email, website: detail.website,
                    amenities: detail.amenities.join(', '), notes: detail.notes,
                  })
                  setShowEdit(true)
                }}><Edit3 size={13}/>Edit</Btn>
                {detail.isSelected
                  ? <Btn variant="ghost" onClick={() => unselectVenue(detail)}><X size={13}/>Unselect</Btn>
                  : <Btn onClick={() => selectVenue(detail)}><Star size={13}/>Select as our venue</Btn>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BUDGET ────────────────────────────────────────────────────────────────
interface BudgetCat { id: string; name: string; budgeted: number; paid: number; color: string; order: number }

function TabBudget() {
  const [cats, setCats] = useState<BudgetCat[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(45000)
  const [addName, setAddName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const COLORS = ['#8FAF7A','#5DCAA5','#378ADD','#EF9F27','#D85A30','#D4537E','#7F77DD','#888780']

  useEffect(() => { $get('budget').then(d => { setCats(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const update = async (id: string, field: string, val: number) => {
    setCats(p => p.map(c => c.id === id ? { ...c, [field]: val } : c))
    await $patch('budget', { id, [field]: val })
  }

  const add = async () => {
    if (!addName.trim()) return
    const color = COLORS[cats.length % COLORS.length]
    const res = await $post('budget', { name: addName, color, order: cats.length })
    setCats(p => [...p, res]); setAddName(''); setShowAdd(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete category?')) return
    await $del('budget', id); setCats(p => p.filter(c => c.id !== id))
  }

  const allocated = cats.reduce((s,c) => s + c.budgeted, 0)
  const paid = cats.reduce((s,c) => s + c.paid, 0)

  return (
    <div>
      <PageHeader title="Budget" sub="Track every dollar before you spend it"
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={14}/>Add category</Btn>} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total budget', val: total, editable: true },
          { label:'Allocated', val: allocated, sub: `${total ? Math.round(allocated/total*100) : 0}%` },
          { label:'Paid', val: paid, sub: `${allocated ? Math.round(paid/allocated*100) : 0}% of allocated` },
          { label:'Remaining', val: total - allocated, color: total - allocated < 0 ? '#dc2626' : undefined },
        ].map(({ label, val, sub, editable, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">{label}</p>
            {editable
              ? <div className="flex items-baseline gap-0.5"><span className="text-stone-400">$</span><input type="number" value={total} onChange={e => setTotal(+e.target.value)} className="text-2xl font-light w-full focus:outline-none" style={{ fontFamily: 'var(--font-display)' }} /></div>
              : <p className="text-2xl font-light" style={{ fontFamily: 'var(--font-display)', color: color || '#1c1917' }}>{fmt$(val)}</p>}
            {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Allocation bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
        <div className="flex justify-between text-xs text-stone-400 mb-2"><span>Allocation</span><span>{fmt$(allocated)} of {fmt$(total)}</span></div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden flex gap-px">
          {cats.filter(c => c.budgeted > 0).map(c => <div key={c.id} className="h-full transition-all" style={{ width: `${(c.budgeted/total)*100}%`, background: c.color }} />)}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {cats.map(c => <span key={c.id} className="flex items-center gap-1.5 text-xs text-stone-500"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>)}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-stone-300" size={22}/></div> : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-stone-100 bg-stone-50 text-left text-xs text-stone-400 uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Budgeted</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium w-36">Progress</th>
              <th className="px-4 py-3 w-8" />
            </tr></thead>
            <tbody>
              {cats.map(c => {
                const rem = c.budgeted - c.paid
                const pct = c.budgeted > 0 ? Math.min(Math.round(c.paid/c.budgeted*100), 100) : 0
                return (
                  <tr key={c.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 group">
                    <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-3 h-3 rounded-full" style={{ background: c.color }}/><span className="font-medium text-stone-800">{c.name}</span></div></td>
                    <td className="px-4 py-3.5"><div className="relative"><span className="absolute left-2 top-1.5 text-stone-400 text-xs">$</span><input type="number" defaultValue={c.budgeted} onBlur={e => update(c.id,'budgeted',+e.target.value)} className="w-28 pl-5 pr-2 py-1.5 rounded-lg border border-transparent hover:border-stone-200 focus:border-[#7A9C6E] focus:outline-none text-sm bg-transparent focus:bg-white" /></div></td>
                    <td className="px-4 py-3.5"><div className="relative"><span className="absolute left-2 top-1.5 text-stone-400 text-xs">$</span><input type="number" defaultValue={c.paid} onBlur={e => update(c.id,'paid',+e.target.value)} className="w-28 pl-5 pr-2 py-1.5 rounded-lg border border-transparent hover:border-stone-200 focus:border-[#7A9C6E] focus:outline-none text-sm bg-transparent focus:bg-white" /></div></td>
                    <td className="px-4 py-3.5 text-sm font-medium" style={{ color: rem < 0 ? '#dc2626' : '#1c1917' }}>{fmt$(rem)}</td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${pct}%`, background: c.color }}/></div><span className="text-xs text-stone-400 w-8 text-right">{pct}%</span></div></td>
                    <td className="px-4 py-3.5"><button onClick={() => del(c.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13}/></button></td>
                  </tr>
                )
              })}
              {cats.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-stone-400">No categories yet</td></tr>}
            </tbody>
            <tfoot className="border-t border-stone-200 bg-stone-50">
              <tr><td className="px-5 py-3 text-sm font-semibold">Total</td><td className="px-4 py-3 text-sm font-semibold">{fmt$(allocated)}</td><td className="px-4 py-3 text-sm font-semibold">{fmt$(paid)}</td><td className="px-4 py-3 text-sm font-semibold" style={{ color: total-allocated < 0 ? '#dc2626' : '#3d6b2e' }}>{fmt$(total-allocated)}</td><td colSpan={2}/></tr>
            </tfoot>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Add category" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!addName.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Category name"><Input value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => e.key==='Enter' && add()} placeholder="Photography, Flowers…" autoFocus /></Field>
        </Modal>
      )}
    </div>
  )
}

// ─── VENDORS ────────────────────────────────────────────────────────────────
interface Vendor { id: string; name: string; category: string; contactName: string; phone: string; email: string; website: string; cost: number; paid: number; status: string; notes: string }
const VENDOR_CATS = ['Catering','Photography','Videography','Flowers','Music / DJ','Hair & Makeup','Officiant','Cake','Transportation','Lighting','Stationery','Photo Booth','Other']
const VENDOR_STATUS: Record<string, [string,string]> = { researching:['Researching','#78716c'], contacted:['Contacted','#2563eb'], booked:['Booked','#d97706'], paid:['Paid','#059669'] }

function TabVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ name:'', category:'Photography', contactName:'', phone:'', email:'', website:'', cost:'', notes:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { $get('vendors').then(d => { setVendors(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await $post('vendor', { ...form, cost: parseFloat(form.cost)||0 })
    setVendors(p => [res, ...p]); setShowAdd(false); setSaving(false)
    setForm({ name:'', category:'Photography', contactName:'', phone:'', email:'', website:'', cost:'', notes:'' })
  }

  const updateStatus = async (id: string, status: string) => {
    setVendors(p => p.map(v => v.id===id ? {...v,status} : v))
    await $patch('vendor', { id, status })
  }

  const del = async (id: string) => {
    if (!confirm('Delete vendor?')) return
    await $del('vendor', id); setVendors(p => p.filter(v => v.id !== id))
  }

  const cats = ['All', ...Array.from(new Set(vendors.map(v => v.category)))]
  const filtered = filter === 'All' ? vendors : vendors.filter(v => v.category === filter)

  return (
    <div>
      <PageHeader title="Vendors" sub={`${vendors.length} vendors · ${vendors.filter(v=>v.status==='booked'||v.status==='paid').length} booked`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={14}/>Add vendor</Btn>} />

      <div className="flex gap-2 mb-5 flex-wrap">
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter===c?'bg-[#7A9C6E] text-white':'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{c}</button>)}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-stone-300" size={22}/></div> : (
        <div className="space-y-3">
          {filtered.length === 0 ? <div className="text-center py-16 text-stone-400">No vendors yet</div> :
            filtered.map(v => {
              const [slabel, scolor] = VENDOR_STATUS[v.status] ?? VENDOR_STATUS.researching
              return (
                <div key={v.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-start gap-4 hover:border-stone-300 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-stone-800">{v.name}</p>
                      <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{v.category}</span>
                    </div>
                    {v.contactName && <p className="text-xs text-stone-400 mb-1">{v.contactName}</p>}
                    <div className="flex flex-wrap gap-3">
                      {v.phone && <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><Phone size={11}/>{v.phone}</a>}
                      {v.email && <a href={`mailto:${v.email}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><Mail size={11}/>{v.email}</a>}
                      {v.website && <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><ExternalLink size={11}/>Website</a>}
                    </div>
                    {v.notes && <p className="text-xs text-stone-400 mt-1.5 italic">{v.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-semibold text-stone-700">{fmt$(v.cost)}</p>
                    <select value={v.status} onChange={e => updateStatus(v.id,e.target.value)} className="text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none" style={{ background: scolor+'20', color: scolor }}>
                      {Object.entries(VENDOR_STATUS).map(([k,[l]]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                    <button onClick={() => del(v.id)} className="text-stone-300 hover:text-red-400"><Trash2 size={13}/></button>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add vendor" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving||!form.name.trim()}>{saving?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><Plus size={14}/>Add vendor</>}</Btn></>}>
          <Field label="Name *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="ABC Photography" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{VENDOR_CATS.map(c=><option key={c}>{c}</option>)}</Select></Field>
            <Field label="Contact name"><Input value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></Field>
            <Field label="Email"><Input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></Field>
            <Field label="Website"><Input value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} placeholder="https://..." /></Field>
            <Field label="Total cost ($)"><Input type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} /></Field>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" /></Field>
        </Modal>
      )}
    </div>
  )
}

// ─── TASKS ─────────────────────────────────────────────────────────────────
interface Task { id: string; title: string; category: string; dueDate: string|null; priority: string; completed: boolean; assignedTo: string }
const PRIORITY_COLOR: Record<string,string> = { low:'#78716c', medium:'#d97706', high:'#dc2626' }

function TabTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'pending'|'all'|'done'>('pending')
  const [form, setForm] = useState({ title:'', category:'General', dueDate:'', priority:'medium', assignedTo:'Both' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { $get('tasks').then(d => { setTasks(Array.isArray(d)?d:[]); setLoading(false) }) }, [])

  const toggle = async (t: Task) => {
    setTasks(p => p.map(tk => tk.id===t.id ? {...tk,completed:!t.completed} : tk))
    await $patch('task', { id: t.id, completed: !t.completed })
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const res = await $post('task', { ...form, dueDate: form.dueDate || null })
    setTasks(p => [res, ...p]); setShowAdd(false); setSaving(false)
    setForm({ title:'', category:'General', dueDate:'', priority:'medium', assignedTo:'Both' })
  }

  const del = async (id: string) => {
    await $del('task', id); setTasks(p => p.filter(t => t.id !== id))
  }

  const done = tasks.filter(t => t.completed).length
  const shown = tasks.filter(t => filter==='all' ? true : filter==='done' ? t.completed : !t.completed)

  return (
    <div>
      <PageHeader title="Tasks" sub={`${done} of ${tasks.length} complete`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={14}/>Add task</Btn>} />

      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-5">
        <div className="flex justify-between text-xs text-stone-400 mb-1.5"><span>Progress</span><span>{tasks.length ? Math.round(done/tasks.length*100) : 0}%</span></div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-[#7A9C6E] rounded-full transition-all" style={{ width: `${tasks.length ? done/tasks.length*100 : 0}%` }}/></div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['pending','all','done'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter===f?'bg-[#7A9C6E] text-white':'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{f==='pending'?`To do (${tasks.filter(t=>!t.completed).length})`:f==='done'?`Done (${done})`:`All (${tasks.length})`}</button>)}
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-stone-300" size={22}/></div> : (
        <div className="space-y-2">
          {shown.length === 0 ? <div className="text-center py-12 text-stone-400">{filter==='done'?'No completed tasks':'All caught up! 🎉'}</div> :
            shown.map(t => (
              <div key={t.id} className={`bg-white rounded-xl border border-stone-200 p-3.5 flex items-center gap-3 group transition-colors hover:border-stone-300 ${t.completed?'opacity-60':''}`}>
                <button onClick={() => toggle(t)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.completed?'border-[#7A9C6E] bg-[#7A9C6E]':'border-stone-300 hover:border-[#7A9C6E]'}`}>
                  {t.completed && <Check size={11} className="text-white"/>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${t.completed?'line-through text-stone-400':'text-stone-800'}`}>{t.title}</p>
                  <p className="text-xs text-stone-400">{t.category}{t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : ''}{t.assignedTo ? ` · ${t.assignedTo}` : ''}</p>
                </div>
                <Tag color={PRIORITY_COLOR[t.priority]||'#78716c'}>{t.priority}</Tag>
                <button onClick={() => del(t.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={13}/></button>
              </div>
            ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add task" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving||!form.title.trim()}>{saving?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><Plus size={14}/>Add</>}</Btn></>}>
          <Field label="Task *"><Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&save()} placeholder="Book venue walkthrough" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {['General','Venue','Catering','Photography','Florals','Music','Attire','Legal','Honeymoon','Day-of'].map(c=><option key={c}>{c}</option>)}
            </Select></Field>
            <Field label="Priority"><Select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
              {['low','medium','high'].map(p=><option key={p} className="capitalize">{p}</option>)}
            </Select></Field>
            <Field label="Due date"><Input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} /></Field>
            <Field label="Assigned to"><Select value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>
              {['Both','Jennifer','Myles','Planner'].map(a=><option key={a}>{a}</option>)}
            </Select></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── SIMPLE TABS (checklists, party, timeline, menu, decor, attire, photoshoot, playlist, gifts, rsvp, seating, moodboard) ─────
function TabChecklist() {
  const ITEMS: Record<string, string[]> = {
    '12+ months': ['Set budget','Choose date','Book venue','Hire photographer','Start dress shopping','Book videographer','Send save-the-dates'],
    '8–12 months': ['Book caterer','Hire florist','Book hair & makeup','Book officiant','Book DJ or band','Register for gifts'],
    '6–8 months': ['Order wedding dress','Choose wedding party attire','Book transportation','Book rehearsal dinner venue','Order cake'],
    '4–6 months': ['Send invitations','Finalize menu','Purchase wedding rings','Schedule dress fittings','Book hotel room blocks'],
    '1–3 months': ['Final dress fitting','Confirm all vendors','Finalize seating chart','Write vows','Get marriage license'],
    'Week of': ['Pick up dress','Rehearsal dinner','Pack honeymoon','Confirm headcount','Rest & relax!'],
  }
  const [done, setDone] = useState<Set<string>>(new Set())
  const toggle = (k: string) => setDone(p => { const n = new Set(p); n.has(k)?n.delete(k):n.add(k); return n })
  const total = Object.values(ITEMS).flat().length
  return (
    <div>
      <PageHeader title="Checklist" sub={`${done.size} of ${total} complete`} />
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-5">
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-[#7A9C6E] rounded-full transition-all" style={{ width:`${(done.size/total)*100}%` }}/></div>
        <p className="text-xs text-stone-400 text-right mt-1">{Math.round(done.size/total*100)}%</p>
      </div>
      <div className="space-y-4">
        {Object.entries(ITEMS).map(([section, items]) => (
          <div key={section} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex justify-between px-5 py-3 border-b border-stone-100 bg-stone-50">
              <p className="text-sm font-medium text-stone-700">{section}</p>
              <span className="text-xs text-stone-400">{items.filter(i=>done.has(`${section}-${i}`)).length}/{items.length}</span>
            </div>
            <div className="p-2">
              {items.map(item => { const k=`${section}-${item}`; const checked=done.has(k); return (
                <button key={item} onClick={() => toggle(k)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-stone-50 ${checked?'opacity-60':''}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${checked?'border-[#7A9C6E] bg-[#7A9C6E]':'border-stone-300'}`}>{checked&&<Check size={11} className="text-white"/>}</div>
                  <span className={`text-sm ${checked?'line-through text-stone-400':'text-stone-700'}`}>{item}</span>
                </button>
              )})}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabRSVP() {
  const RSVP_URL = 'https://wedding-production-7483.up.railway.app/rsvp'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Draw QR code using canvas — simple matrix-based QR for the fixed URL
    // We use a data URL approach via an img tag with the QR API
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(RSVP_URL)}&bgcolor=ffffff&color=3d6b2e&margin=10`
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (ctx) { ctx.clearRect(0,0,200,200); ctx.drawImage(img,0,0,200,200) }
    }
  }, [])

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'rsvp-qr-code.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(RSVP_URL)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader title="RSVP portal" sub="Share this QR code on your invitations" />
      <div className="flex gap-6 items-start max-w-2xl">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shrink-0">
          <canvas ref={canvasRef} width={200} height={200} className="rounded-xl mx-auto mb-4 block" style={{imageRendering:'pixelated'}} />
          <p className="text-xs text-stone-400 mb-4 break-all max-w-[200px]">{RSVP_URL}</p>
          <div className="flex flex-col gap-2">
            <Btn onClick={downloadQR} className="w-full justify-center"><QrCode size={14}/>Download QR</Btn>
            <Btn variant="ghost" onClick={copyLink} className="w-full justify-center">
              {copied ? <><Check size={13}/>Copied!</> : 'Copy link'}
            </Btn>
            <Btn variant="ghost" onClick={() => window.open(RSVP_URL,'_blank')} className="w-full justify-center"><ExternalLink size={13}/>Preview RSVP</Btn>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="bg-[#EDF4EA] rounded-2xl p-5">
            <p className="text-sm font-semibold text-[#3d6b2e] mb-3">How guests RSVP</p>
            {[
              ['Scan QR code on invite','Opens the RSVP page on their phone'],
              ['Enter their name','System matches against your guest list'],
              ['Confirm plus one','Only shown if they are allowed one'],
              ['Dietary needs & email','We collect for catering and send confirmation'],
              ['Auto-added to seating','Attending guests appear in unassigned pool'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <div className="w-5 h-5 rounded-full bg-[#7A9C6E] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                <div><p className="text-sm font-medium text-[#3d6b2e]">{title}</p><p className="text-xs text-[#5a8a4a]">{desc}</p></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Print tip</p>
            <p className="text-sm text-stone-500">Download the QR code and add it to your invitation design. Recommended size: 1.5" × 1.5" minimum so it scans reliably.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabMoodboard() {
  const [items, setItems] = useState<{ id:string; label:string; imageUrl:string; category:string }[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ imageUrl:'', label:'', category:'Florals' })
  const CATS = ['Color palette','Venue','Florals','Tablescape','Dress','Invitations','Décor','Cake','Hair & makeup']
  const add = () => { if (!form.imageUrl.trim()) return; setItems(p=>[...p,{id:Date.now().toString(),...form}]); setForm({imageUrl:'',label:'',category:'Florals'}); setShowAdd(false) }
  return (
    <div>
      <PageHeader title="Mood board" sub="Pin anything that inspires your vision" action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add image</Btn>} />
      {items.length === 0
        ? <div className="text-center py-20 text-stone-400"><p className="mb-4">Paste image URLs from Pinterest, Instagram, or anywhere</p><Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add first image</Btn></div>
        : <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-stone-200">
                <img src={item.imageUrl} alt={item.label} className="w-full object-cover" onError={e=>e.currentTarget.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23f1efe8" width="300" height="200"/><text x="150" y="105" text-anchor="middle" fill="%23aaa" font-size="14">Image not found</text></svg>'} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-xs">{item.label || item.category}</span>
                  <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} className="ml-auto w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X size={11}/></button>
                </div>
              </div>
            ))}
          </div>}
      {showAdd && (
        <Modal title="Add to mood board" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.imageUrl.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Image URL *"><Input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." autoFocus /></Field>
          <Field label="Category"><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</Select></Field>
          <Field label="Label"><Input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="Inspiration for florals" /></Field>
          {form.imageUrl && <div className="h-32 rounded-xl overflow-hidden bg-stone-100"><img src={form.imageUrl} alt="" className="w-full h-full object-cover"/></div>}
        </Modal>
      )}
    </div>
  )
}

function TabMenu() {
  const [guests, setGuests] = useState(150)
  const [hours, setHours] = useState(5)
  const [menu, setMenu] = useState([
    { course:'Appetizer', items:'Bruschetta, caprese skewers, shrimp cocktail' },
    { course:'Salad', items:'Mixed greens with balsamic vinaigrette' },
    { course:'Main', items:'Filet mignon OR roasted salmon OR mushroom risotto (V)' },
    { course:'Dessert', items:'Wedding cake + dessert bar' },
  ])
  const drinks = { wine: Math.ceil(guests*hours*0.5/5), beer: Math.ceil(guests*hours*0.6), champagne: Math.ceil(guests/8), water: Math.ceil(guests*hours*0.25) }
  return (
    <div>
      <PageHeader title="Menu & drinks" />
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-4"><UtensilsCrossed size={15} className="text-[#7A9C6E]"/><h3 className="font-medium text-stone-800">Menu</h3></div>
          {menu.map((c,i) => (
            <div key={i} className="border-b border-stone-50 pb-3 mb-3 last:border-0 last:mb-0">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{c.course}</p>
              <textarea value={c.items} onChange={e=>setMenu(p=>p.map((m,j)=>j===i?{...m,items:e.target.value}:m))} className="w-full text-sm text-stone-700 resize-none border-0 focus:outline-none bg-transparent" rows={2} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-4"><Wine size={15} className="text-[#7A9C6E]"/><h3 className="font-medium text-stone-800">Drink calculator</h3></div>
          <div className="space-y-3 mb-5">
            <div><label className="text-xs text-stone-500 mb-1 block">Guests: <strong>{guests}</strong></label><input type="range" min={20} max={500} step={5} value={guests} onChange={e=>setGuests(+e.target.value)} className="w-full"/></div>
            <div><label className="text-xs text-stone-500 mb-1 block">Open bar hours: <strong>{hours}h</strong></label><input type="range" min={1} max={8} step={0.5} value={hours} onChange={e=>setHours(+e.target.value)} className="w-full"/></div>
          </div>
          {[['Wine',drinks.wine,'bottles'],['Beer',drinks.beer,'cans'],['Champagne',drinks.champagne,'bottles'],['Water',drinks.water,'cases']].map(([l,v,u])=>(
            <div key={String(l)} className="flex justify-between py-2.5 border-b border-stone-50 last:border-0">
              <span className="text-sm text-stone-700">{l}</span>
              <div className="text-right"><span className="text-lg font-light text-[#3d6b2e]" style={{fontFamily:'var(--font-display)'}}>{v}</span><span className="text-xs text-stone-400 ml-1">{u}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── WEDDING PARTY ──────────────────────────────────────────────────────────
function TabParty() {
  const [members, setMembers] = useState<{id:string;name:string;role:string;side:string;phone:string;email:string;attire:string;notes:string}[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({name:'',role:'Bridesmaid',side:'bride',phone:'',email:'',attire:'',notes:''})
  const BRIDE_ROLES = ['Maid of Honor','Bridesmaid','Flower Girl','Junior Bridesmaid']
  const GROOM_ROLES = ['Best Man','Groomsman','Usher','Ring Bearer']
  const add = () => {
    if (!form.name.trim()) return
    setMembers(p=>[...p,{id:Date.now().toString(),...form}])
    setForm({name:'',role:'Bridesmaid',side:'bride',phone:'',email:'',attire:'',notes:''}); setShowAdd(false)
  }
  const bride = members.filter(m=>m.side==='bride')
  const groom = members.filter(m=>m.side==='groom')
  return (
    <div>
      <PageHeader title="Wedding party" sub={`${members.length} members`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add member</Btn>} />
      <div className="grid grid-cols-2 gap-6">
        {[{label:"Bride's side",side:'bride',list:bride,roles:BRIDE_ROLES},{label:"Groom's side",side:'groom',list:groom,roles:GROOM_ROLES}].map(({label,list,side,roles})=>(
          <div key={label}>
            <h2 className="text-lg font-light text-stone-600 mb-3" style={{fontFamily:'var(--font-display)'}}>{label}</h2>
            <div className="space-y-2">
              {list.length===0?<div className="border-2 border-dashed border-stone-200 rounded-2xl py-10 text-center text-stone-400 text-sm">No members yet</div>
                :list.map(m=>(
                  <div key={m.id} className="bg-white rounded-2xl border border-stone-200 p-4 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EDF4EA] flex items-center justify-center text-sm font-semibold text-[#3d6b2e]">{m.name.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}</div>
                        <div><p className="font-medium text-stone-800">{m.name}</p><p className="text-xs text-[#7A9C6E]">{m.role}</p></div>
                      </div>
                      <button onClick={()=>setMembers(p=>p.filter(x=>x.id!==m.id))} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {m.phone&&<a href={`tel:${m.phone}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><Phone size={11}/>{m.phone}</a>}
                      {m.email&&<a href={`mailto:${m.email}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><Mail size={11}/>{m.email}</a>}
                    </div>
                    {m.attire&&<p className="text-xs text-stone-400 mt-1.5">Attire: {m.attire}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      {showAdd&&(
        <Modal title="Add party member" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.name.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Name *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Side"><Select value={form.side} onChange={e=>setForm(f=>({...f,side:e.target.value,role:e.target.value==='bride'?'Bridesmaid':'Groomsman'}))}><option value="bride">Bride&apos;s side</option><option value="groom">Groom&apos;s side</option></Select></Field>
            <Field label="Role"><Select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{(form.side==='bride'?BRIDE_ROLES:GROOM_ROLES).map(r=><option key={r}>{r}</option>)}</Select></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></Field>
            <Field label="Email"><Input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></Field>
          </div>
          <Field label="Attire"><Input value={form.attire} onChange={e=>setForm(f=>({...f,attire:e.target.value}))} placeholder="e.g. Sage green, floor length" /></Field>
        </Modal>
      )}
    </div>
  )
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────
function TabTimeline() {
  const [items, setItems] = useState([
    {id:'1',time:'3:30 PM',title:'Guests arrive',who:'Ushers',desc:''},
    {id:'2',time:'4:00 PM',title:'Ceremony begins',who:'Everyone',desc:'Processional starts'},
    {id:'3',time:'4:45 PM',title:'Cocktail hour',who:'Guests',desc:'Couple does portraits'},
    {id:'4',time:'6:00 PM',title:'Reception opens',who:'Everyone',desc:''},
    {id:'5',time:'6:30 PM',title:'First dances & toasts',who:'Couple, Best man, MOH',desc:''},
    {id:'6',time:'7:00 PM',title:'Dinner service',who:'Catering',desc:''},
    {id:'7',time:'9:00 PM',title:'Cake cutting',who:'Couple',desc:''},
    {id:'8',time:'11:30 PM',title:'Last dance & send-off',who:'Everyone',desc:'Sparkler exit'},
  ])
  const [editing, setEditing] = useState<string|null>(null)
  const update = (id:string,field:string,val:string) => setItems(p=>p.map(i=>i.id===id?{...i,[field]:val}:i))
  const add = () => { const id=Date.now().toString(); setItems(p=>[...p,{id,time:'',title:'New event',who:'',desc:''}]); setEditing(id) }
  return (
    <div>
      <PageHeader title="Day-of timeline" action={<div className="flex gap-2"><Btn variant="ghost" onClick={()=>window.print()}>Print</Btn><Btn onClick={add}><Plus size={14}/>Add event</Btn></div>} />
      <div className="relative">
        <div className="absolute left-[72px] top-0 bottom-0 w-px bg-stone-200"/>
        <div className="space-y-2">
          {items.map(item=>(
            <div key={item.id} className="flex gap-4 group items-start">
              <div className="w-16 text-right shrink-0 pt-3">
                {editing===item.id
                  ?<input value={item.time} onChange={e=>update(item.id,'time',e.target.value)} className="w-full text-right text-xs font-medium border border-stone-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-[#7A9C6E]" placeholder="4:00 PM"/>
                  :<span className="text-xs font-semibold text-stone-500">{item.time||'—'}</span>}
              </div>
              <div className="w-3 h-3 rounded-full bg-[#7A9C6E] border-2 border-white shadow shrink-0 mt-3.5 relative z-10"/>
              <div className={`flex-1 bg-white rounded-xl border p-3.5 cursor-pointer transition-colors ${editing===item.id?'border-[#7A9C6E]':'border-stone-200 hover:border-stone-300'}`} onClick={()=>setEditing(editing===item.id?null:item.id)}>
                {editing===item.id?(
                  <div className="space-y-2" onClick={e=>e.stopPropagation()}>
                    <input value={item.title} onChange={e=>update(item.id,'title',e.target.value)} className="w-full font-medium text-sm border-0 focus:outline-none bg-transparent"/>
                    <input value={item.desc} onChange={e=>update(item.id,'desc',e.target.value)} className="w-full text-xs text-stone-400 border-0 focus:outline-none bg-transparent" placeholder="Description"/>
                    <input value={item.who} onChange={e=>update(item.id,'who',e.target.value)} className="w-full text-xs text-[#7A9C6E] border-0 focus:outline-none bg-transparent" placeholder="Who's involved"/>
                    <div className="flex gap-2 pt-1">
                      <button onClick={()=>setEditing(null)} className="text-xs px-3 py-1 rounded-lg bg-[#7A9C6E] text-white">Done</button>
                      <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} className="text-xs px-3 py-1 rounded-lg text-red-400 border border-red-200">Delete</button>
                    </div>
                  </div>
                ):(
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-stone-800">{item.title}</p>{item.desc&&<p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>}{item.who&&<p className="text-xs text-[#7A9C6E] mt-0.5">{item.who}</p>}</div>
                    <span className="text-xs text-stone-300 opacity-0 group-hover:opacity-100">click to edit</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DECOR ───────────────────────────────────────────────────────────────────
function TabDecor() {
  const AREAS = ['Ceremony arch','Aisle','Head table','Guest tables','Cocktail hour','Entrance','Cake table','Outdoor','Lighting','Other']
  const [items, setItems] = useState<{id:string;area:string;desc:string;vendor:string;cost:string;done:boolean}[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({area:'Guest tables',desc:'',vendor:'',cost:''})
  const add = () => { if(!form.desc.trim()) return; setItems(p=>[...p,{id:Date.now().toString(),...form,done:false}]); setForm({area:'Guest tables',desc:'',vendor:'',cost:''}); setShowAdd(false) }
  return (
    <div>
      <PageHeader title="Décor" sub={`${items.filter(i=>i.done).length}/${items.length} ordered`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add item</Btn>} />
      <div className="space-y-2">
        {items.length===0?<div className="text-center py-16 text-stone-400">Track florals, centrepieces, lighting and décor items here</div>:
          items.map(i=>(
            <div key={i.id} className={`bg-white rounded-xl border border-stone-200 p-3.5 flex items-center gap-3 group ${i.done?'opacity-60':''}`}>
              <button onClick={()=>setItems(p=>p.map(x=>x.id===i.id?{...x,done:!x.done}:x))} className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${i.done?'border-[#7A9C6E] bg-[#7A9C6E]':'border-stone-300'}`}>{i.done&&<Check size={11} className="text-white"/>}</button>
              <div className="flex-1"><p className={`text-sm font-medium ${i.done?'line-through text-stone-400':'text-stone-800'}`}>{i.desc}</p><p className="text-xs text-stone-400">{i.area}{i.vendor?` · ${i.vendor}`:''}{i.cost?` · $${i.cost}`:''}</p></div>
              <button onClick={()=>setItems(p=>p.filter(x=>x.id!==i.id))} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
            </div>
          ))}
      </div>
      {showAdd&&(
        <Modal title="Add décor item" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.desc.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Area"><Select value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))}>{AREAS.map(a=><option key={a}>{a}</option>)}</Select></Field>
          <Field label="Description *"><Input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="e.g. Eucalyptus centrepieces" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vendor"><Input value={form.vendor} onChange={e=>setForm(f=>({...f,vendor:e.target.value}))} /></Field>
            <Field label="Cost ($)"><Input value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} type="number" /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── ATTIRE ──────────────────────────────────────────────────────────────────
function TabAttire() {
  const STATUSES = ['Shopping','Ordered','In alterations','Fitting 1','Fitting 2','Ready','Picked up']
  const [items, setItems] = useState([
    {id:'1',person:'Jennifer',item:'Wedding gown',shop:'',status:'Shopping',notes:''},
    {id:'2',person:'Jennifer',item:'Veil & accessories',shop:'',status:'Shopping',notes:''},
    {id:'3',person:'Myles',item:'Suit / tuxedo',shop:'',status:'Shopping',notes:''},
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({person:'Jennifer',item:'',shop:'',notes:''})
  const add = () => { if(!form.item.trim()) return; setItems(p=>[...p,{id:Date.now().toString(),...form,status:'Shopping'}]); setForm({person:'Jennifer',item:'',shop:'',notes:''}); setShowAdd(false) }
  const upd = (id:string,f:string,v:string) => setItems(p=>p.map(i=>i.id===id?{...i,[f]:v}:i))
  return (
    <div>
      <PageHeader title="Attire" action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add item</Btn>} />
      <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead><tr className="border-b border-stone-100 bg-stone-50 text-left text-xs text-stone-400 uppercase tracking-wider">{['Person','Item','Shop','Status','Notes',''].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {items.map(i=>(
              <tr key={i.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 group">
                <td className="px-4 py-2.5 text-xs font-medium text-stone-600">{i.person}</td>
                <td className="px-4 py-2.5 font-medium text-stone-800">{i.item}</td>
                <td className="px-4 py-2.5"><input value={i.shop} onChange={e=>upd(i.id,'shop',e.target.value)} className="w-full bg-transparent border-0 focus:outline-none text-sm text-stone-600" placeholder="Add shop…"/></td>
                <td className="px-4 py-2.5"><select value={i.status} onChange={e=>upd(i.id,'status',e.target.value)} className={`text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none ${i.status==='Ready'||i.status==='Picked up'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-600'}`}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
                <td className="px-4 py-2.5"><input value={i.notes} onChange={e=>upd(i.id,'notes',e.target.value)} className="w-full bg-transparent border-0 focus:outline-none text-xs text-stone-400" placeholder="Notes…"/></td>
                <td className="px-4 py-2.5"><button onClick={()=>setItems(p=>p.filter(x=>x.id!==i.id))} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd&&(
        <Modal title="Add attire item" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.item.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Person"><Select value={form.person} onChange={e=>setForm(f=>({...f,person:e.target.value}))}>{['Jennifer','Myles','Maid of Honor','Bridesmaid','Best Man','Groomsman','Flower Girl'].map(p=><option key={p}>{p}</option>)}</Select></Field>
          <Field label="Item *"><Input value={form.item} onChange={e=>setForm(f=>({...f,item:e.target.value}))} placeholder="Wedding gown, Suit…" autoFocus /></Field>
          <Field label="Shop / Designer"><Input value={form.shop} onChange={e=>setForm(f=>({...f,shop:e.target.value}))} /></Field>
          <Field label="Notes"><Input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></Field>
        </Modal>
      )}
    </div>
  )
}

// ─── PHOTOSHOOT ───────────────────────────────────────────────────────────────
function TabPhotoshoot() {
  const GROUPS = ['Couples','Ceremony','Family — Jennifer','Family — Myles','Wedding party','Details','Getting ready','Reception']
  const [shots, setShots] = useState([
    {id:'1',group:'Couples',desc:'First look reveal',mustHave:true,done:false},
    {id:'2',group:'Ceremony',desc:'Bride walking down the aisle',mustHave:true,done:false},
    {id:'3',group:'Ceremony',desc:'First kiss',mustHave:true,done:false},
    {id:'4',group:'Family — Jennifer',desc:'Jennifer with both parents',mustHave:true,done:false},
    {id:'5',group:'Family — Myles',desc:'Myles with both parents',mustHave:true,done:false},
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({group:'Couples',desc:'',mustHave:false})
  const add = () => { if(!form.desc.trim()) return; setShots(p=>[...p,{id:Date.now().toString(),...form,done:false}]); setForm({group:'Couples',desc:'',mustHave:false}); setShowAdd(false) }
  const grouped = GROUPS.map(g=>({g,shots:shots.filter(s=>s.group===g)})).filter(x=>x.shots.length>0)
  return (
    <div>
      <PageHeader title="Photoshoot" sub={`${shots.filter(s=>s.done).length}/${shots.length} shots done`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add shot</Btn>} />
      <div className="space-y-4">
        {grouped.map(({g,shots:gs})=>(
          <div key={g} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex justify-between px-5 py-3 border-b border-stone-100 bg-stone-50"><p className="text-sm font-medium text-stone-700">{g}</p><span className="text-xs text-stone-400">{gs.filter(s=>s.done).length}/{gs.length}</span></div>
            <div className="p-2">
              {gs.map(s=>(
                <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-stone-50 ${s.done?'opacity-60':''}`}>
                  <button onClick={()=>setShots(p=>p.map(x=>x.id===s.id?{...x,done:!x.done}:x))} className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${s.done?'border-[#7A9C6E] bg-[#7A9C6E]':'border-stone-300'}`}>{s.done&&<Check size={11} className="text-white"/>}</button>
                  <span className={`text-sm flex-1 ${s.done?'line-through text-stone-400':'text-stone-700'}`}>{s.desc}</span>
                  {s.mustHave&&<span className="text-xs px-2 py-0.5 bg-[#EDF4EA] text-[#3d6b2e] rounded-full">Must have</span>}
                  <button onClick={()=>setShots(p=>p.filter(x=>x.id!==s.id))} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showAdd&&(
        <Modal title="Add shot" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.desc.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Group"><Select value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))}>{GROUPS.map(g=><option key={g}>{g}</option>)}</Select></Field>
          <Field label="Description *"><Input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Describe the shot" autoFocus /></Field>
          <div className="flex items-center justify-between py-1">
            <p className="text-sm text-stone-700">Must-have</p>
            <button onClick={()=>setForm(f=>({...f,mustHave:!f.mustHave}))} className={`w-11 h-6 rounded-full transition-colors relative ${form.mustHave?'bg-[#7A9C6E]':'bg-stone-200'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.mustHave?'translate-x-5':'translate-x-0.5'}`}/></button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── PLAYLIST ─────────────────────────────────────────────────────────────────
function TabPlaylist() {
  const SECS: Record<string,string> = {ceremony:'Ceremony',cocktail:'Cocktail hour',dinner:'Dinner',dancing:'Dancing',donotplay:'Do not play'}
  const COLORS: Record<string,[string,string]> = {ceremony:['#EDF4EA','#3d6b2e'],cocktail:['#E6F1FB','#185FA5'],dinner:['#FAEEDA','#854F0B'],dancing:['#EEEDFE','#3C3489'],donotplay:['#FCEBEB','#A32D2D']}
  const [songs, setSongs] = useState([
    {id:'1',section:'ceremony',title:'Canon in D',artist:'Pachelbel',note:'Processional'},
    {id:'2',section:'ceremony',title:'A Thousand Years',artist:'Christina Perri',note:'Bride entrance'},
    {id:'3',section:'dancing',title:'Thinking Out Loud',artist:'Ed Sheeran',note:'First dance'},
    {id:'4',section:'donotplay',title:'YMCA',artist:'Village People',note:''},
  ])
  const [adding, setAdding] = useState<string|null>(null)
  const [form, setForm] = useState({title:'',artist:'',note:''})
  const add = (sec:string) => { if(!form.title.trim()) return; setSongs(p=>[...p,{id:Date.now().toString(),section:sec,...form}]); setForm({title:'',artist:'',note:''}); setAdding(null) }
  return (
    <div>
      <PageHeader title="Playlist" sub={`${songs.length} songs`} />
      <div className="space-y-4">
        {Object.entries(SECS).map(([sec,label])=>{
          const ss=songs.filter(s=>s.section===sec)
          const [bg,color]=COLORS[sec]||['#f5f5f4','#78716c']
          return (
            <div key={sec} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100" style={{background:bg}}>
                <div className="flex items-center gap-2"><Music size={13} style={{color}}/><h3 className="font-medium text-sm" style={{color}}>{label}</h3><span className="text-xs opacity-60" style={{color}}>({ss.length})</span></div>
                <button onClick={()=>setAdding(adding===sec?null:sec)} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background:color+'22',color}}><Plus size={12} className="inline mr-1"/>Add</button>
              </div>
              <div className="p-2">
                {adding===sec&&(
                  <div className="flex gap-2 p-2 bg-stone-50 rounded-xl mb-2">
                    <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add(sec)} className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Song title" autoFocus/>
                    <input value={form.artist} onChange={e=>setForm(f=>({...f,artist:e.target.value}))} className="w-32 px-2 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Artist"/>
                    <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} className="w-24 px-2 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Note"/>
                    <button onClick={()=>add(sec)} className="px-3 py-1.5 rounded-lg text-white text-sm font-medium" style={{background:'#7A9C6E'}}>Add</button>
                    <button onClick={()=>setAdding(null)} className="text-stone-400"><X size={15}/></button>
                  </div>
                )}
                {ss.length===0&&adding!==sec?<p className="text-xs text-stone-300 px-3 py-2">No songs yet</p>:
                  ss.map(s=>(
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-50 group">
                      <div className="flex-1"><p className="text-sm font-medium text-stone-800">{s.title}</p><p className="text-xs text-stone-400">{s.artist}{s.note?` · ${s.note}`:''}</p></div>
                      <button onClick={()=>setSongs(p=>p.filter(x=>x.id!==s.id))} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── GIFTS ────────────────────────────────────────────────────────────────────
function TabGifts() {
  const [gifts, setGifts] = useState<{id:string;fromName:string;description:string;value:number|null;thankYouSent:boolean}[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({fromName:'',description:'',value:'',receivedAt:''})
  const [saving, setSaving] = useState(false)
  useEffect(()=>{$get('gifts').then(d=>{setGifts(Array.isArray(d)?d:[]); setLoading(false)})},[])
  const add = async () => {
    if(!form.fromName.trim()) return
    setSaving(true)
    const res = await $post('gift',{...form,value:parseFloat(form.value)||null})
    setGifts(p=>[res,...p]); setForm({fromName:'',description:'',value:'',receivedAt:''}); setShowAdd(false); setSaving(false)
  }
  const toggle = async (id:string, sent:boolean) => {
    setGifts(p=>p.map(g=>g.id===id?{...g,thankYouSent:!sent}:g))
    await $patch('gift',{id,thankYouSent:!sent})
  }
  const total = gifts.reduce((s,g)=>s+(g.value||0),0)
  const pending = gifts.filter(g=>!g.thankYouSent).length
  return (
    <div>
      <PageHeader title="Gifts & thank yous" sub={`${gifts.length} gifts · ${pending} thank you${pending!==1?'s':''} to send`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Log gift</Btn>} />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{label:'Total gifts',val:String(gifts.length)},{label:'Thank yous pending',val:String(pending)},{label:'Est. value',val:fmt$(total)}].map(({label,val})=>(
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-light" style={{fontFamily:'var(--font-display)'}}>{val}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-8"><Loader2 className="animate-spin text-stone-300" size={22}/></div>:(
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {gifts.length===0?<div className="text-center py-14 text-stone-400">No gifts logged yet</div>:(
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 bg-stone-50 text-left text-xs text-stone-400 uppercase tracking-wider">{['From','Gift','Value','Thank you'].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>{gifts.map(g=>(
                <tr key={g.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{g.fromName}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{g.description||'—'}</td>
                  <td className="px-4 py-3">{g.value?`$${g.value.toLocaleString()}`:'—'}</td>
                  <td className="px-4 py-3"><button onClick={()=>toggle(g.id,g.thankYouSent)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${g.thankYouSent?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-600'}`}>{g.thankYouSent?<><Check size={11}/>Sent</>:'Mark sent'}</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
      {showAdd&&(
        <Modal title="Log a gift" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={saving||!form.fromName.trim()}>{saving?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><Plus size={14}/>Save</>}</Btn></>}>
          <Field label="From *"><Input value={form.fromName} onChange={e=>setForm(f=>({...f,fromName:e.target.value}))} placeholder="John & Jane Smith" autoFocus /></Field>
          <Field label="Description"><Input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="KitchenAid stand mixer" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Value ($)"><Input type="number" value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} /></Field>
            <Field label="Received date"><Input type="date" value={form.receivedAt} onChange={e=>setForm(f=>({...f,receivedAt:e.target.value}))} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}


// ─── SEATING ────────────────────────────────────────────────────────────────
function TabSeating() {
  const [tables, setTables] = useState<{ id:string; name:string; shape:string; seats:number; x:number; y:number; color:string }[]>([])
  const [guests, setGuests] = useState<{ id:string; name:string; rsvpStatus:string; tableId:string|null }[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [assignTarget, setAssignTarget] = useState<string|null>(null)
  const [form, setForm] = useState({ name:'', shape:'round', seats:8 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<string|null>(null)
  const dragOffset = useRef({ x:0, y:0 })
  const COLORS: Record<string,string> = { round:'#E1F5EE', rectangular:'#E6F1FB', oval:'#FAEEDA' }
  const BORDERS: Record<string,string> = { round:'#5DCAA5', rectangular:'#378ADD', oval:'#EF9F27' }
  const DIMS: Record<string,{ w:number;h:number;r:number }> = { round:{w:72,h:72,r:36}, rectangular:{w:100,h:55,r:8}, oval:{w:108,h:62,r:40} }

  useEffect(() => {
    Promise.all([$get('tables'),$get('guests')]).then(([t,g])=>{ setTables(Array.isArray(t)?t:[]); setGuests(Array.isArray(g)?g:[]); setLoading(false) })
  },[])

  const addTable = async () => {
    if (!form.name.trim()) return
    const res = await $post('table', { ...form, x:80+Math.random()*200, y:60+Math.random()*100, color:COLORS[form.shape] })
    setTables(p=>[...p,res]); setShowAdd(false); setForm({name:'',shape:'round',seats:8})
  }

  const onMouseDown = (e: React.MouseEvent, id: string, tx: number, ty: number) => {
    e.preventDefault()
    const r = canvasRef.current!.getBoundingClientRect()
    dragging.current = id; dragOffset.current = { x: e.clientX-r.left-tx, y: e.clientY-r.top-ty }
  }

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current || !canvasRef.current) return
      const r = canvasRef.current.getBoundingClientRect()
      const nx = Math.max(0, e.clientX-r.left-dragOffset.current.x)
      const ny = Math.max(0, e.clientY-r.top-dragOffset.current.y)
      setTables(p => p.map(t => t.id===dragging.current ? {...t,x:nx,y:ny} : t))
    }
    const up = () => {
      if (!dragging.current) return
      const t = tables.find(t=>t.id===dragging.current)
      if (t) $patch('table', { id:t.id, x:t.x, y:t.y })
      dragging.current = null
    }
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up)
    return () => { window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up) }
  },[tables])

  const assignGuest = async (guestId: string, tableId: string) => {
    await $patch('guest', { id:guestId, tableId: tableId||null })
    setGuests(p=>p.map(g=>g.id===guestId?{...g,tableId:tableId||null}:g))
    setAssignTarget(null)
  }

  const unassigned = guests.filter(g=>g.rsvpStatus==='attending'&&!g.tableId)

  return (
    <div>
      <PageHeader title="Seating chart" sub={`${guests.filter(g=>g.tableId).length} seated · ${unassigned.length} unassigned`}
        action={<Btn onClick={()=>setShowAdd(true)}><Plus size={14}/>Add table</Btn>} />
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-stone-300" size={22}/></div> : (
        <div className="flex gap-4 h-[520px]">
          <div className="w-56 shrink-0 flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Tables</p>
              {tables.map(t => {
                const cnt = guests.filter(g=>g.tableId===t.id).length
                return <div key={t.id} className="flex items-center gap-1 py-2 border-b border-stone-50 last:border-0 group rounded-lg px-1 hover:bg-stone-50">
                  <div className="flex-1 cursor-pointer" onClick={()=>setAssignTarget(t.id)}>
                    <p className="text-sm font-medium text-stone-700">{t.name}</p>
                    <p className="text-xs text-stone-400 capitalize">{t.shape} · {cnt}/{t.seats}</p>
                  </div>
                  <button onClick={async()=>{ if(!confirm(`Delete ${t.name}?`)) return; await $del('table',t.id); setTables(p=>p.filter(x=>x.id!==t.id)) }} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0"><Trash2 size={12}/></button>
                </div>
              })}
              {tables.length===0 && <p className="text-xs text-stone-400">No tables yet</p>}
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Unassigned ({unassigned.length})</p>
              {unassigned.length===0 ? <p className="text-xs text-stone-400">Everyone seated 🎉</p> :
                unassigned.map(g => <div key={g.id} className="flex items-center gap-2 py-1.5 border-b border-stone-50 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-[#EDF4EA] flex items-center justify-center text-[10px] font-semibold text-[#3d6b2e] shrink-0">{g.name[0]}</div>
                  <span className="text-xs text-stone-600 truncate">{g.name}</span>
                </div>)}
            </div>
          </div>
          <div ref={canvasRef} className="flex-1 bg-white rounded-2xl border border-stone-200 relative overflow-hidden select-none">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage:'radial-gradient(circle,#d1c9bd 1px,transparent 1px)', backgroundSize:'24px 24px' }}/>
            {tables.length===0 && <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">Add tables to build your floor plan</div>}
            {tables.map(t => {
              const d = DIMS[t.shape]||DIMS.round
              return <div key={t.id} style={{ position:'absolute', left:t.x, top:t.y, width:d.w, height:d.h, background:t.color, borderRadius:d.r, border:`2px solid ${BORDERS[t.shape]||'#888'}`, cursor:'grab', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', userSelect:'none' }}
                onMouseDown={e=>onMouseDown(e,t.id,t.x,t.y)} onClick={()=>setAssignTarget(t.id)}>
                <p style={{fontSize:10,fontWeight:600,color:'#444',textAlign:'center',padding:'0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:d.w-8}}>{t.name}</p>
                <p style={{fontSize:9,color:'#888'}}>{guests.filter(g=>g.tableId===t.id).length}/{t.seats}</p>
              </div>
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add table" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={addTable} disabled={!form.name.trim()}><Plus size={14}/>Add</Btn></>}>
          <Field label="Table name"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Table 1, Head Table…" autoFocus /></Field>
          <Field label="Shape">
            <div className="grid grid-cols-3 gap-2">
              {['round','rectangular','oval'].map(s=><button key={s} onClick={()=>setForm(f=>({...f,shape:s}))} className={`py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${form.shape===s?'border-[#7A9C6E] bg-[#EDF4EA] text-[#3d6b2e]':'border-stone-200 text-stone-500'}`}>{s}</button>)}
            </div>
          </Field>
          <Field label={`Seats: ${form.seats}`}><input type="range" min={2} max={20} value={form.seats} onChange={e=>setForm(f=>({...f,seats:+e.target.value}))} className="w-full"/></Field>
        </Modal>
      )}

      {assignTarget && (
        <Modal title={tables.find(t=>t.id===assignTarget)?.name||'Table'} onClose={()=>setAssignTarget(null)}>
          <div className="space-y-1">
            {guests.filter(g=>g.tableId===assignTarget).map(g=>(
              <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-stone-50">
                <span className="text-sm text-stone-700">{g.name}</span>
                <button onClick={()=>assignGuest(g.id,'')} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            ))}
            {unassigned.length > 0 && <>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider pt-2 pb-1">Add guest</p>
              {unassigned.map(g=>(
                <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#EDF4EA] cursor-pointer" onClick={()=>assignGuest(g.id,assignTarget)}>
                  <span className="text-sm text-stone-700">{g.name}</span>
                  <Plus size={13} className="text-[#7A9C6E]"/>
                </div>
              ))}
            </>}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── MAIN WRAPPER ────────────────────────────────────────────────────────────
const TAB_COMPONENTS: Record<string, React.ComponentType<{ onTab?: (t: string) => void }>> = {
  home:      TabHome,
  guests:    TabGuests,
  venues:    TabVenues,
  budget:    TabBudget,
  vendors:   TabVendors,
  tasks:     TabTasks,
  checklist: TabChecklist,
  rsvp:      TabRSVP,
  seating:   TabSeating,
  moodboard: TabMoodboard,
  menu:      TabMenu,
  party:      TabParty,
  timeline:   TabTimeline,
  decor:      TabDecor,
  attire:     TabAttire,
  photoshoot: TabPhotoshoot,
  playlist:   TabPlaylist,
  gifts:      TabGifts,
}

export default function DashboardPage() {
  const [tab, setTab] = useState('home')
  const TabComponent = TAB_COMPONENTS[tab] || TabHome

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar activeTab={tab} onTab={setTab} />
      <main className="flex-1 overflow-y-auto p-8">
        <TabComponent onTab={setTab} />
      </main>
    </div>
  )
}
