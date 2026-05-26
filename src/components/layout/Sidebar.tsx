'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Image, Users, QrCode, Grid3x3,
  Building2, PieChart, Store, CheckSquare, ListTodo,
  Star, Clock, UtensilsCrossed, Flower2, Shirt,
  Camera, Music, Gift, Heart,
} from 'lucide-react'

const nav = [
  { label: 'Overview', items: [
    { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/moodboard', icon: Image,           label: 'Mood board' },
  ]},
  { label: 'Guests', items: [
    { href: '/dashboard/guests',    icon: Users,    label: 'Guest list' },
    { href: '/dashboard/rsvp',      icon: QrCode,   label: 'RSVP portal' },
    { href: '/dashboard/seating',   icon: Grid3x3,  label: 'Seating chart' },
  ]},
  { label: 'Venue', items: [
    { href: '/dashboard/venues',    icon: Building2, label: 'Venues' },
  ]},
  { label: 'Planning', items: [
    { href: '/dashboard/budget',     icon: PieChart,     label: 'Budget' },
    { href: '/dashboard/vendors',    icon: Store,        label: 'Vendors' },
    { href: '/dashboard/checklists', icon: CheckSquare,  label: 'Checklists' },
    { href: '/dashboard/tasks',      icon: ListTodo,     label: 'Tasks' },
  ]},
  { label: 'Details', items: [
    { href: '/dashboard/party',      icon: Star,            label: 'Wedding party' },
    { href: '/dashboard/timeline',   icon: Clock,           label: 'Timeline' },
    { href: '/dashboard/menu',       icon: UtensilsCrossed, label: 'Menu & drinks' },
    { href: '/dashboard/decor',      icon: Flower2,         label: 'Décor' },
    { href: '/dashboard/attire',     icon: Shirt,           label: 'Attire' },
    { href: '/dashboard/photoshoot', icon: Camera,          label: 'Photoshoot' },
    { href: '/dashboard/playlist',   icon: Music,           label: 'Playlist' },
    { href: '/dashboard/gifts',      icon: Gift,            label: 'Gifts & thank yous' },
  ]},
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-52 min-w-[208px] h-screen bg-white border-r border-stone-200 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-[#7A9C6E] flex-shrink-0" fill="#7A9C6E" />
          <span style={{ fontFamily: 'var(--font-display)' }} className="text-base font-medium tracking-wide truncate">
            Sage Planner
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5 ml-5 truncate">Sarah & James · Jun 14, 2026</p>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {nav.map((section) => (
          <div key={section.label} className="mb-3">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 px-2 mb-1 font-medium">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = path === item.href ||
                (item.href !== '/dashboard' && path.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-all duration-150 mb-0.5',
                    active
                      ? 'bg-[#EDF4EA] text-[#4A6B3E] font-medium'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  )}
                >
                  <item.icon
                    size={14}
                    className={cn('flex-shrink-0', active ? 'text-[#7A9C6E]' : 'text-stone-400')}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Countdown — fixed at bottom */}
      <div className="mx-3 mb-3 p-3 bg-[#EDF4EA] rounded-xl text-center flex-shrink-0">
        <p className="text-2xl font-medium text-[#4A6B3E]" style={{ fontFamily: 'var(--font-display)' }}>
          <Countdown />
        </p>
        <p className="text-[11px] text-[#7A9C6E]">days to go</p>
      </div>
    </aside>
  )
}

function Countdown() {
  const wedding = new Date('2026-06-14')
  const diff = Math.ceil((wedding.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return <>{diff > 0 ? diff : '🎉'}</>
}
