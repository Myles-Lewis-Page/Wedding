'use client'
import { useState } from 'react'
import { Plus, X, Trash2, Image } from 'lucide-react'

interface MoodItem { id: string; label: string; image_url: string; category: string }
const CATS = ['Color palette','Venue','Florals','Tablescape','Dress & attire','Invitations','Décor','Cake','Hair & makeup','Honeymoon']

export default function MoodboardPage() {
  const [items, setItems] = useState<MoodItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ label: '', image_url: '', category: 'Florals' })

  const add = () => {
    if (!form.image_url.trim()) return
    setItems(p => [...p, { id: Date.now().toString(), ...form }])
    setForm({ label: '', image_url: '', category: 'Florals' })
    setShowAdd(false)
  }
  const remove = (id: string) => setItems(p => p.filter(i => i.id !== id))

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Mood board</h1>
          <p className="text-sm text-stone-400 mt-0.5">Pin anything that inspires your vision</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Add image
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4"><Image size={28} className="text-stone-300" /></div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-stone-500 mb-2">Your mood board is empty</h3>
          <p className="text-sm text-stone-400 mb-5">Add image URLs from Pinterest, Instagram, or anywhere online</p>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
            <Plus size={14} /> Add your first image
          </button>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {items.map(item => (
            <div key={item.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.label} className="w-full object-cover" onError={e => e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZWZlOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYThhNjlmIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-xs font-medium">{item.label || item.category}</p>
              </div>
              <button onClick={() => remove(item.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                <Trash2 size={11} />
              </button>
              {item.category && <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">{item.category}</div>}
            </div>
          ))}
          <div className="break-inside-avoid border-2 border-dashed border-stone-200 rounded-2xl h-48 flex items-center justify-center cursor-pointer hover:border-[#7A9C6E] hover:bg-[#EDF4EA]/30 transition-all" onClick={() => setShowAdd(true)}>
            <div className="text-center text-stone-400 hover:text-[#7A9C6E]"><Plus size={24} className="mx-auto mb-1" /><span className="text-xs">Add image</span></div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add to mood board</h2>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Image URL *</label>
                <input value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="https://..." autoFocus /></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
                  {CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Label (optional)</label>
                <input value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="e.g. Inspiration for florals" /></div>
              {form.image_url && <div className="rounded-xl overflow-hidden h-32 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt="" className="w-full h-full object-cover" /></div>}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
              <button onClick={add} disabled={!form.image_url.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
