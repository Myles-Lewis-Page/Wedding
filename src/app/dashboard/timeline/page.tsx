'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Btn, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface TimelineItem { id: string; time: string; title: string; desc: string; who: string; order: number }

export default function TimelinePage() {
  const [items, setItems]     = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => { $get('timeline').then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const update = async (id: string, field: string, val: string) => {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i))
    await $patch('timeline-item', { id, [field]: val })
  }

  const add = async () => {
    const res = await $post('timeline-item', { title: 'New event', time: '', desc: '', who: '', order: items.length })
    setItems(p => [...p, res]); setEditing(res.id)
  }

  const del = async (id: string) => {
    await $del('timeline-item', id); setItems(p => p.filter(i => i.id !== id))
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Loader2 size={24} className="animate-spin" style={{ color: '#3a5038' }} /></div>

  return (
    <div>
      <PageHeader
        title="Day-of timeline"
        action={
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" onClick={() => window.print()}>Print</Btn>
            <Btn onClick={add}><Plus size={17} />Add event</Btn>
          </div>
        }
      />
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 72, top: 0, bottom: 0, width: 1, background: '#1e2e1c' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 64, textAlign: 'right', flexShrink: 0, paddingTop: 14 }}>
                {editing === item.id
                  ? <input value={item.time} onChange={e => update(item.id, 'time', e.target.value)}
                      style={{ width: '100%', textAlign: 'right', fontSize: 13, fontWeight: 600, border: '1px solid #2a3829', borderRadius: 8, padding: '4px 8px', background: 'var(--bg3,#1a2419)', color: 'var(--sage)', outline: 'none' }} placeholder="4:00 PM" />
                  : <span style={{ fontSize: 13, fontWeight: 600, color: '#6a9068' }}>{item.time || ''}</span>}
              </div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', border: '2px solid #111714', flexShrink: 0, marginTop: 14, position: 'relative', zIndex: 1 }} />
              <div
                style={{ flex: 1, background: 'var(--bg3,#1a2419)', borderRadius: 14, padding: 16, cursor: 'pointer', border: `1px solid ${editing === item.id ? '#4a7a44' : '#202e1f'}`, transition: 'border-color 0.2s' }}
                onClick={() => setEditing(editing === item.id ? null : item.id)}
              >
                {editing === item.id
                  ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={e => e.stopPropagation()}>
                      <input value={item.title} onChange={e => update(item.id, 'title', e.target.value)}
                        style={{ fontSize: 15, fontWeight: 600, border: 'none', background: 'transparent', color: 'var(--title)', outline: 'none', width: '100%' }} />
                      <input value={item.desc} onChange={e => update(item.id, 'desc', e.target.value)}
                        style={{ fontSize: 13, border: 'none', background: 'transparent', color: '#6a9068', outline: 'none', width: '100%' }} placeholder="Description" />
                      <input value={item.who} onChange={e => update(item.id, 'who', e.target.value)}
                        style={{ fontSize: 13, border: 'none', background: 'transparent', color: '#4a7a44', outline: 'none', width: '100%' }} placeholder="Who's involved" />
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button onClick={() => setEditing(null)} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, background: 'var(--accent)', color: 'var(--title)', border: 'none', cursor: 'pointer' }}>Done</button>
                        <button onClick={() => del(item.id)} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, background: 'transparent', color: '#f87171', border: '1px solid #3a1a1a', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  )
                  : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--title)' }}>{item.title}</p>
                        {item.desc && <p style={{ fontSize: 13, color: '#5a7057', marginTop: 2 }}>{item.desc}</p>}
                        {item.who  && <p style={{ fontSize: 13, color: '#4a7a44', marginTop: 1 }}>{item.who}</p>}
                      </div>
                      <span style={{ fontSize: 12, color: '#2a3828' }}>click to edit</span>
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
