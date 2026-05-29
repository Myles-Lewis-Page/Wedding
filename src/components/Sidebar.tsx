'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, LogOut, Menu, X } from 'lucide-react'

const TABS = [
  { section: 'Overview', links: [
    { tab: 'home', label: 'Dashboard' },
    { tab: 'moodboard', label: 'Mood board' },
    { tab: 'colors',    label: 'Settings' },
  ]},
  { section: 'Guests', links: [
    { tab: 'guests', label: 'Guest list' },
    { tab: 'rsvp', label: 'RSVP portal' },
    { tab: 'seating', label: 'Seating chart' },
  ]},
  { section: 'Venue', links: [
    { tab: 'venues', label: 'Venues' },
  ]},
  { section: 'Planning', links: [
    { tab: 'budget', label: 'Budget' },
    { tab: 'vendors', label: 'Vendors' },
    { tab: 'tasks', label: 'Tasks' },
    { tab: 'checklist', label: 'Checklist' },
  ]},
  { section: 'Details', links: [
    { tab: 'party', label: 'Wedding party' },
    { tab: 'timeline', label: 'Timeline' },
    { tab: 'menu', label: 'Menu & drinks' },
    { tab: 'decor', label: 'Décor' },
    { tab: 'attire', label: 'Attire' },
    { tab: 'photoshoot', label: 'Photoshoot' },
    { tab: 'playlist', label: 'Playlist' },
    { tab: 'gifts', label: 'Gifts' },
  ]},
]

interface SidebarProps { activeTab: string; onTab: (t: string) => void }

function CoupleName() {
  const [name, setName] = useState('Our Wedding')

  const refreshName = () => {
    try {
      const stored = localStorage.getItem('coupleName')
      if (stored) setName(stored)
    } catch {}
  }

  useEffect(() => {
    // Load from localStorage immediately
    refreshName()
    // Fetch from DB
    fetch('/api/db?t=rsvp-settings').then(r=>r.json()).then(d=>{
      if (d && !d.error) {
        const bride = d.brideName || ''
        const groom = d.groomName || ''
        const last  = d.lastName  || ''
        const coupled = bride && groom ? `${bride} & ${groom}` : bride || groom || d.heading || 'Our Wedding'
        const full = coupled + (last ? ' ' + last : '')
        setName(full)
        try { localStorage.setItem('coupleName', full) } catch {}
      }
    }).catch(()=>{})
    // Listen for live updates from the Settings tab Save
    const handler = (e: StorageEvent) => { if (e.key === 'coupleName' && e.newValue) setName(e.newValue) }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  return <>{name}</>
}

function NavLinks({ activeTab, onTab, onClose }: SidebarProps & { onClose?: () => void }) {
  const router = useRouter()
  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'20px 18px 12px', borderBottom:'1px solid #1e2e1c', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Heart size={15} fill="var(--sage)" style={{ color:'var(--sage)', flexShrink:0 }} />
          <span style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:500, color:'#e8f0e6', letterSpacing:1 }}>Wedding Planner</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#5a7057', lineHeight:0, padding:4 }}>
            <X size={20} />
          </button>
        )}
      </div>
      <p style={{ fontSize:11, color:'#4a6448', padding:'6px 18px 0', flexShrink:0 }}><CoupleName /></p>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'10px 10px' }}>
        {TABS.map(({ section, links }) => (
          <div key={section} style={{ marginBottom:14 }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', color:'#3a5038', padding:'0 10px', marginBottom:3 }}>{section}</p>
            {links.map(({ tab, label }) => {
              const active = activeTab === tab
              return (
                <button key={tab} onClick={() => { onTab(tab); onClose?.() }} style={{
                  width:'100%', textAlign:'left', padding:'9px 12px', borderRadius:10,
                  fontSize:14, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--sage-dark,#b8d4b4)' : '#5a7857',
                  background: active ? 'var(--sage-light,#1e3a1e)' : 'transparent',
                  border:'none', cursor:'pointer', marginBottom:1, transition:'all 0.12s',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background='#161f15'; e.currentTarget.style.color='var(--sage)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#5a7857' } }}>
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'10px', flexShrink:0, borderTop:'1px solid #1e2e1c' }}>
        <div style={{ background:'var(--sage-light,#1e3a1e)', borderRadius:14, padding:'10px 12px', textAlign:'center', marginBottom:8 }}>
          <Countdown />
        </div>
        <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:10, fontSize:13, color:'#3a5038', background:'none', border:'none', cursor:'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--sage)'; e.currentTarget.style.background='#161f15' }}
          onMouseLeave={e => { e.currentTarget.style.color='#3a5038'; e.currentTarget.style.background='none' }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  )
}

function Countdown() {
  const [days, setDays] = useState<number | null>(null)
  useEffect(() => {
    const date = localStorage.getItem('weddingDate')
    if (date) setDays(Math.ceil((new Date(date).getTime() - Date.now()) / 86400000))
  }, [])
  if (days === null) return <p style={{ fontSize:11, color:'#4a6448' }}>Set date in Venues →</p>
  return (
    <>
      <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:400, color:'var(--sage)', lineHeight:1 }}>{days > 0 ? days : '🎉'}</p>
      <p style={{ fontSize:11, color:'#4a6448', marginTop:2 }}>days to go</p>
    </>
  )
}

export default function Sidebar({ activeTab, onTab }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── DESKTOP: fixed sidebar ── */}
      <aside style={{
        width: 220, minWidth: 220, height: '100vh',
        background: '#0f1a0e', borderRight: '1px solid #1e2e1c',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
      }} className="hidden md:flex">
        <NavLinks activeTab={activeTab} onTab={onTab} />
      </aside>

      {/* ── MOBILE: fixed top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 100,
        background: '#0f1a0e', borderBottom: '1px solid #1e2e1c',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }} className="flex md:hidden">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Heart size={14} fill="var(--sage)" style={{ color:'var(--sage)', flexShrink:0 }} />
          <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:500, color:'#e8f0e6' }}>Wedding Planner</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--sage)', padding:6, lineHeight:0 }}
          aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      {/* ── MOBILE: drawer ── */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:200 }} className="md:hidden">
          {/* backdrop */}
          <div
            style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }}
            onClick={() => setOpen(false)}
          />
          {/* panel */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 270,
            background: '#0f1a0e', borderRight: '1px solid #1e2e1c',
            display: 'flex', flexDirection: 'column',
          }}>
            <NavLinks activeTab={activeTab} onTab={onTab} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
