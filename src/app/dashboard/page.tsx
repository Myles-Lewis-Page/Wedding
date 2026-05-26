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
interface Guest { id: string; name: string; email: string | null; side: string; hasPlusOne: boolean; plusOneName: string | null; dietary: string | null; rsvpStatus: string; tableId: string | null }

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
                          <div><p className="font-medium text-stone-800">{g.name}</p>{g.email && <p className="text-xs text-stone-400">{g.email}</p>}</div>
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

  const selectVenue = async (v: Venue) => {
    const res = await $post('venue-select', { id: v.id })
    setVenues(p => p.map(x => ({ ...x, isSelected: x.id === res.id }))); setDetail(res)
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
                {detail.isSelected
                  ? <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#3d6b2e] bg-[#EDF4EA]"><Check size={13}/>Our venue</div>
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
  const rsvpUrl = typeof window !== 'undefined' ? `${window.location.origin}/rsvp` : '/rsvp'
  return (
    <div>
      <PageHeader title="RSVP portal" sub="Share this link or QR on your invitations" />
      <div className="max-w-sm">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
          <div className="w-32 h-32 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4"><QrCode size={48} className="text-stone-300"/></div>
          <p className="text-xs text-stone-400 mb-4 break-all">{rsvpUrl}</p>
          <div className="flex gap-2 justify-center">
            <Btn variant="ghost" onClick={() => navigator.clipboard.writeText(rsvpUrl)}>Copy link</Btn>
            <Btn onClick={() => window.open(rsvpUrl,'_blank')}><ExternalLink size={13}/>Preview</Btn>
          </div>
        </div>
        <div className="mt-4 bg-stone-50 rounded-2xl p-4 text-sm text-stone-500 space-y-2">
          <p className="font-medium text-stone-700">Guest flow:</p>
          {['Scan QR on invite','Enter name — matched against your list','Confirm plus one & dietary needs','Enter email — gets confirmation','Auto-added to unassigned seating'].map((s,i)=><p key={i} className="text-xs"><span className="font-semibold text-[#7A9C6E] mr-2">{i+1}.</span>{s}</p>)}
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

// Simple placeholder tabs for remaining sections
function SimplePlaceholder({ title, icon: Icon, desc }: { title: string; icon: React.ElementType; desc: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <Icon size={36} className="text-stone-200 mx-auto mb-4" />
        <p className="text-stone-400">{desc}</p>
      </div>
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
                return <div key={t.id} className="py-2 border-b border-stone-50 last:border-0 cursor-pointer hover:bg-stone-50 rounded-lg px-1" onClick={()=>setAssignTarget(t.id)}>
                  <p className="text-sm font-medium text-stone-700">{t.name}</p>
                  <p className="text-xs text-stone-400 capitalize">{t.shape} · {cnt}/{t.seats}</p>
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
  party:     () => <SimplePlaceholder title="Wedding party" icon={Star} desc="Add bridesmaid, groomsmen, and other wedding party members with their roles, attire, and contact info." />,
  timeline:  () => <SimplePlaceholder title="Timeline" icon={Clock} desc="Build your hour-by-hour day-of schedule to share with vendors and your wedding party." />,
  decor:     () => <SimplePlaceholder title="Décor" icon={Flower2} desc="Track florals, centerpieces, lighting, and all décor items by area of the venue." />,
  attire:    () => <SimplePlaceholder title="Attire" icon={Shirt} desc="Track dress fittings, alterations, groomswear orders, and pickup dates." />,
  photoshoot:() => <SimplePlaceholder title="Photoshoot" icon={Camera} desc="Build your must-have shot list by group — ceremony, family, couples, reception." />,
  playlist:  () => <SimplePlaceholder title="Playlist" icon={Music} desc="Organize songs for ceremony, cocktail hour, dinner, dancing, and your do-not-play list." />,
  gifts:     () => <SimplePlaceholder title="Gifts & thank yous" icon={Gift} desc="Log gifts as they arrive and track which thank-you notes have been sent." />,
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
