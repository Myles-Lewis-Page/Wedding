'use client'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply colors from DB on first load  localStorage is already applied
    // by the inline script in layout.tsx (no flash), this just keeps DB as source of truth
    fetch('/api/db?t=rsvp-settings')
      .then(r => r.json())
      .then(rs => {
        if (!rs || rs.error) return
        const map: Record<string, string> = {
          '--accent':    rs.accentColor    || '#4a7a44',
          '--sage':      rs.secondaryColor || '#8fb882',
          '--bg':        rs.bgColor        || '#111714',
          '--bg2':       rs.bgColor        || '#111714',
          '--bg3':       rs.tertiaryColor  || '#1a2419',
          '--title':     rs.titleColor     || '#ffffff',
          '--subheader': rs.subheaderColor || '#000000',
          '--body':      rs.bodyColor      || '#9ca3af',
        }
        Object.entries(map).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
        // Keep localStorage in sync
        localStorage.setItem('weddingColors', JSON.stringify({
          accent:    rs.accentColor    || '#4a7a44',
          sage:      rs.secondaryColor || '#8fb882',
          bg:        rs.bgColor        || '#111714',
          tertiary:  rs.tertiaryColor  || '#1a2419',
          title:     rs.titleColor     || '#ffffff',
          subheader: rs.subheaderColor || '#000000',
          body:      rs.bodyColor      || '#9ca3af',
          swatchBridesmaids: rs.swatchBridesmaids || '#9bb89a',
          swatchSuits:       rs.swatchSuits       || '#4a5568',
          swatchVenue:       rs.swatchVenue        || '#8b7355',
          swatchFlowers:     rs.swatchFlowers      || '#e8b4bc',
        }))
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg2,#1a2419)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>
      {/* Mobile sidebar (renders its own fixed header + drawer) */}
      <div className="block md:hidden">
        <Sidebar />
      </div>
      {/* Main content */}
      <main
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)', minWidth: 0, padding: 0 }}
        className="pt-16 md:pt-0"
      >
        <div style={{ minHeight: '100%', background: 'var(--bg)', padding: '28px' }} className="pt-20 md:pt-7">
          {children}
        </div>
      </main>
    </div>
  )
}
