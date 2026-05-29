'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, ChevronRight } from 'lucide-react'
import { PageHeader, Card } from '@/components/ui'
import { $get } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats]           = useState({ total: 0, attending: 0, declined: 0, pending: 0 })
  const [venue, setVenue]           = useState<{ name: string; address: string } | null>(null)
  const [loading, setLoading]       = useState(true)
  const [upcomingTasks, setUpcoming] = useState<{ id: string; title: string; category: string; dueDate: string | null; priority: string; completed: boolean }[]>([])

  useEffect(() => {
    Promise.all([$get('guest-stats'), $get('venues'), $get('rsvp-settings'), $get('tasks')])
      .then(([s, vs, rs, tasks]) => {
        setStats(s)
        setVenue(Array.isArray(vs) ? (vs.find((v: { isSelected: boolean }) => v.isSelected) ?? null) : null)

        // Top 5 pending tasks by due date
        const pending = Array.isArray(tasks) ? tasks.filter((t: { completed: boolean }) => !t.completed) : []
        pending.sort((a: { dueDate: string | null }, b: { dueDate: string | null }) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
        setUpcoming(pending.slice(0, 5))

        // Apply colors from DB
        if (rs && !rs.error) {
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
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const rate = stats.total ? Math.round(((stats.attending + stats.declined) / stats.total) * 100) : 0

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: '#3a5038' }} />
    </div>
  )

  return (
    <div>
      <PageHeader title="Good morning 🌿" sub="Here's where your wedding planning stands." />

      {/* Selected venue banner */}
      {venue && (
        <button
          onClick={() => router.push('/dashboard/venues')}
          style={{ width: '100%', marginBottom: 24, background: '#1e3a1e', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#243d24'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1e3a1e'}
        >
          <MapPin size={17} style={{ color: 'var(--sage)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: '#4a7a44', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Selected venue</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#b8d4b4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {venue.name}{(venue as { address?: string }).address ? ` · ${(venue as { address: string }).address}` : ''}
            </p>
          </div>
          <ChevronRight size={17} style={{ color: '#4a7a44', flexShrink: 0 }} />
        </button>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28, marginBottom: 28 }}>
        {[
          { label: 'Total guests',  val: stats.total,    sub: 'on the list',      color: 'var(--sage)' },
          { label: 'Attending',     val: stats.attending, sub: `${rate}% responded`, color: '#00ff00' },
          { label: 'Pending RSVP', val: stats.pending,   sub: 'no reply yet',     color: '#f0b429'  },
          { label: 'Declined',      val: stats.declined,  sub: 'unable to come',   color: '#ff0000'  },
        ].map(({ label, val, sub, color }) => (
          <Card key={label}>
            <p style={{ fontSize: 12, color: 'var(--subheader)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color, lineHeight: 1, marginBottom: 4 }}>{val}</p>
            <p style={{ fontSize: 13, color: 'var(--body)' }}>{sub}</p>
          </Card>
        ))}
      </div>

      {/* RSVP progress */}
      <Card style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginBottom: 14 }}>
          <span style={{ fontWeight: 600, color: 'var(--title)' }}>RSVP progress</span>
          <span style={{ color: 'var(--body)' }}>{stats.attending + stats.declined} / {stats.total}</span>
        </div>
        <div style={{ height: 10, background: '#1f2b1e', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
          <div style={{ height: '100%', background: '#00ff00', borderRadius: 5, transition: 'width 0.5s', width: `${stats.total ? (stats.attending / stats.total) * 100 : 0}%` }} />
          <div style={{ height: '100%', background: '#ff0000', transition: 'width 0.5s', width: `${stats.total ? (stats.declined / stats.total) * 100 : 0}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13, color: 'var(--body)' }}>
          {[['#00ff00', 'Attending'], ['#ff0000', 'Declined'], ['#1e2e1c', 'Pending']].map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} /> {l}
            </span>
          ))}
        </div>
      </Card>

      {/* Upcoming tasks */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--title)' }}>Upcoming tasks</p>
          <button onClick={() => router.push('/dashboard/tasks')} style={{ fontSize: 13, color: 'var(--sage)', background: 'none', border: 'none', cursor: 'pointer' }}>
            View all →
          </button>
        </div>
        {upcomingTasks.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--body)', textAlign: 'center', padding: '16px 0' }}>No pending tasks 🎉</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingTasks.map(t => {
                const daysUntil = t.dueDate ? Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000) : null
                const urgency   = daysUntil === null ? '#9ca3af' : daysUntil < 0 ? '#ff0000' : daysUntil <= 7 ? '#f0b429' : '#00ff00'
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg3,#1a2419)', borderRadius: 10, border: '1px solid #202e1f' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgency, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--body)' }}>{t.category}</p>
                    </div>
                    {t.dueDate && (
                      <p style={{ fontSize: 12, color: urgency, flexShrink: 0, fontWeight: 600 }}>
                        {daysUntil === 0 ? 'Today' : daysUntil! < 0 ? `${Math.abs(daysUntil!)}d overdue` : `${daysUntil}d`}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </Card>
    </div>
  )
}
