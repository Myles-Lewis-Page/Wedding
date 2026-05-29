'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, Music } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { $get, $post, $del } from '@/lib/utils'

interface Song { id: string; section: string; title: string; artist: string; note: string }

const SECS: Record<string, string> = {
  ceremony:   'Ceremony',
  cocktail:   'Cocktail hour',
  dinner:     'Dinner',
  dancing:    'Dancing',
  donotplay:  'Do not play',
}
const COLORS: Record<string, [string, string]> = {
  ceremony:  ['#EDF4EA', '#3d6b2e'],
  cocktail:  ['#E6F1FB', '#185FA5'],
  dinner:    ['#FAEEDA', '#854F0B'],
  dancing:   ['#EEEDFE', '#3C3489'],
  donotplay: ['#FCEBEB', '#A32D2D'],
}

export default function PlaylistPage() {
  const [songs, setSongs]     = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState<string | null>(null)
  const [form, setForm]       = useState({ title: '', artist: '', note: '' })

  useEffect(() => { $get('playlist').then(d => { setSongs(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const add = async (sec: string) => {
    if (!form.title.trim()) return
    const res = await $post('playlist-song', { section: sec, ...form, order: songs.filter(s => s.section === sec).length })
    setSongs(p => [...p, res]); setForm({ title: '', artist: '', note: '' }); setAdding(null)
  }

  const del = async (id: string) => {
    await $del('playlist-song', id); setSongs(p => p.filter(s => s.id !== id))
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>

  return (
    <div>
      <PageHeader title="Playlist" sub={`${songs.length} songs`} />

      <div className="space-y-4">
        {Object.entries(SECS).map(([sec, label]) => {
          const ss             = songs.filter(s => s.section === sec)
          const [bg, color]    = COLORS[sec] || ['#f5f5f4', '#78716c']
          return (
            <div key={sec} className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#202e1f]" style={{ background: bg }}>
                <div className="flex items-center gap-2">
                  <Music size={16} style={{ color }} />
                  <h3 className="font-medium text-sm" style={{ color }}>{label}</h3>
                  <span className="text-xs opacity-60" style={{ color }}>({ss.length})</span>
                </div>
                <button onClick={() => setAdding(adding === sec ? null : sec)}
                  className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                  style={{ background: color + '22', color }}>
                  <Plus size={12} />Add
                </button>
              </div>
              <div className="p-2">
                {adding === sec && (
                  <div className="flex gap-2 p-2 bg-black/10 rounded-xl mb-2">
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && add(sec)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-[#2a3829] text-sm focus:outline-none focus:border-[var(--sage)] bg-[var(--bg3)] text-[var(--title)]"
                      placeholder="Song title" autoFocus />
                    <input value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                      className="w-32 px-2 py-1.5 rounded-lg border border-[#2a3829] text-sm focus:outline-none focus:border-[var(--sage)] bg-[var(--bg3)] text-[var(--title)]"
                      placeholder="Artist" />
                    <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#2a3829] text-sm focus:outline-none focus:border-[var(--sage)] bg-[var(--bg3)] text-[var(--title)]"
                      placeholder="Note" />
                    <button onClick={() => add(sec)} className="px-3 py-1.5 rounded-lg text-white text-sm font-medium" style={{ background: 'var(--accent)' }}>Add</button>
                    <button onClick={() => setAdding(null)} className="text-[var(--body)]"><X size={16} /></button>
                  </div>
                )}
                {ss.length === 0 && adding !== sec
                  ? <p className="text-xs text-[#3a5038] px-4 py-2">No songs yet</p>
                  : ss.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/10 group">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#e8f0e6]">{s.title}</p>
                        <p className="text-xs text-[var(--body)]">{s.artist}{s.note ? `  ${s.note}` : ''}</p>
                      </div>
                      <button onClick={() => del(s.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={15} /></button>
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
