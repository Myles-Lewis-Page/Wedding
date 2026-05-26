'use client'
import { useState } from 'react'
import { Plus, Music, X, Trash2 } from 'lucide-react'

const SECTIONS = ['ceremony','cocktail','dinner','dancing','do_not_play'] as const
const LABELS: Record<string, string> = { ceremony: 'Ceremony', cocktail: 'Cocktail hour', dinner: 'Dinner', dancing: 'Reception dancing', do_not_play: 'Do not play' }
const COLORS: Record<string, string> = { ceremony: '#EDF4EA', cocktail: '#E6F1FB', dinner: '#FAEEDA', dancing: '#EEEDFE', do_not_play: '#FCEBEB' }
const TEXT_COLORS: Record<string, string> = { ceremony: '#4A6B3E', cocktail: '#185FA5', dinner: '#854F0B', dancing: '#3C3489', do_not_play: '#A32D2D' }

interface Song { id: string; section: string; song_title: string; artist: string; notes: string }

export default function PlaylistPage() {
  const [songs, setSongs] = useState<Song[]>([
    { id: '1', section: 'ceremony', song_title: 'Canon in D', artist: 'Pachelbel', notes: 'Processional' },
    { id: '2', section: 'ceremony', song_title: 'A Thousand Years', artist: 'Christina Perri', notes: 'Bride entrance' },
    { id: '3', section: 'dancing', song_title: 'Thinking Out Loud', artist: 'Ed Sheeran', notes: 'First dance' },
    { id: '4', section: 'do_not_play', song_title: 'YMCA', artist: 'Village People', notes: '' },
  ])
  const [adding, setAdding] = useState<string | null>(null)
  const [form, setForm] = useState({ song_title: '', artist: '', notes: '' })

  const add = (section: string) => {
    if (!form.song_title.trim()) return
    setSongs(p => [...p, { id: Date.now().toString(), section, ...form }])
    setForm({ song_title: '', artist: '', notes: '' })
    setAdding(null)
  }
  const remove = (id: string) => setSongs(p => p.filter(s => s.id !== id))

  return (
    <div className="p-6">
      <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800 mb-6">Playlist</h1>
      <div className="space-y-5">
        {SECTIONS.map(sec => {
          const sectionSongs = songs.filter(s => s.section === sec)
          return (
            <div key={sec} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100" style={{ background: COLORS[sec] }}>
                <div className="flex items-center gap-2">
                  <Music size={14} style={{ color: TEXT_COLORS[sec] }} />
                  <h3 className="font-medium text-sm" style={{ color: TEXT_COLORS[sec] }}>{LABELS[sec]}</h3>
                  <span className="text-xs opacity-60" style={{ color: TEXT_COLORS[sec] }}>({sectionSongs.length})</span>
                </div>
                <button onClick={() => setAdding(adding === sec ? null : sec)} className="text-xs px-2.5 py-1 rounded-full font-medium transition-all" style={{ background: TEXT_COLORS[sec] + '22', color: TEXT_COLORS[sec] }}>
                  <Plus size={12} className="inline mr-1" />Add
                </button>
              </div>
              <div className="p-2">
                {adding === sec && (
                  <div className="flex gap-2 p-2 bg-stone-50 rounded-xl mb-2">
                    <input value={form.song_title} onChange={e => setForm(f => ({...f, song_title: e.target.value}))} onKeyDown={e => e.key === 'Enter' && add(sec)} className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Song title" autoFocus />
                    <input value={form.artist} onChange={e => setForm(f => ({...f, artist: e.target.value}))} className="w-32 px-2 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Artist" />
                    <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="w-28 px-2 py-1.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Notes" />
                    <button onClick={() => add(sec)} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{ background: '#7A9C6E' }}>Add</button>
                    <button onClick={() => setAdding(null)} className="text-stone-400 hover:text-stone-600"><X size={16} /></button>
                  </div>
                )}
                {sectionSongs.length === 0 && !adding ? <p className="text-xs text-stone-300 px-3 py-2">No songs yet</p> :
                  sectionSongs.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-50 group">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-800">{s.song_title}</p>
                        <p className="text-xs text-stone-400">{s.artist}{s.notes ? ` · ${s.notes}` : ''}</p>
                      </div>
                      <button onClick={() => remove(s.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>
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
