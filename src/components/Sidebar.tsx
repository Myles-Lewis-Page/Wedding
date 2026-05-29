'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart, LogOut, Menu, X } from 'lucide-react'

const TABS = [
  { section: 'Overview', links: [
    { path: '/dashboard/home',      label: 'Dashboard'   },
    { path: '/dashboard/moodboard', label: 'Mood board'  },
    { path: '/dashboard/settings',  label: 'Settings'    },
  ]},
  { section: 'Guests', links: [
    { path: '/dashboard/guests',    label: 'Guest list'    },
    { path: '/dashboard/rsvp',      label: 'RSVP portal'   },
    { path: '/dashboard/seating',   label: 'Seating chart' },
  ]},
  { section: 'Venue', links: [
    { path: '/dashboard/venues',    label: 'Venues' },
  ]},
  { section: 'Planning', links: [
    { path: '/dashboard/budget',    label: 'Budget'    },
    { path: '/dashboard/vendors',   label: 'Vendors'   },
    { path: '/dashboard/tasks',     label: 'Tasks'     },
    { path: '/dashboard/checklist', label: 'Checklist' },
  ]},
  { section: 'Details', links: [
    { path: '/dashboard/party',      label: 'Wedding party' },
    { path: '/dashboard/timeline',   label: 'Timeline'      },
    { path: '/dashboard/menu',       label: 'Menu & drinks' },
    { path: '/dashboard/decor',      label: 'Décor'         },
    { path: '/dashboard/attire',     label: 'Attire'        },
    { path: '/dashboard/photoshoot', label: 'Photoshoot'    },
    { path: '/dashboard/playlist',   label: 'Playlist'      },
    { path: '/dashboard/gifts',      label: 'Gifts'         },
  ]},
]

// ── Couple name (live from DB, cached in localStorage) ─────────────────────
function CoupleName() {
  const [name, setName] = useState('Our Wedding')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('coupleName')
      if (stored) setName(stored)
    } catch {}

    fetch('/api/db?t=rsvp-settings')
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) return
        const bride   = d.brideName  || ''
        const groom   = d.groomName  || ''
        const last    = d.lastName   || ''
        const coupled = bride && groom ? `${bride} & ${groom}` : bride || groom || d.heading || 'Our Wedding'
        const full    = coupled + (last ? ' ' + last : '')
        setName(full)
        try { localStorage.setItem('coupleName', full) } catch {}
      })
      .catch(() => {})

    const handler = (e: StorageEvent) => { if (e.key === 'coupleName' && e.newValue) setName(e.newValue) }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return <>{name}</>
}

// ── Countdown ──────────────────────────────────────────────────────────────
function Countdown() {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    const load = () => {
      const date = localStorage.getItem('weddingDate')
      if (date) setDays(Math.ceil((new Date(date + 'T12:00:00').getTime() - Date.now()) / 86400000))
    }
    load()
    const handler = (e: StorageEvent) => { if (e.key === 'weddingDate') load() }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  if (days === null) return <p style={{ fontSize: 11, color: '#4a6448' }}>Set date in Settings →</p>
  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--sage)', lineHeight: 1 }}>
        {days > 0 ? days : '🎉'}
      </p>
      <p style={{ fontSize: 11, color: '#4a6448', marginTop: 2 }}>{days > 0 ? 'days to go' : 'Today!'}</p>
    </>
  )
}

// ── Nav links ──────────────────────────────────────────────────────────────
function NavLinks({ onClose }: { onClose?: () => void }) {
  const router   = useRouter()
  const pathname = usePathname()

  const navigate = (path: string) => {
    router.push(path)
    onClose?.()
  }

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 12px', borderBottom: '1px solid #1e2e1c', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={15} fill="var(--sage)" style={{ color: 'var(--sage)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: '#e8f0e6', letterSpacing: 1 }}>
            Wedding Planner
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a7057', lineHeight: 0, padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>
      <p style={{ fontSize: 11, color: '#4a6448', padding: '6px 18px 0', flexShrink: 0 }}>
        <CoupleName />
      </p>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        {TABS.map(({ section, links }) => (
          <div key={section} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3a5038', padding: '0 10px', marginBottom: 3 }}>
              {section}
            </p>
            {links.map(({ path, label }) => {
              const active = pathname === path || (path === '/dashboard/home' && pathname === '/dashboard')
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 10,
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? 'var(--sage-dark,#b8d4b4)' : '#5a7857',
                    background: active ? 'var(--sage-light,#1e3a1e)' : 'transparent',
                    border: 'none', cursor: 'pointer', marginBottom: 1, transition: 'all 0.12s',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#161f15'; e.currentTarget.style.color = 'var(--sage)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a7857' } }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px', flexShrink: 0, borderTop: '1px solid #1e2e1c' }}>
        <div style={{ background: 'var(--sage-light,#1e3a1e)', borderRadius: 14, padding: '10px 12px', textAlign: 'center', marginBottom: 8 }}>
          <Countdown />
        </div>
        <button
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, fontSize: 13, color: '#3a5038', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--sage)'; e.currentTarget.style.background = '#161f15' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a5038'; e.currentTarget.style.background = 'none' }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside style={{ width: 220, minWidth: 220, height: '100vh', background: '#0f1a0e', borderRight: '1px solid #1e2e1c', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }} className="hidden md:flex">
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 100, background: '#0f1a0e', borderBottom: '1px solid #1e2e1c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }} className="flex md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={14} fill="var(--sage)" style={{ color: 'var(--sage)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: '#e8f0e6' }}>Wedding Planner</span>
        </div>
        <button type="button" onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sage)', padding: 6, lineHeight: 0 }} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} className="md:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 270, background: '#0f1a0e', borderRight: '1px solid #1e2e1c', display: 'flex', flexDirection: 'column' }}>
            <NavLinks onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
