'use client'
import { useRouter } from 'next/navigation'
import { Heart, LogOut } from 'lucide-react'

const TABS = [
  { section: 'Overview', links: [
    { tab: 'home',       label: 'Dashboard' },
    { tab: 'moodboard',  label: 'Mood board' },
  ]},
  { section: 'Guests', links: [
    { tab: 'guests',     label: 'Guest list' },
    { tab: 'rsvp',       label: 'RSVP portal' },
    { tab: 'seating',    label: 'Seating chart' },
  ]},
  { section: 'Venue', links: [
    { tab: 'venues',     label: 'Venues' },
  ]},
  { section: 'Planning', links: [
    { tab: 'budget',     label: 'Budget' },
    { tab: 'vendors',    label: 'Vendors' },
    { tab: 'tasks',      label: 'Tasks' },
    { tab: 'checklist',  label: 'Checklist' },
  ]},
  { section: 'Details', links: [
    { tab: 'party',      label: 'Wedding party' },
    { tab: 'timeline',   label: 'Timeline' },
    { tab: 'menu',       label: 'Menu & drinks' },
    { tab: 'decor',      label: 'Décor' },
    { tab: 'attire',     label: 'Attire' },
    { tab: 'photoshoot', label: 'Photoshoot' },
    { tab: 'playlist',   label: 'Playlist' },
    { tab: 'gifts',      label: 'Gifts' },
  ]},
]

export default function Sidebar({ activeTab, onTab }: { activeTab: string; onTab: (t: string) => void }) {
  const router = useRouter()
  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{ width: 220, minWidth: 220, height: '100vh', background: '#0f1a0e', borderRight: '1px solid #1e2e1c', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #1e2e1c', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={15} fill="var(--sage)" style={{ color: 'var(--sage)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: '#e8f0e6', letterSpacing: 1 }}>
            Sage Planner
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#4a6448', marginTop: 3, paddingLeft: 23 }}>Jennifer & Myles</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {TABS.map(({ section, links }) => (
          <div key={section} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3a5038', padding: '0 10px', marginBottom: 4 }}>
              {section}
            </p>
            {links.map(({ tab, label }) => {
              const active = activeTab === tab
              return (
                <button key={tab} onClick={() => onTab(tab)} style={{
                  width: '100%', textAlign: 'left', padding: '9px 12px',
                  borderRadius: 10, fontSize: 14, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--sage-dark, #b8d4b4)' : '#5a7857',
                  background: active ? 'var(--sage-light, #1e3a1e)' : 'transparent',
                  border: 'none', cursor: 'pointer', marginBottom: 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { (e.target as HTMLElement).style.background = '#161f15'; (e.target as HTMLElement).style.color = 'var(--sage)' } }}
                onMouseLeave={e => { if (!active) { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#5a7857' } }}>
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Countdown + logout */}
      <div style={{ padding: '12px 10px', flexShrink: 0 }}>
        <div style={{ background: 'var(--sage-light, #1e3a1e)', borderRadius: 14, padding: '12px', textAlign: 'center', marginBottom: 8 }}>
          <Countdown />
        </div>
        <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, fontSize: 13, color: '#3a5038', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget).style.color = 'var(--sage)'; (e.currentTarget).style.background = '#161f15' }}
          onMouseLeave={e => { (e.currentTarget).style.color = '#3a5038'; (e.currentTarget).style.background = 'none' }}>
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function Countdown() {
  const date = typeof window !== 'undefined' ? localStorage.getItem('weddingDate') : null
  if (!date) return <p style={{ fontSize: 12, color: '#4a6448' }}>Set date in Venues →</p>
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--sage)' }}>{days > 0 ? days : '🎉'}</p>
      <p style={{ fontSize: 11, color: '#4a6448', marginTop: 2 }}>days to go</p>
    </>
  )
}
