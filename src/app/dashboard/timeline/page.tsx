'use client'
import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface TimelineItem { id: string; time: string; title: string; description: string; who: string }

const DEFAULT: TimelineItem[] = [
  { id: '1', time: '12:00 PM', title: 'Hair & makeup begins', description: 'Bridal party gets ready at the venue', who: 'Bride + party' },
  { id: '2', time: '2:00 PM', title: 'First look photos', description: 'Private moment with photographer', who: 'Couple' },
  { id: '3', time: '3:00 PM', title: 'Wedding party photos', description: 'Portraits with bridesmaids & groomsmen', who: 'Wedding party' },
  { id: '4', time: '3:30 PM', title: 'Guests arrive', description: 'Ushers guide guests to ceremony seats', who: 'Ushers' },
  { id: '5', time: '4:00 PM', title: 'Ceremony begins', description: 'Processional starts', who: 'Everyone' },
  { id: '6', time: '4:45 PM', title: 'Cocktail hour', description: 'Couple does family portraits while guests enjoy cocktails', who: 'Guests + families' },
  { id: '7', time: '6:00 PM', title: 'Reception doors open', description: 'Guests find their seats', who: 'Everyone' },
  { id: '8', time: '6:20 PM', title: 'Grand entrance & first dance', description: 'Wedding party introductions, couple first dance', who: 'Couple' },
  { id: '9', time: '6:45 PM', title: 'Toasts', description: 'Best man and maid of honor speeches', who: 'Best man, MOH' },
  { id: '10', time: '7:00 PM', title: 'Dinner service begins', description: 'Catering team starts serving', who: 'Catering' },
  { id: '11', time: '8:00 PM', title: 'Father-daughter & mother-son dances', description: '', who: 'Families' },
  { id: '12', time: '8:30 PM', title: 'Dancing opens', description: 'DJ opens floor to all guests', who: 'Everyone' },
  { id: '13', time: '9:00 PM', title: 'Cake cutting', description: '', who: 'Couple' },
  { id: '14', time: '11:30 PM', title: 'Last dance & send-off', description: 'Sparkler send-off', who: 'Everyone' },
]

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>(DEFAULT)
  const [editing, setEditing] = useState<string | null>(null)

  const add = () => {
    const id = Date.now().toString()
    setItems(prev => [...prev, { id, time: '', title: 'New event', description: '', who: '' }])
    setEditing(id)
  }
  const update = (id: string, field: keyof TimelineItem, val: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Day-of timeline</h1>
          <p className="text-sm text-stone-400 mt-0.5">Build your hour-by-hour schedule to share with vendors</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-3 py-2 rounded-xl text-sm border border-stone-200 text-stone-600 hover:bg-stone-50">Print / PDF</button>
          <button onClick={add} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
            <Plus size={14} /> Add event
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-[76px] top-0 bottom-0 w-px bg-stone-200" />
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className={`flex gap-4 group ${editing === item.id ? 'items-start' : 'items-center'}`}>
              {/* Time */}
              <div className="w-16 text-right flex-shrink-0">
                {editing === item.id
                  ? <input value={item.time} onChange={e => update(item.id, 'time', e.target.value)} className="w-full text-right text-xs font-medium border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#7A9C6E] bg-white" placeholder="4:00 PM" />
                  : <span className="text-xs font-medium text-stone-500">{item.time || '—'}</span>}
              </div>
              {/* Dot */}
              <div className="w-3 h-3 rounded-full bg-[#7A9C6E] border-2 border-white shadow flex-shrink-0 relative z-10 mt-0.5" />
              {/* Content */}
              <div className={`flex-1 bg-white rounded-xl border border-stone-200 p-3.5 cursor-pointer hover:border-stone-300 transition-colors ${editing === item.id ? 'border-[#7A9C6E]' : ''}`}
                onClick={() => setEditing(editing === item.id ? null : item.id)}>
                {editing === item.id ? (
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} className="w-full font-medium text-sm border-0 focus:outline-none" placeholder="Event name" autoFocus />
                    <input value={item.description} onChange={e => update(item.id, 'description', e.target.value)} className="w-full text-xs text-stone-500 border-0 focus:outline-none" placeholder="Description (optional)" />
                    <input value={item.who} onChange={e => update(item.id, 'who', e.target.value)} className="w-full text-xs text-[#7A9C6E] border-0 focus:outline-none" placeholder="Who's involved" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setEditing(null)} className="text-xs px-3 py-1 rounded-lg bg-[#7A9C6E] text-white">Done</button>
                      <button onClick={() => remove(item.id)} className="text-xs px-3 py-1 rounded-lg text-red-400 border border-red-200 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{item.title}</p>
                      {item.description && <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>}
                      {item.who && <p className="text-xs text-[#7A9C6E] mt-0.5">{item.who}</p>}
                    </div>
                    <span className="text-xs text-stone-300 opacity-0 group-hover:opacity-100 ml-2">click to edit</span>
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
