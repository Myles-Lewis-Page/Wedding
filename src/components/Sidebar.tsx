'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'

const TABS = [
  { section: 'Overview',  links: [
    { href: '/dashboard',          label: 'Dashboard' },
    { href: '/dashboard#moodboard',label: 'Mood board' },
  ]},
  { section: 'Guests', links: [
    { href: '/dashboard#guests',   label: 'Guest list' },
    { href: '/dashboard#rsvp',     label: 'RSVP portal' },
    { href: '/dashboard#seating',  label: 'Seating chart' },
  ]},
  { section: 'Venue', links: [
    { href: '/dashboard#venues',   label: 'Venues' },
  ]},
  { section: 'Planning', links: [
    { href: '/dashboard#budget',   label: 'Budget' },
    { href: '/dashboard#vendors',  label: 'Vendors' },
    { href: '/dashboard#tasks',    label: 'Tasks' },
    { href: '/dashboard#checklist',label: 'Checklist' },
  ]},
  { section: 'Details', links: [
    { href: '/dashboard#party',    label: 'Wedding party' },
    { href: '/dashboard#timeline', label: 'Timeline' },
    { href: '/dashboard#menu',     label: 'Menu & drinks' },
    { href: '/dashboard#decor',    label: 'Décor' },
    { href: '/dashboard#attire',   label: 'Attire' },
    { href: '/dashboard#photoshoot',label: 'Photoshoot' },
    { href: '/dashboard#playlist', label: 'Playlist' },
    { href: '/dashboard#gifts',    label: 'Gifts' },
  ]},
]

export default function Sidebar({ activeTab, onTab }: { activeTab: string; onTab: (t: string) => void }) {
  return (
    <aside className="w-48 shrink-0 h-screen bg-white border-r border-stone-200 flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-stone-100 shrink-0">
        <div className="flex items-center gap-2">
          <Heart size={13} fill="#7A9C6E" className="text-[#7A9C6E] shrink-0" />
          <span className="text-sm font-semibold tracking-wide text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
            Sage Planner
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5 pl-5">Jennifer & Myles</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {TABS.map(({ section, links }) => (
          <div key={section} className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 px-2 mb-1">{section}</p>
            {links.map(({ href, label }) => {
              const tab = href.split('#')[1] || 'home'
              const active = activeTab === tab
              return (
                <button
                  key={href}
                  onClick={() => onTab(tab)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] mb-0.5 transition-all ${
                    active ? 'bg-[#EDF4EA] text-[#3d6b2e] font-medium' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-3 p-3 bg-[#EDF4EA] rounded-xl text-center shrink-0">
        <Countdown />
      </div>
    </aside>
  )
}

function Countdown() {
  const date = typeof window !== 'undefined' ? localStorage.getItem('weddingDate') : null
  if (!date) return <p className="text-xs text-[#7A9C6E]">Set your date →</p>
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  return (
    <>
      <p className="text-2xl font-medium text-[#3d6b2e]" style={{ fontFamily: 'var(--font-display)' }}>{days > 0 ? days : '🎉'}</p>
      <p className="text-[11px] text-[#7A9C6E]">days to go</p>
    </>
  )
}
