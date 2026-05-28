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
  <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'rgba(0,0,0,0.75)' }}>
    <div style={{ background:'#1a2419', borderRadius:20, width:'100%', maxWidth:580, boxShadow:'0 30px 80px rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', maxHeight:'88vh', border:'1px solid #2a3829' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 30px', borderBottom:'1px solid #202e1f', flexShrink:0 }}>
        <h2 style={{ fontSize:20, fontWeight:600, color:'#e8f0e6', fontFamily:'var(--font-display)' }}>{title}</h2>
        <button onClick={onClose} style={{ color:'#5a7057', background:'none', border:'none', cursor:'pointer', lineHeight:0 }}><X size={20} /></button>
      </div>
      <div style={{ overflowY:'auto', padding:'24px 30px', flex:1, display:'flex', flexDirection:'column', gap:16 }}>{children}</div>
      {footer && <div style={{ padding:'18px 30px', borderTop:'1px solid #202e1f', background:'#141c13', borderRadius:'0 0 20px 20px', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>{footer}</div>}
    </div>
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <label style={{ fontSize:12, fontWeight:700, color:'#5a7857', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</label>
    {children}
  </div>
)

const inputStyle: React.CSSProperties = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid #2a3829', fontSize:15, outline:'none', background:'#141c13', color:'#e8f0e6' }

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} style={{ ...inputStyle, ...(props.style||{}) }} onFocus={e=>{e.target.style.borderColor='#8fb882'; e.target.style.boxShadow='0 0 0 3px #8fb88220'}} onBlur={e=>{e.target.style.borderColor='#2a3829'; e.target.style.boxShadow='none'}} />
)

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} style={{ ...inputStyle, cursor:'pointer', ...(props.style||{}) }} />
)

const Btn = ({ children, variant = 'primary', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) => {
  const base: React.CSSProperties = { display:'flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', transition:'all 0.15s', border:'none', whiteSpace:'nowrap', opacity: p.disabled ? 0.4 : 1 }
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background:'var(--accent)', color:'#e8f0e6', ...p.style },
    ghost:   { ...base, background:'transparent', color:'var(--sage)', border:'1px solid #2a3829', ...p.style },
    danger:  { ...base, background:'transparent', color:'#f87171', ...p.style },
  }
  return <button {...p} style={styles[variant]}>{children}</button>
}

const Tag = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span style={{ fontSize:13, padding:'4px 12px', borderRadius:20, fontWeight:600, background: color + '25', color, display:'inline-block' }}>{children}</span>
)

const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) => (
  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32 }}>
    <div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px, 4vw, 36px)', fontWeight:300, color:'#e8f0e6', marginBottom:4 }}>{title}</h1>
      {sub && <p style={{ fontSize:15, color:'#4a6448' }}>{sub}</p>}
    </div>
    {action}
  </div>
)

// ─── DASHBOARD HOME ────────────────────────────────────────────────────────
function TabHome({ onTab }: { onTab?: (t: string) => void }) {
  const [stats, setStats] = useState({ total: 0, attending: 0, declined: 0, pending: 0 })
  const [venue, setVenue] = useState<{ name: string; address: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [accentColor, setAccentColor] = useState('#4a7a44')
  const [secondaryColor, setSecondaryColor] = useState('#8fb882')
  const [bgColor, setBgColor] = useState('#111714')
  const [tertiaryColor, setTertiaryColor] = useState('#1a2419')
  const [colorSaved, setColorSaved] = useState(false)

  useEffect(() => {
    // Apply colors from localStorage immediately (no flash)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('weddingColors') : null
    if (saved) {
      try {
        const c = JSON.parse(saved)
        if (c.accent) { setAccentColor(c.accent); document.documentElement.style.setProperty('--accent', c.accent) }
        if (c.sage) { setSecondaryColor(c.sage); document.documentElement.style.setProperty('--sage', c.sage) }
        if (c.bg) { setBgColor(c.bg); document.documentElement.style.setProperty('--bg', c.bg); document.documentElement.style.setProperty('--bg2', c.bg); }
        if (c.tertiary) { setTertiaryColor(c.tertiary); document.documentElement.style.setProperty('--bg3', c.tertiary); }
      } catch {}
    }
    Promise.all([$get('guest-stats'), $get('venues'), $get('rsvp-settings')]).then(([s, vs, rs]) => {
      setStats(s)
      setVenue(Array.isArray(vs) ? (vs.find((v: {isSelected:boolean;name:string;address:string}) => v.isSelected) ?? null) : null)
      // DB is source of truth — overwrite localStorage if DB has colors
      if (rs && !rs.error) {
        const accent = rs.accentColor || '#4a7a44'
        const sage = rs.secondaryColor || '#8fb882'
        setAccentColor(accent)
        setSecondaryColor(sage)
        document.documentElement.style.setProperty('--accent', accent)
        document.documentElement.style.setProperty('--sage', sage)
        const bg = rs.bgColor || '#111714'
        const tertiary = rs.tertiaryColor || '#1a2419'
        setBgColor(bg)
        setTertiaryColor(tertiary)
        document.documentElement.style.setProperty('--bg', bg)
        document.documentElement.style.setProperty('--bg2', bg)
        document.documentElement.style.setProperty('--bg3', tertiary)
        localStorage.setItem('weddingColors', JSON.stringify({ accent, sage, bg, tertiary }))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const saveColors = async () => {
    // Save to localStorage for instant cross-page apply
    localStorage.setItem('weddingColors', JSON.stringify({ accent: accentColor, sage: secondaryColor, bg: bgColor, tertiary: tertiaryColor }))
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--sage', secondaryColor)
    document.documentElement.style.setProperty('--bg', bgColor)
    document.documentElement.style.setProperty('--bg2', bgColor)
    document.documentElement.style.setProperty('--bg3', tertiaryColor)
    await $patch('rsvp-settings', { id: 'main', accentColor, secondaryColor, bgColor, tertiaryColor })
    setColorSaved(true)
    setTimeout(() => setColorSaved(false), 2000)
  }

  const rate = stats.total ? Math.round(((stats.attending + stats.declined) / stats.total) * 100) : 0

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:80}}><Loader2 size={24} className="animate-spin" style={{color:'#3a5038'}} /></div>

  return (
    <div style={{maxWidth:800}}>
      <PageHeader title="Good morning 🌿" sub="Here's where your wedding planning stands." />

      {venue && (
        <button onClick={() => onTab?.('venues')} style={{width:'100%',marginBottom:24,background:'#1e3a1e',borderRadius:16,padding:'14px 18px',display:'flex',alignItems:'center',gap:12,border:'none',cursor:'pointer',textAlign:'left',transition:'background 0.2s'}}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#243d24'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='#1e3a1e'}>
          <MapPin size={17} style={{color:'var(--sage)',flexShrink:0}} />
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:11,color:'#4a7a44',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>Selected venue</p>
            <p style={{fontSize:15,fontWeight:600,color:'#b8d4b4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{venue.name}{venue.address ? ` · ${venue.address}` : ''}</p>
          </div>
          <ChevronRight size={17} style={{color:'#4a7a44',flexShrink:0}} />
        </button>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:24}}>
        {[
          { label:'Total guests', val:stats.total, sub:'on the list', color:'var(--sage)' },
          { label:'Attending', val:stats.attending, sub:`${rate}% responded`, color:'#00ff00' },
          { label:'Pending RSVP', val:stats.pending, sub:'no reply yet', color:'#f0b429' },
          { label:'Declined', val:stats.declined, sub:'unable to come', color:'#ff0000' },
        ].map(({ label, val, sub, color }) => (
          <div key={label} style={{background:'#1a2419',borderRadius:16,padding:'22px 24px',border:'1px solid #202e1f'}}>
            <p style={{fontSize:12,color:'#3a5038',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{label}</p>
            <p style={{fontFamily:'var(--font-display)',fontSize:40,fontWeight:300,color,lineHeight:1,marginBottom:4}}>{val}</p>
            <p style={{fontSize:13,color:'#3a5038'}}>{sub}</p>
          </div>
        ))}
      </div>

      {/* RSVP progress */}
      <div style={{background:'#1a2419',borderRadius:16,padding:'22px 24px',border:'1px solid #202e1f',marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:15,marginBottom:14}}>
          <span style={{fontWeight:600,color:'#cde0ca'}}>RSVP progress</span>
          <span style={{color:'#3a5038'}}>{stats.attending + stats.declined} / {stats.total}</span>
        </div>
        <div style={{height:10,background:'#141c13',borderRadius:5,overflow:'hidden',display:'flex'}}>
          <div style={{height:'100%',background:'#00ff00',borderRadius:5,transition:'width 0.5s',width:`${stats.total?(stats.attending/stats.total)*100:0}%`}}/>
          <div style={{height:'100%',background:'#ff0000',transition:'width 0.5s',width:`${stats.total?(stats.declined/stats.total)*100:0}%`}}/>
        </div>
        <div style={{display:'flex',gap:24,marginTop:12,fontSize:13,color:'#3a5038'}}>
          <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,borderRadius:'50%',background:'#00ff00',display:'inline-block'}}/> Attending</span>
          <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,borderRadius:'50%',background:'#ff0000',display:'inline-block'}}/> Declined</span>
          <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,borderRadius:'50%',background:'#1e2e1c',display:'inline-block'}}/> Pending</span>
        </div>
      </div>

      {/* Color customization */}
      <div style={{background:'#1a2419',borderRadius:16,padding:'22px 24px',border:'1px solid #202e1f'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <div>
            <p style={{fontSize:15,fontWeight:600,color:'#cde0ca',marginBottom:3}}>Theme colors</p>
            <p style={{fontSize:13,color:'#3a5038'}}>Applied across dashboard and RSVP page</p>
          </div>
          <Btn onClick={saveColors} style={{background: colorSaved ? 'var(--accent)' : '#4a7a44'}}>
            {colorSaved ? <><Check size={17}/>Saved!</> : 'Save colors'}
          </Btn>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
          {[
            { label:'Primary / buttons', val: accentColor, set: setAccentColor, desc:'Buttons, RSVP button, selected states' },
            { label:'Secondary / highlights', val: secondaryColor, set: setSecondaryColor, desc:'Icons, tags, nav highlights' },
            { label:'Background color', val: bgColor, set: setBgColor, desc:'Main app & RSVP background' },
            { label:'Card / surface color', val: tertiaryColor, set: setTertiaryColor, desc:'Cards, RSVP card & bubbles' },
          ].map(({ label, val, set, desc }) => (
            <div key={label}>
              <p style={{fontSize:13,fontWeight:600,color:'#6a9068',marginBottom:6}}>{label}</p>
              <p style={{fontSize:12,color:'#3a5038',marginBottom:10}}>{desc}</p>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <input type="color" value={val} onChange={e => set(e.target.value)}
                  style={{width:44,height:44,borderRadius:10,border:'1px solid #2a3829',cursor:'pointer',padding:2,background:'#141c13'}} />
                <input type="text" value={val} onChange={e => set(e.target.value)}
                  style={{flex:1,padding:'10px 14px',borderRadius:10,border:'1px solid #2a3829',fontSize:14,background:'#141c13',color:'#e8f0e6',outline:'none'}} />
              </div>
              <div style={{marginTop:10,height:8,borderRadius:4,background:val}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Guest { id: string; name: string; email: string | null; side: string; hasPlusOne: boolean; plusOneName: string | null; plusOneDietary: string | null; dietary: string | null; rsvpStatus: string; tableId: string | null; isInvitee: boolean; notes: string | null }

function TabGuests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ name: '', email: '', side: 'bride', hasPlusOne: false, dietary: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { $get('guests').then(d => { setGuests(Array.isArray(d) ? d : []); setLoading(false) }) }, []) // guest list tab

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

  const STATUS: Record<string, [string, string]> = { attending: ['Attending', '#00ff00'], declined: ['Declined', '#ff0000'], pending: ['Pending', '#f0b429'] }

  const exportCSV = () => {
    const csv = [['Name','Email','Side','RSVP','Plus One','Dietary'], ...guests.map(g => [g.name, g.email||'', g.side, g.rsvpStatus, g.plusOneName||'', g.dietary||''])].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'guests.csv'; a.click()
  }

  return (
    <div>
      <PageHeader title="Guest list" sub={`${stats.all} guests · ${stats.attending} attending · ${stats.pending} pending`}
        action={<div className="flex gap-5"><Btn variant="ghost" onClick={exportCSV}>Export CSV</Btn><Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add guest</Btn></div>} />

      <div className="flex gap-5 mb-4 flex-wrap">
        {(['all','attending','declined','pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-base font-medium transition-all capitalize ${filter === f ? 'bg-[var(--accent)] text-white' : 'bg-[#1f2b1e] text-[#7a9878] hover:bg-[#243022]'}`}>
            {f === 'all' ? `All (${stats.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${stats[f]})`}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={17} className="absolute left-3 top-3 text-[#5a7057]" />
        <Input placeholder="Search guests…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#3a5038]" size={26} /></div> : (
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base min-w-[560px]">
              <thead><tr className="border-b border-[#202e1f] bg-[#141c13] text-left text-base text-[#5a7057] uppercase tracking-wider">
                {['Name','Side','RSVP','Plus one','Dietary','Table',''].map(h => <th key={h} className="px-6 py-3.5.5 font-medium">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-[#5a7057]">{guests.length === 0 ? 'No guests yet — add your first one.' : 'No matches found.'}</td></tr>
                ) : filtered.map(g => {
                  const [label, color] = STATUS[g.rsvpStatus] ?? STATUS.pending
                  return (
                    <tr key={g.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#141c13] transition-colors">
                      <td className="px-6 py-3.5.5">
                        <div className="flex items-center gap-5.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--sage-light,#1e3a1e)] flex items-center justify-center text-base font-semibold text-[var(--sage)] shrink-0">
                            {g.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-[#e8f0e6]">{g.name}</p>
                            {g.isInvitee ? <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{background:'var(--sage-light,#1e3a1e)',color:'var(--sage)'}}>Invitee</span> : <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{background:'#1e1a3a',color:'#a5b4fc'}}>+1</span>}
                          </div>
                          {g.email && <p className="text-base text-[#5a7057]">{g.email}</p>}
                          {g.notes && <p className="text-base text-[#3a5038] italic">{g.notes}</p>}
                        </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5.5 text-[#7a9878] text-base capitalize">{g.side}</td>
                      <td className="px-6 py-3.5.5"><Tag color={color}>{label}</Tag></td>
                      <td className="px-6 py-3.5.5 text-base text-[#7a9878]">{g.hasPlusOne ? (g.plusOneName || <span className="text-[var(--sage)]">✓ allowed</span>) : '—'}</td>
                      <td className="px-6 py-3.5.5 text-base text-[#7a9878]">{g.dietary || '—'}</td>
                      <td className="px-6 py-3.5.5"><Tag color={g.tableId ? '#2563eb' : '#78716c'}>{g.tableId ? 'Assigned' : 'Unassigned'}</Tag></td>
                      <td className="px-6 py-3.5.5"><button onClick={() => del(g.id)} className="text-[#3a5038] hover:text-red-400 transition-colors"><Trash2 size={17} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add guest" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving || !form.name.trim()}>{saving ? <><Loader2 size={17} className="animate-spin" />Saving…</> : <><Plus size={17} />Add guest</>}</Btn></>}>
          {err && <div className="flex items-center gap-5 bg-red-950 text-red-400 text-base rounded-3xl p-3"><AlertCircle size={17} />{err}</div>}
          <Field label="Full name *"><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Katie Marsh" autoFocus /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="katie@email.com" /></Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Side"><Select value={form.side} onChange={e => setForm(f => ({...f, side: e.target.value}))}><option value="bride">Bride&apos;s side</option><option value="groom">Groom&apos;s side</option><option value="both">Both</option></Select></Field>
            <Field label="Dietary"><Select value={form.dietary} onChange={e => setForm(f => ({...f, dietary: e.target.value}))}><option value="">None</option><option>Vegetarian</option><option>Vegan</option><option>Gluten-free</option><option>Nut allergy</option><option>Halal</option><option>Kosher</option></Select></Field>
          </div>
          <div className="flex items-center justify-between py-1 px-1">
            <div><p className="text-base font-medium text-[#cde0ca]">Plus one allowed</p><p className="text-base text-[#5a7057]">Can bring a guest</p></div>
            <button onClick={() => setForm(f => ({...f, hasPlusOne: !f.hasPlusOne}))} className={`w-11 h-6 rounded-full transition-colors relative ${form.hasPlusOne ? 'bg-[var(--accent)]' : 'bg-[#243022]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#1a2419] shadow transition-transform ${form.hasPlusOne ? 'translate-x-5' : 'translate-x-0.5'}`} />
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

  const saveDate = async () => {
    if (!weddingDate) return
    localStorage.setItem('weddingDate', weddingDate)
    // Sync to rsvp-settings so the public RSVP page shows the right date
    await $patch('rsvp-settings', { id: 'main', weddingDate })
    setDateSaved(true); setTimeout(() => setDateSaved(false), 2000)
  }

  const selected = venues.find(v => v.isSelected)
  const fmtDate = weddingDate ? new Date(weddingDate + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : null

  return (
    <div>
      <PageHeader title="Venues" sub={`${venues.length} venue${venues.length !== 1 ? 's' : ''}${selected ? ` · "${selected.name}" selected` : ''}`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add venue</Btn>} />

      {/* Date picker */}
      <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 mb-6">
        <p className="text-base font-medium text-[#cde0ca] mb-1">Wedding date</p>
        <p className="text-base text-[#5a7057] mb-3">{fmtDate || 'Pick your date — it shows across the whole app'}</p>
        <div className="flex gap-5">
          <Input type="date" value={weddingDate} onChange={e => { setWeddingDate(e.target.value); setDateSaved(false) }} className="flex-1" />
          <Btn onClick={saveDate} disabled={!weddingDate} style={{ background: dateSaved ? 'var(--sage)' : 'var(--accent)' }}>
            {dateSaved ? <><Check size={17} />Saved!</> : 'Save date'}
          </Btn>
        </div>
      </div>

      {/* Selected banner */}
      {selected && (
        <button onClick={() => setDetail(selected)} className="w-full mb-6 rounded-3xl overflow-hidden text-left hover:shadow-md transition-shadow">
          <div className="relative h-24 bg-stone-300">
            {selected.imageUrl && <img src={selected.imageUrl} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center px-5 gap-5">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0"><Check size={26} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-base text-white/70 uppercase tracking-wider">Our venue</p>
                <p className="text-white font-medium truncate">{selected.name}</p>
                {selected.address && <p className="text-white/60 text-base truncate">{selected.address}</p>}
              </div>
              <ChevronRight size={19} className="text-white/60 shrink-0" />
            </div>
          </div>
        </button>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#3a5038]" size={26} /></div>
      : venues.length === 0 ? (
        <div className="text-center py-20">
          <MapPin size={36} className="text-[#2a3828] mx-auto mb-4" />
          <p className="text-[#5a7057] mb-4">No venues yet — paste a website URL and we&apos;ll fill in the details</p>
          <Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add venue</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {venues.map(v => (
            <button key={v.id} onClick={() => setDetail(v)} className="group bg-[#1a2419] rounded-3xl border border-[#2a3829] hover:border-[var(--sage)] hover:shadow-md transition-all text-left overflow-hidden">
              <div className="relative h-44 bg-[#1f2b1e]">
                {v.imageUrl ? <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><MapPin size={30} className="text-[#3a5038]" /></div>}
                {v.isSelected && <div className="absolute top-2 left-2 bg-[var(--accent)] text-white text-base px-2.5 py-1 rounded-full flex items-center gap-1"><Check size={10} />Selected</div>}
              </div>
              <div className="p-7">
                <p className="font-semibold text-[#e8f0e6] mb-1" style={{ fontFamily: 'var(--font-display)' }}>{v.name}</p>
                {v.address && <p className="text-base text-[#5a7057] flex items-center gap-1 mb-3"><MapPin size={10} />{v.address}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[var(--sage)] bg-[var(--sage-light,#1e3a1e)] px-3 py-1 rounded-full">{fmt$(v.cost)}</span>
                  {v.capacity && <span className="text-base text-[#5a7057] flex items-center gap-1"><Users size={10} />{v.capacity}</span>}
                </div>
              </div>
            </button>
          ))}
          <button onClick={() => setShowAdd(true)} className="h-56 rounded-3xl border-2 border-dashed border-[#2a3829] hover:border-[var(--sage)] hover:bg-[var(--sage-light,#1e3a1e)]/30 flex flex-col items-center justify-center gap-5 text-[#5a7057] hover:text-[var(--sage)] transition-all">
            <Plus size={26} /><span className="text-base">Add venue</span>
          </button>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add venue" onClose={() => { setShowAdd(false); setStep('url'); setUrl('') }}
          footer={step === 'form' ? <><Btn variant="ghost" onClick={() => setStep('url')}>← Back</Btn><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={saveVenue} disabled={saving || !form.name.trim()}>{saving ? <><Loader2 size={17} className="animate-spin"/>Saving…</> : <><Plus size={17}/>Add venue</>}</Btn></> : undefined}>
          {step === 'url' ? (
            <div className="space-y-4">
              <Field label="Venue website URL">
                <Input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrape()} placeholder="https://thebarnatstonegate.com" autoFocus />
              </Field>
              <div className="bg-[#141c13] rounded-3xl p-7 text-base text-[#7a9878] space-y-1">
                <p className="font-medium text-[#cde0ca]">We&apos;ll auto-fill: name, image, address, phone</p>
                <p>You enter the rental cost yourself.</p>
              </div>
              <div className="flex gap-5">
                <Btn onClick={scrape} disabled={scraping || !url.trim()} className="flex-1 justify-center">
                  {scraping ? <><Loader2 size={17} className="animate-spin"/>Fetching…</> : <><Globe size={17}/>Fetch info</>}
                </Btn>
                <Btn variant="ghost" onClick={() => setStep('form')}>Enter manually</Btn>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {form.imageUrl && <div className="h-32 rounded-3xl overflow-hidden bg-[#1f2b1e]"><img src={form.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
              <Field label="Venue name *"><Input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="The Barn at Stonegate" autoFocus /></Field>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Rental cost ($)"><Input type="number" value={form.cost} onChange={e => setForm(f=>({...f,cost:e.target.value}))} placeholder="8500" /></Field>
                <Field label="Capacity"><Input type="number" value={form.capacity} onChange={e => setForm(f=>({...f,capacity:e.target.value}))} placeholder="200" /></Field>
              </div>
              <Field label="Address"><Input value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="123 Main St, Nashville, TN" /></Field>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Phone"><Input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></Field>
                <Field label="Email"><Input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></Field>
              </div>
              <Field label="Description"><textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-6 py-3.5.5 rounded-3xl border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)] resize-none" /></Field>
              <Field label="Image URL"><Input value={form.imageUrl} onChange={e => setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." /></Field>
              <Field label="Amenities (comma separated)"><Input value={form.amenities} onChange={e => setForm(f=>({...f,amenities:e.target.value}))} placeholder="Parking, Bridal suite, Kitchen…" /></Field>
            </div>
          )}
        </Modal>
      )}

      {/* Edit venue modal */}
      {showEdit && detail && (
        <Modal title={`Edit — ${detail.name}`} onClose={() => setShowEdit(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Btn><Btn onClick={saveEdit} disabled={!editVenue.name.trim()}><Check size={17}/>Save changes</Btn></>}>
          <Field label="Venue name *"><Input value={editVenue.name} onChange={e=>setEditVenue(f=>({...f,name:e.target.value}))} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Rental cost ($)"><Input type="number" value={editVenue.cost} onChange={e=>setEditVenue(f=>({...f,cost:e.target.value}))} /></Field>
            <Field label="Capacity"><Input type="number" value={editVenue.capacity} onChange={e=>setEditVenue(f=>({...f,capacity:e.target.value}))} /></Field>
          </div>
          <Field label="Address"><Input value={editVenue.address} onChange={e=>setEditVenue(f=>({...f,address:e.target.value}))} /></Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Phone"><Input value={editVenue.phone} onChange={e=>setEditVenue(f=>({...f,phone:e.target.value}))} /></Field>
            <Field label="Email"><Input value={editVenue.email} onChange={e=>setEditVenue(f=>({...f,email:e.target.value}))} /></Field>
          </div>
          <Field label="Description"><textarea value={editVenue.description} onChange={e=>setEditVenue(f=>({...f,description:e.target.value}))} rows={3} className="w-full px-6 py-3.5.5 rounded-3xl border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)] resize-none" /></Field>
          <Field label="Image URL"><Input value={editVenue.imageUrl} onChange={e=>setEditVenue(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." /></Field>
          <Field label="Amenities (comma separated)"><Input value={editVenue.amenities} onChange={e=>setEditVenue(f=>({...f,amenities:e.target.value}))} placeholder="Parking, Bridal suite…" /></Field>
          <Field label="Notes"><textarea value={editVenue.notes} onChange={e=>setEditVenue(f=>({...f,notes:e.target.value}))} rows={2} className="w-full px-6 py-3.5.5 rounded-3xl border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)] resize-none" /></Field>
        </Modal>
      )}

      {/* Detail slide-out */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/35" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="w-full max-w-xl bg-[#1a2419] h-full flex flex-col overflow-y-auto shadow-2xl">
            <div className="relative h-56 bg-[#243022] shrink-0">
              {detail.imageUrl && <img src={detail.imageUrl} alt={detail.name} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setDetail(null)} className="absolute top-7 right-4 w-8 h-8 rounded-full bg-[#1a2419]/90 flex items-center justify-center"><X size={26} /></button>
              {detail.isSelected && <div className="absolute top-7 left-4 bg-[var(--accent)] text-white text-base px-3 py-1 rounded-full flex items-center gap-1"><Check size={11} />Selected venue</div>}
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>{detail.name}</h2>
                {detail.address && <p className="text-white/70 text-base flex items-center gap-1.5 mt-0.5"><MapPin size={11} />{detail.address}</p>}
              </div>
            </div>
            <div className="p-7 space-y-5 flex-1">
              <div className="grid grid-cols-3 gap-5">
                <div className="bg-[var(--sage-light,#1e3a1e)] rounded-3xl p-3 text-center"><p className="text-lg font-semibold text-[var(--sage)]">{fmt$(detail.cost)}</p><p className="text-base text-[var(--sage)]">Rental</p></div>
                <div className="bg-[#141c13] rounded-3xl p-3 text-center"><p className="text-lg font-semibold text-[#cde0ca]">{detail.capacity ?? '—'}</p><p className="text-base text-[#5a7057]">Capacity</p></div>
                <a href={detail.website} target="_blank" rel="noreferrer" className="bg-[#141c13] rounded-3xl p-3 flex flex-col items-center justify-center gap-1 text-[#7a9878] hover:text-[var(--sage)] transition-colors"><ExternalLink size={26} /><span className="text-base">Website</span></a>
              </div>
              {detail.description && <div><p className="text-base font-semibold text-[#7a9878] uppercase tracking-wider mb-2">About</p><p className="text-base text-[#a8c4a4] leading-relaxed">{detail.description}</p></div>}
              {(detail.phone || detail.email) && (
                <div><p className="text-base font-semibold text-[#7a9878] uppercase tracking-wider mb-2">Contact</p>
                  {detail.phone && <a href={`tel:${detail.phone}`} className="flex items-center gap-5 text-base text-[#7a9878] hover:text-[var(--sage)] mb-1"><Phone size={19}/>{detail.phone}</a>}
                  {detail.email && <a href={`mailto:${detail.email}`} className="flex items-center gap-5 text-base text-[#7a9878] hover:text-[var(--sage)]"><Mail size={19}/>{detail.email}</a>}
                </div>
              )}
              {detail.amenities?.length > 0 && (
                <div><p className="text-base font-semibold text-[#7a9878] uppercase tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">{detail.amenities.map((a,i) => <span key={i} className="text-base bg-[#1f2b1e] text-[#a8c4a4] px-2.5 py-1 rounded-full">{a}</span>)}</div>
                </div>
              )}
            </div>
            <div className="px-7 py-5 border-t border-[#202e1f] bg-[#141c13] flex items-center justify-between shrink-0">
              <button onClick={() => delVenue(detail.id)} className="text-base text-red-400 hover:text-red-400 flex items-center gap-1.5"><Trash2 size={19}/>Remove</button>
              <div className="flex gap-5">
                {detail.website && <Btn variant="ghost" onClick={() => window.open(detail.website, '_blank')}><ExternalLink size={19}/>Visit site</Btn>}
                <Btn variant="ghost" onClick={() => {
                  setEditVenue({
                    name: detail.name, imageUrl: detail.imageUrl, cost: String(detail.cost),
                    address: detail.address, description: detail.description, capacity: detail.capacity ? String(detail.capacity) : '',
                    phone: detail.phone, email: detail.email, website: detail.website,
                    amenities: detail.amenities.join(', '), notes: detail.notes,
                  })
                  setShowEdit(true)
                }}><Edit3 size={19}/>Edit</Btn>
                {detail.isSelected
                  ? <Btn variant="ghost" onClick={() => unselectVenue(detail)}><X size={19}/>Unselect</Btn>
                  : <Btn onClick={() => selectVenue(detail)}><Star size={19}/>Select as our venue</Btn>}
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
  const COLORS = ['#8FAF7A','var(--sage)','#378ADD','#EF9F27','#D85A30','#D4537E','#7F77DD','#888780']

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
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17}/>Add category</Btn>} />

      <div className="grid grid-cols-4 gap-7 mb-6">
        {[
          { label:'Total budget', val: total, editable: true },
          { label:'Allocated', val: allocated, sub: `${total ? Math.round(allocated/total*100) : 0}%` },
          { label:'Paid', val: paid, sub: `${allocated ? Math.round(paid/allocated*100) : 0}% of allocated` },
          { label:'Remaining', val: total - allocated, color: total - allocated < 0 ? '#dc2626' : undefined },
        ].map(({ label, val, sub, editable, color }) => (
          <div key={label} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7">
            <p className="text-base text-[#5a7057] uppercase tracking-wider mb-2">{label}</p>
            {editable
              ? <div className="flex items-baseline gap-0.5"><span className="text-[#5a7057]">$</span><input type="number" value={total} onChange={e => setTotal(+e.target.value)} className="text-2xl font-light w-full focus:outline-none" style={{ fontFamily: 'var(--font-display)' }} /></div>
              : <p className="text-2xl font-light" style={{ fontFamily: 'var(--font-display)', color: color || '#1c1917' }}>{fmt$(val)}</p>}
            {sub && <p className="text-base text-[#5a7057] mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Allocation bar */}
      <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 mb-5">
        <div className="flex justify-between text-base text-[#5a7057] mb-2"><span>Allocation</span><span>{fmt$(allocated)} of {fmt$(total)}</span></div>
        <div className="h-3 bg-[#1f2b1e] rounded-full overflow-hidden flex gap-px">
          {cats.filter(c => c.budgeted > 0).map(c => <div key={c.id} className="h-full transition-all" style={{ width: `${(c.budgeted/total)*100}%`, background: c.color }} />)}
        </div>
        <div className="flex flex-wrap gap-5 mt-3">
          {cats.map(c => <span key={c.id} className="flex items-center gap-1.5 text-base text-[#7a9878]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>)}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#3a5038]" size={26}/></div> : (
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
          <table className="w-full text-base">
            <thead><tr className="border-b border-[#202e1f] bg-[#141c13] text-left text-base text-[#5a7057] uppercase tracking-wider">
              <th className="px-6 py-3.5 font-medium">Category</th>
              <th className="px-6 py-3.5.5 font-medium">Budgeted</th>
              <th className="px-6 py-3.5.5 font-medium">Paid</th>
              <th className="px-6 py-3.5.5 font-medium">Remaining</th>
              <th className="px-6 py-3.5.5 font-medium w-36">Progress</th>
              <th className="px-6 py-3.5.5 w-8" />
            </tr></thead>
            <tbody>
              {cats.map(c => {
                const rem = c.budgeted - c.paid
                const pct = c.budgeted > 0 ? Math.min(Math.round(c.paid/c.budgeted*100), 100) : 0
                return (
                  <tr key={c.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#141c13] group">
                    <td className="px-6 py-3.5.5"><div className="flex items-center gap-5.5"><div className="w-3 h-3 rounded-full" style={{ background: c.color }}/><span className="font-medium text-[#e8f0e6]">{c.name}</span></div></td>
                    <td className="px-6 py-3.5.5.5"><div className="relative"><span className="absolute left-2 top-1.5 text-[#5a7057] text-base">$</span><input type="number" defaultValue={c.budgeted} onBlur={e => update(c.id,'budgeted',+e.target.value)} className="w-28 pl-5 pr-2 py-1.5 rounded-lg border border-transparent hover:border-[#2a3829] focus:border-[var(--sage)] focus:outline-none text-base bg-transparent focus:bg-[#1a2419]" /></div></td>
                    <td className="px-6 py-3.5.5.5"><div className="relative"><span className="absolute left-2 top-1.5 text-[#5a7057] text-base">$</span><input type="number" defaultValue={c.paid} onBlur={e => update(c.id,'paid',+e.target.value)} className="w-28 pl-5 pr-2 py-1.5 rounded-lg border border-transparent hover:border-[#2a3829] focus:border-[var(--sage)] focus:outline-none text-base bg-transparent focus:bg-[#1a2419]" /></div></td>
                    <td className="px-6 py-3.5.5.5 text-base font-medium" style={{ color: rem < 0 ? '#dc2626' : '#1c1917' }}>{fmt$(rem)}</td>
                    <td className="px-6 py-3.5.5.5"><div className="flex items-center gap-5"><div className="flex-1 h-1.5 bg-[#1f2b1e] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${pct}%`, background: c.color }}/></div><span className="text-base text-[#5a7057] w-8 text-right">{pct}%</span></div></td>
                    <td className="px-6 py-3.5.5.5"><button onClick={() => del(c.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={19}/></button></td>
                  </tr>
                )
              })}
              {cats.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-[#5a7057]">No categories yet</td></tr>}
            </tbody>
            <tfoot className="border-t border-[#2a3829] bg-[#141c13]">
              <tr><td className="px-6 py-3.5 text-base font-semibold">Total</td><td className="px-6 py-3.5.5 text-base font-semibold">{fmt$(allocated)}</td><td className="px-6 py-3.5.5 text-base font-semibold">{fmt$(paid)}</td><td className="px-6 py-3.5.5 text-base font-semibold" style={{ color: total-allocated < 0 ? '#dc2626' : '#3d6b2e' }}>{fmt$(total-allocated)}</td><td colSpan={2}/></tr>
            </tfoot>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Add category" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!addName.trim()}><Plus size={17}/>Add</Btn></>}>
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
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17}/>Add vendor</Btn>} />

      <div className="flex gap-5 mb-5 flex-wrap">
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-base font-medium transition-all ${filter===c?'bg-[var(--accent)] text-white':'bg-[#1f2b1e] text-[#7a9878] hover:bg-[#243022]'}`}>{c}</button>)}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#3a5038]" size={26}/></div> : (
        <div className="space-y-3">
          {filtered.length === 0 ? <div className="text-center py-16 text-[#5a7057]">No vendors yet</div> :
            filtered.map(v => {
              const [slabel, scolor] = VENDOR_STATUS[v.status] ?? VENDOR_STATUS.researching
              return (
                <div key={v.id} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 flex items-start gap-7 hover:border-stone-300 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-5 mb-0.5">
                      <p className="font-semibold text-[#e8f0e6]">{v.name}</p>
                      <span className="text-base text-[#5a7057] bg-[#1f2b1e] px-2 py-0.5 rounded-full">{v.category}</span>
                    </div>
                    {v.contactName && <p className="text-base text-[#5a7057] mb-1">{v.contactName}</p>}
                    <div className="flex flex-wrap gap-5">
                      {v.phone && <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-base text-[#5a7057] hover:text-[var(--sage)]"><Phone size={11}/>{v.phone}</a>}
                      {v.email && <a href={`mailto:${v.email}`} className="flex items-center gap-1 text-base text-[#5a7057] hover:text-[var(--sage)]"><Mail size={11}/>{v.email}</a>}
                      {v.website && <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-base text-[#5a7057] hover:text-[var(--sage)]"><ExternalLink size={11}/>Website</a>}
                    </div>
                    {v.notes && <p className="text-base text-[#5a7057] mt-1.5 italic">{v.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-5 shrink-0">
                    <p className="text-base font-semibold text-[#cde0ca]">{fmt$(v.cost)}</p>
                    <select value={v.status} onChange={e => updateStatus(v.id,e.target.value)} className="text-base px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none" style={{ background: scolor+'20', color: scolor }}>
                      {Object.entries(VENDOR_STATUS).map(([k,[l]]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                    <button onClick={() => del(v.id)} className="text-[#3a5038] hover:text-red-400"><Trash2 size={19}/></button>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add vendor" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving||!form.name.trim()}>{saving?<><Loader2 size={17} className="animate-spin"/>Saving…</>:<><Plus size={17}/>Add vendor</>}</Btn></>}>
          <Field label="Name *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="ABC Photography" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Category"><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{VENDOR_CATS.map(c=><option key={c}>{c}</option>)}</Select></Field>
            <Field label="Contact name"><Input value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></Field>
            <Field label="Email"><Input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></Field>
            <Field label="Website"><Input value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} placeholder="https://..." /></Field>
            <Field label="Total cost ($)"><Input type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} /></Field>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className="w-full px-6 py-3.5.5 rounded-3xl border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)] resize-none" /></Field>
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
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17}/>Add task</Btn>} />

      <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 mb-5">
        <div className="flex justify-between text-base text-[#5a7057] mb-1.5"><span>Progress</span><span>{tasks.length ? Math.round(done/tasks.length*100) : 0}%</span></div>
        <div className="h-2 bg-[#1f2b1e] rounded-full overflow-hidden"><div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${tasks.length ? done/tasks.length*100 : 0}%` }}/></div>
      </div>

      <div className="flex gap-5 mb-4">
        {(['pending','all','done'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-base font-medium transition-all ${filter===f?'bg-[var(--accent)] text-white':'bg-[#1f2b1e] text-[#7a9878] hover:bg-[#243022]'}`}>{f==='pending'?`To do (${tasks.filter(t=>!t.completed).length})`:f==='done'?`Done (${done})`:`All (${tasks.length})`}</button>)}
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#3a5038]" size={26}/></div> : (
        <div className="space-y-2">
          {shown.length === 0 ? <div className="text-center py-12 text-[#5a7057]">{filter==='done'?'No completed tasks':'All caught up! 🎉'}</div> :
            shown.map(t => (
              <div key={t.id} className={`bg-[#1a2419] rounded-3xl border border-[#2a3829] p-3.5 flex items-center gap-5 group transition-colors hover:border-stone-300 ${t.completed?'opacity-60':''}`}>
                <button onClick={() => toggle(t)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.completed?'border-[var(--sage)] bg-[var(--accent)]':'border-stone-300 hover:border-[var(--sage)]'}`}>
                  {t.completed && <Check size={11} className="text-white"/>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-medium truncate ${t.completed?'line-through text-[#5a7057]':'text-[#e8f0e6]'}`}>{t.title}</p>
                  <p className="text-base text-[#5a7057]">{t.category}{t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : ''}{t.assignedTo ? ` · ${t.assignedTo}` : ''}</p>
                </div>
                <Tag color={PRIORITY_COLOR[t.priority]||'#78716c'}>{t.priority}</Tag>
                <button onClick={() => del(t.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={19}/></button>
              </div>
            ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add task" onClose={() => setShowAdd(false)} footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving||!form.title.trim()}>{saving?<><Loader2 size={17} className="animate-spin"/>Saving…</>:<><Plus size={17}/>Add</>}</Btn></>}>
          <Field label="Task *"><Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&save()} placeholder="Book venue walkthrough" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-5">
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
      <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 mb-5">
        <div className="h-2 bg-[#1f2b1e] rounded-full overflow-hidden"><div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width:`${(done.size/total)*100}%` }}/></div>
        <p className="text-base text-[#5a7057] text-right mt-1">{Math.round(done.size/total*100)}%</p>
      </div>
      <div className="space-y-4">
        {Object.entries(ITEMS).map(([section, items]) => (
          <div key={section} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
            <div className="flex justify-between px-6 py-3.5 border-b border-[#202e1f] bg-[#141c13]">
              <p className="text-base font-medium text-[#cde0ca]">{section}</p>
              <span className="text-base text-[#5a7057]">{items.filter(i=>done.has(`${section}-${i}`)).length}/{items.length}</span>
            </div>
            <div className="p-2">
              {items.map(item => { const k=`${section}-${item}`; const checked=done.has(k); return (
                <button key={item} onClick={() => toggle(k)} className={`w-full flex items-center gap-5 px-6 py-3.5.5 rounded-3xl text-left transition-colors hover:bg-[#141c13] ${checked?'opacity-60':''}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${checked?'border-[var(--sage)] bg-[var(--accent)]':'border-stone-300'}`}>{checked&&<Check size={11} className="text-white"/>}</div>
                  <span className={`text-base ${checked?'line-through text-[#5a7057]':'text-[#cde0ca]'}`}>{item}</span>
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
  const [guests, setGuests] = useState<Guest[]>([])
  const [loadingGuests, setLoadingGuests] = useState(true)
  const [editTarget, setEditTarget] = useState<Guest | null>(null)
  const [editForm, setEditForm] = useState({ rsvpStatus: 'pending', dietary: '', email: '', plusOneName: '', plusOneDietary: '', hasPlusOne: false })
  const [savingEdit, setSavingEdit] = useState(false)

  // RSVP page settings
  const [settings, setSettings] = useState({
    heading: 'Jennifer & Myles',
    subheading: 'Together with their families',
    dateText: 'September 24, 2026',
    venueText: '4:00 PM · The Glass House Garden, Austin TX',
    heroImage: '',
    accentColor: 'var(--accent)',
    searchLabel: 'Enter your name as it appears on your invitation',
    attendingLabel: "Yes, I'll be there!",
    declineLabel: 'Regretfully no',
    confirmedMessage: "We can't wait to celebrate with you!",
    declinedMessage: "Thank you for letting us know. We'll be thinking of you!",
    contactEmail: '',
    coupleNames: 'Jennifer & Myles',
    ourStory: "We didn't expect our story to begin the way it did...",
    photo1: '',
    photo2: '',
    photo3: '',
    ceremonyTime: '4:00 PM',
    receptionTime: '6:00 PM',
    dressCode: 'Garden Formal',
    dressCodeNote: 'We would love for you to celebrate with us in attire that feels elegant and true to your style.',
    swatchBridesmaids: '#9bb89a',
    swatchSuits: '#4a5568',
    swatchVenue: '#8b7355',
    swatchFlowers: '#e8b4bc',
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const STATUS_COLORS: Record<string, [string, string]> = {
    attending: ['#00ff00', '#00330022'],
    declined: ['#ff0000', '#33000022'],
    pending: ['#f0b429', '#2a200022'],
  }

  useEffect(() => {
    $get('guests').then(d => { setGuests(Array.isArray(d) ? d : []); setLoadingGuests(false) })
    $get('rsvp-settings').then(d => { if (d && !d.error) setSettings(s => ({ ...s, ...d })) })
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(RSVP_URL)}&bgcolor=ffffff&color=3d6b2e&margin=10`
    img.onload = () => { const ctx = canvas.getContext('2d'); if (ctx) { ctx.clearRect(0,0,200,200); ctx.drawImage(img,0,0,200,200) } }
  }, [])

  const openEdit = (g: Guest) => {
    setEditTarget(g)
    setEditForm({ rsvpStatus: g.rsvpStatus, dietary: g.dietary || '', email: g.email || '', plusOneName: g.plusOneName || '', plusOneDietary: g.plusOneDietary || '', hasPlusOne: g.hasPlusOne })
  }

  const saveGuestEdit = async () => {
    if (!editTarget) return
    setSavingEdit(true)
    const res = await $patch('guest', { id: editTarget.id, rsvpStatus: editForm.rsvpStatus, dietary: editForm.dietary || null, email: editForm.email || null, plusOneName: editForm.plusOneName || null, plusOneDietary: editForm.plusOneDietary || null, hasPlusOne: editForm.hasPlusOne })
    setGuests(p => p.map(g => g.id === res.id ? res : g))
    setEditTarget(null); setSavingEdit(false)
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    await $patch('rsvp-settings', { id: 'main', ...settings })
    setSavingSettings(false); setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  const SF = ({ label, field, type = 'text', rows }: { label: string; field: keyof typeof settings; type?: string; rows?: number }) => (
    <Field label={label}>
      {rows
        ? <textarea value={String(settings[field])} onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))} rows={rows} className="w-full px-6 py-3.5.5 rounded-3xl border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)] resize-none" />
        : <Input type={type} value={String(settings[field])} onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))} />}
    </Field>
  )

  return (
    <div>
      <PageHeader title="RSVP portal" sub="Customize the guest experience and manage RSVPs" />

      <div className="grid grid-cols-2 gap-7 mb-8">
        {/* QR Code */}
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 text-center">
          <canvas ref={canvasRef} width={200} height={200} className="rounded-3xl mx-auto mb-4 block" style={{imageRendering:'pixelated'}} />
          <p className="text-base text-[#5a7057] mb-4 break-all">{RSVP_URL}</p>
          <div className="flex flex-col gap-5">
            <Btn onClick={() => { const c = canvasRef.current; if(c){const a=document.createElement('a');a.download='rsvp-qr.png';a.href=c.toDataURL();a.click()} }} className="w-full justify-center"><QrCode size={17}/>Download QR</Btn>
            <Btn variant="ghost" onClick={() => { navigator.clipboard.writeText(RSVP_URL); setCopied(true); setTimeout(()=>setCopied(false),2000) }} className="w-full justify-center">
              {copied ? <><Check size={19}/>Copied!</> : 'Copy link'}
            </Btn>
            <Btn variant="ghost" onClick={() => window.open(RSVP_URL,'_blank')} className="w-full justify-center"><ExternalLink size={19}/>Preview</Btn>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7">
          <p className="text-base font-semibold text-[#cde0ca] mb-4">RSVP stats</p>
          {(() => {
            const attending = guests.filter(g=>g.rsvpStatus==='attending').length
            const declined = guests.filter(g=>g.rsvpStatus==='declined').length
            const pending = guests.filter(g=>g.rsvpStatus==='pending').length
            const total = guests.length
            return (
              <div className="space-y-3">
                {[['Attending',attending,'#00ff00'],['Declined',declined,'#ff0000'],['Pending',pending,'#f0b429']].map(([l,v,c])=>(
                  <div key={String(l)} className="flex items-center gap-5">
                    <div className="flex-1 h-2 bg-[#1f2b1e] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${total?((v as number)/total)*100:0}%`,background:String(c)}}/>
                    </div>
                    <span className="text-base text-[#7a9878] w-20 text-right">{l}: {v}</span>
                  </div>
                ))}
                <p className="text-base text-[#5a7057] pt-1">{total} total guests</p>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── RSVP PAGE CUSTOMIZATION ── */}
      <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] mb-6">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#202e1f]">
          <div>
            <p className="font-semibold text-[#e8f0e6]">Customize RSVP page</p>
            <p className="text-base text-[#5a7057] mt-0.5">Changes appear live at your RSVP link</p>
          </div>
          <Btn onClick={saveSettings} disabled={savingSettings} style={{ background: settingsSaved ? 'var(--sage)' : 'var(--accent)' }}>
            {savingSettings ? <><Loader2 size={17} className="animate-spin"/>Saving…</> : settingsSaved ? <><Check size={17}/>Saved!</> : <><Check size={17}/>Save changes</>}
          </Btn>
        </div>

        <div className="p-7" style={{maxWidth: 520}}>
          <div className="space-y-4">
            <p className="text-base font-bold text-[#5a7057] uppercase tracking-wider pb-1 border-b border-[#202e1f]">Photos</p>
            <SF label="Hero image URL" field="heroImage" />
            {settings.heroImage && <div className="h-24 rounded-3xl overflow-hidden bg-[#1f2b1e]"><img src={settings.heroImage} alt="" className="w-full h-full object-cover"/></div>}
            <SF label="Photo 1 URL (invite card + story)" field="photo1" />
            {settings.photo1 && <div className="h-20 rounded-3xl overflow-hidden bg-[#1f2b1e]"><img src={settings.photo1} alt="" className="w-full h-full object-cover"/></div>}
            <SF label="Photo 2 URL (story polaroid)" field="photo2" />
            {settings.photo2 && <div className="h-20 rounded-3xl overflow-hidden bg-[#1f2b1e]"><img src={settings.photo2} alt="" className="w-full h-full object-cover"/></div>}
            <SF label="Photo 3 URL" field="photo3" />
            {settings.photo3 && <div className="h-20 rounded-3xl overflow-hidden bg-[#1f2b1e]"><img src={settings.photo3} alt="" className="w-full h-full object-cover"/></div>}

            <p className="text-base font-bold text-[#5a7057] uppercase tracking-wider pt-2 pb-1 border-b border-[#202e1f]">Dress Code Colors</p>
            <p className="text-xs text-[#5a7057]">These 4 dots appear on the RSVP details page under dress code</p>
            {([
              { label: 'Bridesmaid dresses', field: 'swatchBridesmaids' as const },
              { label: "Men's suits", field: 'swatchSuits' as const },
              { label: 'Venue colors', field: 'swatchVenue' as const },
              { label: 'Floral colors', field: 'swatchFlowers' as const },
            ] as const).map(({ label, field }) => (
              <Field key={field} label={label}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <input type="color" value={String(settings[field])} onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))}
                    style={{ width:44, height:44, borderRadius:10, border:'1px solid #2a3829', cursor:'pointer', padding:2, background:'transparent', flexShrink:0 }} />
                  <Input value={String(settings[field])} onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))} />
                  <div style={{ width:28, height:28, borderRadius:'50%', background:String(settings[field]), flexShrink:0, boxShadow:'0 0 0 2px #2a3829' }} />
                </div>
              </Field>
            ))}
          </div>
        </div>
      </div>

      {/* ── GUEST RSVP RECORDS ── */}
      <h2 className="text-xl font-light text-[#cde0ca] mb-4" style={{ fontFamily: 'var(--font-display)' }}>Guest RSVP records</h2>
      {loadingGuests ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#3a5038]" size={26}/></div> : (
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base min-w-[520px]">
              <thead><tr className="border-b border-[#202e1f] bg-[#141c13] text-left text-base text-[#5a7057] uppercase tracking-wider">
                {['Name','Status','Email','Dietary','Plus one',''].map(h=><th key={h} className="px-6 py-3.5.5 font-medium">{h}</th>)}
              </tr></thead>
              <tbody>
                {guests.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-[#5a7057]">No guests yet</td></tr>
                : guests.map(g => {
                  const [color, bg] = STATUS_COLORS[g.rsvpStatus] ?? STATUS_COLORS.pending
                  return (
                    <tr key={g.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#141c13]">
                      <td className="px-6 py-3.5.5 font-medium text-[#e8f0e6]">{g.name}</td>
                      <td className="px-6 py-3.5.5"><span className="text-base px-2.5 py-1 rounded-full font-medium capitalize" style={{color,background:bg}}>{g.rsvpStatus}</span></td>
                      <td className="px-6 py-3.5.5 text-base text-[#7a9878]">{g.email||'—'}</td>
                      <td className="px-6 py-3.5.5 text-base text-[#7a9878]">{g.dietary||'—'}</td>
                      <td className="px-6 py-3.5.5 text-base text-[#7a9878]">{g.plusOneName||(g.hasPlusOne?<span className="text-[var(--sage)]">allowed</span>:'—')}</td>
                      <td className="px-6 py-3.5.5"><button onClick={()=>openEdit(g)} className="text-base text-[#5a7057] hover:text-[var(--sage)] flex items-center gap-1"><Edit3 size={26}/>Edit</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editTarget && (
        <Modal title={`Edit RSVP — ${editTarget.name}`} onClose={()=>setEditTarget(null)}
          footer={<><Btn variant="ghost" onClick={()=>setEditTarget(null)}>Cancel</Btn><Btn onClick={saveGuestEdit} disabled={savingEdit}>{savingEdit?<><Loader2 size={17} className="animate-spin"/>Saving…</>:<><Check size={17}/>Save</>}</Btn></>}>
          <Field label="RSVP status"><Select value={editForm.rsvpStatus} onChange={e=>setEditForm(f=>({...f,rsvpStatus:e.target.value}))}><option value="pending">Pending</option><option value="attending">Attending</option><option value="declined">Declined</option></Select></Field>
          <Field label="Email"><Input type="email" value={editForm.email} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))} /></Field>
          <Field label="Dietary"><Select value={editForm.dietary} onChange={e=>setEditForm(f=>({...f,dietary:e.target.value}))}>
            {['','Vegetarian','Vegan','Gluten-free','Nut allergy','Halal','Kosher','Other'].map(o=><option key={o} value={o}>{o||'None'}</option>)}
          </Select></Field>
          <div className="flex items-center justify-between py-1">
            <p className="text-base font-medium text-[#cde0ca]">Plus one allowed</p>
            <button onClick={()=>setEditForm(f=>({...f,hasPlusOne:!f.hasPlusOne}))} className={`w-11 h-6 rounded-full transition-colors relative ${editForm.hasPlusOne?'bg-[var(--accent)]':'bg-[#243022]'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#1a2419] shadow transition-transform ${editForm.hasPlusOne?'translate-x-5':'translate-x-0.5'}`}/></button>
          </div>
          {editForm.hasPlusOne && <>
            <Field label="Plus one name"><Input value={editForm.plusOneName} onChange={e=>setEditForm(f=>({...f,plusOneName:e.target.value}))} /></Field>
            <Field label="Plus one dietary"><Select value={editForm.plusOneDietary} onChange={e=>setEditForm(f=>({...f,plusOneDietary:e.target.value}))}>
              {['','Vegetarian','Vegan','Gluten-free','Nut allergy','Halal','Kosher','Other'].map(o=><option key={o} value={o}>{o||'None'}</option>)}
            </Select></Field>
          </>}
        </Modal>
      )}
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
      <PageHeader title="Mood board" sub="Pin anything that inspires your vision" action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add image</Btn>} />
      {items.length === 0
        ? <div className="text-center py-20 text-[#5a7057]"><p className="mb-4">Paste image URLs from Pinterest, Instagram, or anywhere</p><Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add first image</Btn></div>
        : <div className="columns-2 md:columns-3 gap-7 space-y-4">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid group relative rounded-3xl overflow-hidden border border-[#2a3829]">
                <img src={item.imageUrl} alt={item.label} className="w-full object-cover" onError={e=>e.currentTarget.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23f1efe8" width="300" height="200"/><text x="150" y="105" text-anchor="middle" fill="%23aaa" font-size="14">Image not found</text></svg>'} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-base">{item.label || item.category}</span>
                  <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} className="ml-auto w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-red-9500 transition-colors"><X size={11}/></button>
                </div>
              </div>
            ))}
          </div>}
      {showAdd && (
        <Modal title="Add to mood board" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.imageUrl.trim()}><Plus size={17}/>Add</Btn></>}>
          <Field label="Image URL *"><Input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..." autoFocus /></Field>
          <Field label="Category"><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</Select></Field>
          <Field label="Label"><Input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="Inspiration for florals" /></Field>
          {form.imageUrl && <div className="h-32 rounded-3xl overflow-hidden bg-[#1f2b1e]"><img src={form.imageUrl} alt="" className="w-full h-full object-cover"/></div>}
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
      <div className="grid grid-cols-2 gap-7">
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7">
          <div className="flex items-center gap-5 mb-4"><UtensilsCrossed size={26} className="text-[var(--sage)]"/><h3 className="font-medium text-[#e8f0e6]">Menu</h3></div>
          {menu.map((c,i) => (
            <div key={i} className="border-b border-[#1a2419] pb-3 mb-3 last:border-0 last:mb-0">
              <p className="text-base font-semibold text-[#5a7057] uppercase tracking-wider mb-1">{c.course}</p>
              <textarea value={c.items} onChange={e=>setMenu(p=>p.map((m,j)=>j===i?{...m,items:e.target.value}:m))} className="w-full text-base text-[#cde0ca] resize-none border-0 focus:outline-none bg-transparent" rows={2} />
            </div>
          ))}
        </div>
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7">
          <div className="flex items-center gap-5 mb-4"><Wine size={26} className="text-[var(--sage)]"/><h3 className="font-medium text-[#e8f0e6]">Drink calculator</h3></div>
          <div className="space-y-3 mb-5">
            <div><label className="text-base text-[#7a9878] mb-1 block">Guests: <strong>{guests}</strong></label><input type="range" min={20} max={500} step={5} value={guests} onChange={e=>setGuests(+e.target.value)} className="w-full"/></div>
            <div><label className="text-base text-[#7a9878] mb-1 block">Open bar hours: <strong>{hours}h</strong></label><input type="range" min={1} max={8} step={0.5} value={hours} onChange={e=>setHours(+e.target.value)} className="w-full"/></div>
          </div>
          {[['Wine',drinks.wine,'bottles'],['Beer',drinks.beer,'cans'],['Champagne',drinks.champagne,'bottles'],['Water',drinks.water,'cases']].map(([l,v,u])=>(
            <div key={String(l)} className="flex justify-between py-2.5 border-b border-[#1a2419] last:border-0">
              <span className="text-base text-[#cde0ca]">{l}</span>
              <div className="text-right"><span className="text-lg font-light text-[var(--sage)]" style={{fontFamily:'var(--font-display)'}}>{v}</span><span className="text-base text-[#5a7057] ml-1">{u}</span></div>
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
      <PageHeader title="Wedding party" sub={`${members.length} members`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add member</Btn>} />
      <div className="grid grid-cols-2 gap-7">
        {[{label:"Bride's side",side:'bride',list:bride,roles:BRIDE_ROLES},{label:"Groom's side",side:'groom',list:groom,roles:GROOM_ROLES}].map(({label,list,side,roles})=>(
          <div key={label}>
            <h2 className="text-lg font-light text-[#a8c4a4] mb-3" style={{fontFamily:'var(--font-display)'}}>{label}</h2>
            <div className="space-y-2">
              {list.length===0?<div className="border-2 border-dashed border-[#2a3829] rounded-3xl py-10 text-center text-[#5a7057] text-base">No members yet</div>
                :list.map(m=>(
                  <div key={m.id} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-9 h-9 rounded-full bg-[var(--sage-light,#1e3a1e)] flex items-center justify-center text-base font-semibold text-[var(--sage)]">{m.name.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}</div>
                        <div><p className="font-medium text-[#e8f0e6]">{m.name}</p><p className="text-base text-[var(--sage)]">{m.role}</p></div>
                      </div>
                      <button onClick={()=>setMembers(p=>p.filter(x=>x.id!==m.id))} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={19}/></button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-5">
                      {m.phone&&<a href={`tel:${m.phone}`} className="flex items-center gap-1 text-base text-[#5a7057] hover:text-[var(--sage)]"><Phone size={11}/>{m.phone}</a>}
                      {m.email&&<a href={`mailto:${m.email}`} className="flex items-center gap-1 text-base text-[#5a7057] hover:text-[var(--sage)]"><Mail size={11}/>{m.email}</a>}
                    </div>
                    {m.attire&&<p className="text-base text-[#5a7057] mt-1.5">Attire: {m.attire}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      {showAdd&&(
        <Modal title="Add party member" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.name.trim()}><Plus size={17}/>Add</Btn></>}>
          <Field label="Name *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-5">
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
  const [items, setItems] = useState<{id:string;time:string;title:string;desc:string;who:string;order:number}[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string|null>(null)

  useEffect(() => { $get('timeline').then(d => { setItems(Array.isArray(d)?d:[]); setLoading(false) }) }, [])

  const update = async (id:string, field:string, val:string) => {
    setItems(p => p.map(i => i.id===id ? {...i,[field]:val} : i))
    await $patch('timeline-item', { id, [field]: val })
  }

  const add = async () => {
    const res = await $post('timeline-item', { title:'New event', time:'', desc:'', who:'', order: items.length })
    setItems(p => [...p, res])
    setEditing(res.id)
  }

  const del = async (id:string) => {
    await $del('timeline-item', id)
    setItems(p => p.filter(i => i.id !== id))
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:80}}><Loader2 size={24} className="animate-spin" style={{color:'#3a5038'}} /></div>

  return (
    <div>
      <PageHeader title="Day-of timeline" action={<div style={{display:'flex',gap:12}}>
        <Btn variant="ghost" onClick={()=>window.print()}>Print</Btn>
        <Btn onClick={add}><Plus size={17}/>Add event</Btn>
      </div>} />
      <div style={{position:'relative'}}>
        <div style={{position:'absolute',left:72,top:0,bottom:0,width:1,background:'#1e2e1c'}}/>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {items.map(item => (
            <div key={item.id} style={{display:'flex',gap:18,alignItems:'flex-start'}}>
              <div style={{width:64,textAlign:'right',flexShrink:0,paddingTop:14}}>
                {editing===item.id
                  ? <input value={item.time} onChange={e=>update(item.id,'time',e.target.value)}
                      style={{width:'100%',textAlign:'right',fontSize:13,fontWeight:600,border:'1px solid #2a3829',borderRadius:8,padding:'4px 8px',background:'#141c13',color:'var(--sage)',outline:'none'}} placeholder="4:00 PM"/>
                  : <span style={{fontSize:13,fontWeight:600,color:'#6a9068'}}>{item.time||'—'}</span>}
              </div>
              <div style={{width:12,height:12,borderRadius:'50%',background:'var(--accent)',border:'2px solid #111714',flexShrink:0,marginTop:14,position:'relative',zIndex:1}}/>
              <div
                style={{flex:1,background:'#1a2419',borderRadius:14,padding:16,cursor:'pointer',border:`1px solid ${editing===item.id?'#4a7a44':'#202e1f'}`,transition:'border-color 0.2s'}}
                onClick={()=>setEditing(editing===item.id?null:item.id)}>
                {editing===item.id ? (
                  <div style={{display:'flex',flexDirection:'column',gap:8}} onClick={e=>e.stopPropagation()}>
                    <input value={item.title} onChange={e=>update(item.id,'title',e.target.value)}
                      style={{fontSize:15,fontWeight:600,border:'none',background:'transparent',color:'#e8f0e6',outline:'none',width:'100%'}}/>
                    <input value={item.desc} onChange={e=>update(item.id,'desc',e.target.value)}
                      style={{fontSize:13,border:'none',background:'transparent',color:'#6a9068',outline:'none',width:'100%'}} placeholder="Description"/>
                    <input value={item.who} onChange={e=>update(item.id,'who',e.target.value)}
                      style={{fontSize:13,border:'none',background:'transparent',color:'#4a7a44',outline:'none',width:'100%'}} placeholder="Who's involved"/>
                    <div style={{display:'flex',gap:8,marginTop:4}}>
                      <button onClick={()=>setEditing(null)} style={{fontSize:13,padding:'6px 14px',borderRadius:8,background:'var(--accent)',color:'#e8f0e6',border:'none',cursor:'pointer'}}>Done</button>
                      <button onClick={()=>del(item.id)} style={{fontSize:13,padding:'6px 14px',borderRadius:8,background:'transparent',color:'#f87171',border:'1px solid #3a1a1a',cursor:'pointer'}}>Delete</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontSize:15,fontWeight:600,color:'#e8f0e6'}}>{item.title}</p>
                      {item.desc&&<p style={{fontSize:13,color:'#5a7057',marginTop:2}}>{item.desc}</p>}
                      {item.who&&<p style={{fontSize:13,color:'#4a7a44',marginTop:1}}>{item.who}</p>}
                    </div>
                    <span style={{fontSize:12,color:'#2a3828'}}>click to edit</span>
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

function TabDecor() {
  const AREAS = ['Ceremony arch','Aisle','Head table','Guest tables','Cocktail hour','Entrance','Cake table','Outdoor','Lighting','Other']
  const [items, setItems] = useState<{id:string;area:string;desc:string;vendor:string;cost:string;done:boolean}[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({area:'Guest tables',desc:'',vendor:'',cost:''})
  const add = () => { if(!form.desc.trim()) return; setItems(p=>[...p,{id:Date.now().toString(),...form,done:false}]); setForm({area:'Guest tables',desc:'',vendor:'',cost:''}); setShowAdd(false) }
  return (
    <div>
      <PageHeader title="Décor" sub={`${items.filter(i=>i.done).length}/${items.length} ordered`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add item</Btn>} />
      <div className="space-y-2">
        {items.length===0?<div className="text-center py-16 text-[#5a7057]">Track florals, centrepieces, lighting and décor items here</div>:
          items.map(i=>(
            <div key={i.id} className={`bg-[#1a2419] rounded-3xl border border-[#2a3829] p-3.5 flex items-center gap-5 group ${i.done?'opacity-60':''}`}>
              <button onClick={()=>setItems(p=>p.map(x=>x.id===i.id?{...x,done:!x.done}:x))} className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${i.done?'border-[var(--sage)] bg-[var(--accent)]':'border-stone-300'}`}>{i.done&&<Check size={11} className="text-white"/>}</button>
              <div className="flex-1"><p className={`text-base font-medium ${i.done?'line-through text-[#5a7057]':'text-[#e8f0e6]'}`}>{i.desc}</p><p className="text-base text-[#5a7057]">{i.area}{i.vendor?` · ${i.vendor}`:''}{i.cost?` · $${i.cost}`:''}</p></div>
              <button onClick={()=>setItems(p=>p.filter(x=>x.id!==i.id))} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={19}/></button>
            </div>
          ))}
      </div>
      {showAdd&&(
        <Modal title="Add décor item" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.desc.trim()}><Plus size={17}/>Add</Btn></>}>
          <Field label="Area"><Select value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))}>{AREAS.map(a=><option key={a}>{a}</option>)}</Select></Field>
          <Field label="Description *"><Input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="e.g. Eucalyptus centrepieces" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-5">
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
      <PageHeader title="Attire" action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add item</Btn>} />
      <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-x-auto">
        <table className="w-full text-base min-w-[560px]">
          <thead><tr className="border-b border-[#202e1f] bg-[#141c13] text-left text-base text-[#5a7057] uppercase tracking-wider">{['Person','Item','Shop','Status','Notes',''].map(h=><th key={h} className="px-6 py-3.5.5 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {items.map(i=>(
              <tr key={i.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#141c13] group">
                <td className="px-5 py-2.5.5 text-base font-medium text-[#a8c4a4]">{i.person}</td>
                <td className="px-5 py-2.5.5 font-medium text-[#e8f0e6]">{i.item}</td>
                <td className="px-5 py-2.5.5"><input value={i.shop} onChange={e=>upd(i.id,'shop',e.target.value)} className="w-full bg-transparent border-0 focus:outline-none text-base text-[#a8c4a4]" placeholder="Add shop…"/></td>
                <td className="px-5 py-2.5.5"><select value={i.status} onChange={e=>upd(i.id,'status',e.target.value)} className={`text-base px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none ${i.status==='Ready'||i.status==='Picked up'?'bg-emerald-950 text-emerald-400':'bg-amber-950 text-amber-400'}`}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
                <td className="px-5 py-2.5.5"><input value={i.notes} onChange={e=>upd(i.id,'notes',e.target.value)} className="w-full bg-transparent border-0 focus:outline-none text-base text-[#5a7057]" placeholder="Notes…"/></td>
                <td className="px-5 py-2.5.5"><button onClick={()=>setItems(p=>p.filter(x=>x.id!==i.id))} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={19}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd&&(
        <Modal title="Add attire item" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.item.trim()}><Plus size={17}/>Add</Btn></>}>
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
      <PageHeader title="Photoshoot" sub={`${shots.filter(s=>s.done).length}/${shots.length} shots done`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add shot</Btn>} />
      <div className="space-y-4">
        {grouped.map(({g,shots:gs})=>(
          <div key={g} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
            <div className="flex justify-between px-6 py-3.5 border-b border-[#202e1f] bg-[#141c13]"><p className="text-base font-medium text-[#cde0ca]">{g}</p><span className="text-base text-[#5a7057]">{gs.filter(s=>s.done).length}/{gs.length}</span></div>
            <div className="p-2">
              {gs.map(s=>(
                <div key={s.id} className={`flex items-center gap-5 px-6 py-3.5.5 rounded-3xl group hover:bg-[#141c13] ${s.done?'opacity-60':''}`}>
                  <button onClick={()=>setShots(p=>p.map(x=>x.id===s.id?{...x,done:!x.done}:x))} className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${s.done?'border-[var(--sage)] bg-[var(--accent)]':'border-stone-300'}`}>{s.done&&<Check size={11} className="text-white"/>}</button>
                  <span className={`text-base flex-1 ${s.done?'line-through text-[#5a7057]':'text-[#cde0ca]'}`}>{s.desc}</span>
                  {s.mustHave&&<span className="text-base px-2 py-0.5 bg-[var(--sage-light,#1e3a1e)] text-[var(--sage)] rounded-full">Must have</span>}
                  <button onClick={()=>setShots(p=>p.filter(x=>x.id!==s.id))} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={19}/></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showAdd&&(
        <Modal title="Add shot" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.desc.trim()}><Plus size={17}/>Add</Btn></>}>
          <Field label="Group"><Select value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))}>{GROUPS.map(g=><option key={g}>{g}</option>)}</Select></Field>
          <Field label="Description *"><Input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Describe the shot" autoFocus /></Field>
          <div className="flex items-center justify-between py-1">
            <p className="text-base text-[#cde0ca]">Must-have</p>
            <button onClick={()=>setForm(f=>({...f,mustHave:!f.mustHave}))} className={`w-11 h-6 rounded-full transition-colors relative ${form.mustHave?'bg-[var(--accent)]':'bg-[#243022]'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#1a2419] shadow transition-transform ${form.mustHave?'translate-x-5':'translate-x-0.5'}`}/></button>
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
            <div key={sec} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#202e1f]" style={{background:bg}}>
                <div className="flex items-center gap-5"><Music size={19} style={{color}}/><h3 className="font-medium text-base" style={{color}}>{label}</h3><span className="text-base opacity-60" style={{color}}>({ss.length})</span></div>
                <button onClick={()=>setAdding(adding===sec?null:sec)} className="text-base px-2.5 py-1 rounded-full font-medium" style={{background:color+'22',color}}><Plus size={26} className="inline mr-1"/>Add</button>
              </div>
              <div className="p-2">
                {adding===sec&&(
                  <div className="flex gap-5 p-2 bg-[#141c13] rounded-3xl mb-2">
                    <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&add(sec)} className="flex-1 px-2 py-1.5 rounded-lg border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)]" placeholder="Song title" autoFocus/>
                    <input value={form.artist} onChange={e=>setForm(f=>({...f,artist:e.target.value}))} className="w-32 px-2 py-1.5 rounded-lg border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)]" placeholder="Artist"/>
                    <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} className="w-24 px-2 py-1.5 rounded-lg border border-[#2a3829] text-base focus:outline-none focus:border-[var(--sage)]" placeholder="Note"/>
                    <button onClick={()=>add(sec)} className="px-3 py-1.5 rounded-lg text-white text-base font-medium" style={{background:'var(--accent)'}}>Add</button>
                    <button onClick={()=>setAdding(null)} className="text-[#5a7057]"><X size={26}/></button>
                  </div>
                )}
                {ss.length===0&&adding!==sec?<p className="text-base text-[#3a5038] px-5 py-2.5.5">No songs yet</p>:
                  ss.map(s=>(
                    <div key={s.id} className="flex items-center gap-5 px-5 py-2.5.5 rounded-3xl hover:bg-[#141c13] group">
                      <div className="flex-1"><p className="text-base font-medium text-[#e8f0e6]">{s.title}</p><p className="text-base text-[#5a7057]">{s.artist}{s.note?` · ${s.note}`:''}</p></div>
                      <button onClick={()=>setSongs(p=>p.filter(x=>x.id!==s.id))} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={19}/></button>
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
      <PageHeader title="Gifts & thank yous" sub={`${gifts.length} gifts · ${pending} thank you${pending!==1?'s':''} to send`} action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Log gift</Btn>} />
      <div className="grid grid-cols-3 gap-7 mb-6">
        {[{label:'Total gifts',val:String(gifts.length)},{label:'Thank yous pending',val:String(pending)},{label:'Est. value',val:fmt$(total)}].map(({label,val})=>(
          <div key={label} className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 text-center">
            <p className="text-2xl font-light" style={{fontFamily:'var(--font-display)'}}>{val}</p>
            <p className="text-base text-[#5a7057] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      {loading?<div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#3a5038]" size={26}/></div>:(
        <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] overflow-hidden">
          {gifts.length===0?<div className="text-center py-14 text-[#5a7057]">No gifts logged yet</div>:(
            <table className="w-full text-base">
              <thead><tr className="border-b border-[#202e1f] bg-[#141c13] text-left text-base text-[#5a7057] uppercase tracking-wider">{['From','Gift','Value','Thank you'].map(h=><th key={h} className="px-6 py-3.5.5 font-medium">{h}</th>)}</tr></thead>
              <tbody>{gifts.map(g=>(
                <tr key={g.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#141c13]">
                  <td className="px-6 py-3.5.5 font-medium text-[#e8f0e6]">{g.fromName}</td>
                  <td className="px-6 py-3.5.5 text-[#7a9878] text-base">{g.description||'—'}</td>
                  <td className="px-6 py-3.5.5">{g.value?`$${g.value.toLocaleString()}`:'—'}</td>
                  <td className="px-6 py-3.5.5"><button onClick={()=>toggle(g.id,g.thankYouSent)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-medium ${g.thankYouSent?'bg-emerald-950 text-emerald-400':'bg-amber-950 text-amber-400'}`}>{g.thankYouSent?<><Check size={11}/>Sent</>:'Mark sent'}</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
      {showAdd&&(
        <Modal title="Log a gift" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={saving||!form.fromName.trim()}>{saving?<><Loader2 size={17} className="animate-spin"/>Saving…</>:<><Plus size={17}/>Save</>}</Btn></>}>
          <Field label="From *"><Input value={form.fromName} onChange={e=>setForm(f=>({...f,fromName:e.target.value}))} placeholder="John & Jane Smith" autoFocus /></Field>
          <Field label="Description"><Input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="KitchenAid stand mixer" /></Field>
          <div className="grid grid-cols-2 gap-5">
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
  const BORDERS: Record<string,string> = { round:'var(--sage)', rectangular:'#378ADD', oval:'#EF9F27' }
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

  const assignGuest = async (guestId: string, tableId: string | null) => {
    await $patch('guest', { id:guestId, tableId: tableId||null })
    setGuests(p=>p.map(g=>g.id===guestId?{...g,tableId:tableId||null}:g))
    setAssignTarget(null)
  }

  const unassigned = guests.filter(g=>g.rsvpStatus==='attending'&&!g.tableId)

  return (
    <div>
      <PageHeader title="Seating chart" sub={`${guests.filter(g=>g.tableId).length} seated · ${unassigned.length} unassigned`}
        action={<Btn onClick={()=>setShowAdd(true)}><Plus size={17}/>Add table</Btn>} />
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#3a5038]" size={26}/></div> : (
        <div className="flex gap-7 h-[520px]">
          <div className="w-56 shrink-0 flex flex-col gap-5">
            <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 flex-1 overflow-y-auto">
              <p className="text-base font-semibold text-[#5a7057] uppercase tracking-wider mb-3">Tables</p>
              {tables.map(t => {
                const cnt = guests.filter(g=>g.tableId===t.id).length
                return <div key={t.id} className="flex items-center gap-1 py-2 border-b border-[#1a2419] last:border-0 group rounded-lg px-1 hover:bg-[#141c13]">
                  <div className="flex-1 cursor-pointer" onClick={()=>setAssignTarget(t.id)}>
                    <p className="text-base font-medium text-[#cde0ca]">{t.name}</p>
                    <p className="text-base text-[#5a7057] capitalize">{t.shape} · {cnt}/{t.seats}</p>
                  </div>
                  <button onClick={async()=>{ if(!confirm(`Delete ${t.name}?`)) return; await $del('table',t.id); setTables(p=>p.filter(x=>x.id!==t.id)); setGuests(p=>p.map(g=>g.tableId===t.id?{...g,tableId:null}:g)) }} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0"><Trash2 size={26}/></button>
                </div>
              })}
              {tables.length===0 && <p className="text-base text-[#5a7057]">No tables yet</p>}
            </div>
            <div className="bg-[#1a2419] rounded-3xl border border-[#2a3829] p-7 flex-1 overflow-y-auto">
              <p className="text-base font-semibold text-[#5a7057] uppercase tracking-wider mb-3">Unassigned ({unassigned.length})</p>
              {unassigned.length===0 ? <p className="text-base text-[#5a7057]">Everyone seated 🎉</p> :
                unassigned.map(g => <div key={g.id} className="flex items-center gap-5 py-1.5 border-b border-[#1a2419] last:border-0">
                  <div className="w-5 h-5 rounded-full bg-[var(--sage-light,#1e3a1e)] flex items-center justify-center text-[10px] font-semibold text-[var(--sage)] shrink-0">{g.name[0]}</div>
                  <span className="text-base text-[#a8c4a4] truncate">{g.name}</span>
                </div>)}
            </div>
          </div>
          <div ref={canvasRef} style={{ flex:1, background:'#0f180e', borderRadius:16, border:'1px solid #1e2e1c', position:'relative', overflow:'hidden', userSelect:'none', minHeight:420 }}>
            <div style={{ position:'absolute', inset:0, opacity:0.12, backgroundImage:'radial-gradient(circle,#4a7048 1px,transparent 1px)', backgroundSize:'28px 28px' }}/>
            {tables.length===0 && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#3a5038', fontSize:15 }}>Add tables to build your floor plan</div>}
            {tables.map(t => {
              const d = DIMS[t.shape]||DIMS.round
              return <div key={t.id} style={{ position:'absolute', left:t.x, top:t.y, width:d.w, height:d.h, background:t.color, borderRadius:d.r, border:`2.5px solid ${BORDERS[t.shape]||'#888'}`, cursor:'grab', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', userSelect:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.4)' }}
                onMouseDown={e=>onMouseDown(e,t.id,t.x,t.y)} onClick={()=>setAssignTarget(t.id)}>
                <p style={{fontSize:12,fontWeight:700,color:'#1a2e1a',textAlign:'center',padding:'0 6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:d.w-10,lineHeight:1.2}}>{t.name}</p>
                <p style={{fontSize:11,color:'#2a4428',marginTop:2,fontWeight:500}}>{guests.filter(g=>g.tableId===t.id).length}/{t.seats}</p>
              </div>
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add table" onClose={()=>setShowAdd(false)} footer={<><Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn><Btn onClick={addTable} disabled={!form.name.trim()}><Plus size={17}/>Add</Btn></>}>
          <Field label="Table name"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Table 1, Head Table…" autoFocus /></Field>
          <Field label="Shape">
            <div className="grid grid-cols-3 gap-5">
              {['round','rectangular','oval'].map(s=><button key={s} onClick={()=>setForm(f=>({...f,shape:s}))} className={`py-2 rounded-3xl text-base font-medium capitalize border-2 transition-all ${form.shape===s?'border-[var(--sage)] bg-[var(--sage-light,#1e3a1e)] text-[var(--sage)]':'border-[#2a3829] text-[#7a9878]'}`}>{s}</button>)}
            </div>
          </Field>
          <Field label={`Seats: ${form.seats}`}><input type="range" min={2} max={20} value={form.seats} onChange={e=>setForm(f=>({...f,seats:+e.target.value}))} className="w-full"/></Field>
        </Modal>
      )}

      {assignTarget && (
        <Modal title={tables.find(t=>t.id===assignTarget)?.name||'Table'} onClose={()=>setAssignTarget(null)}>
          <div className="space-y-1">
            {guests.filter(g=>g.tableId===assignTarget).map(g=>(
              <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#141c13]">
                <span className="text-base text-[#cde0ca]">{g.name}</span>
                <button onClick={()=>assignGuest(g.id,'')} className="text-base text-red-400 hover:text-red-400">Remove</button>
              </div>
            ))}
            {unassigned.length > 0 && <>
              <p className="text-base font-semibold text-[#5a7057] uppercase tracking-wider pt-2 pb-1">Add guest</p>
              {unassigned.map(g=>(
                <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--sage-light,#1e3a1e)] cursor-pointer" onClick={()=>assignGuest(g.id,assignTarget)}>
                  <span className="text-base text-[#cde0ca]">{g.name}</span>
                  <Plus size={19} className="text-[var(--sage)]"/>
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
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--bg)" }}>
      {/* Sidebar — hidden on mobile, shown on desktop */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar activeTab={tab} onTab={setTab} />
      </div>
      {/* Mobile: full-screen drawer handled inside Sidebar */}
      <div className="block md:hidden">
        <Sidebar activeTab={tab} onTab={setTab} />
      </div>
      {/* Main content — on mobile add top padding for the fixed header bar */}
      <main style={{ flex:1, overflowY:"auto", overflowX:"hidden", background:"var(--bg)", minWidth:0 }}
        className="pt-16 px-4 pb-6 md:pt-10 md:px-12 md:pb-10">
        <TabComponent onTab={setTab} />
      </main>
    </div>
  )
}
