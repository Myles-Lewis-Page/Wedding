'use client'
import { useState } from 'react'
import { Plus, Check, Trash2, X } from 'lucide-react'
interface DecorItem { id: string; area: string; description: string; vendor: string; cost: string; ordered: boolean }
const AREAS = ['Ceremony arch','Ceremony aisle','Head table','Guest tables','Cocktail hour','Entrance','Cake table','Outdoor','Lighting','Other']
export default function DecorPage() {
  const [items, setItems] = useState<DecorItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ area: 'Guest tables', description: '', vendor: '', cost: '' })
  const add = () => { if (!form.description.trim()) return; setItems(p => [...p, { id: Date.now().toString(), ...form, ordered: false }]); setForm({ area: 'Guest tables', description: '', vendor: '', cost: '' }); setShowAdd(false) }
  const toggle = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, ordered: !i.ordered } : i))
  const remove = (id: string) => setItems(p => p.filter(i => i.id !== id))
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Décor planner</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}><Plus size={14} /> Add item</button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <div className="text-center py-16 text-stone-400 text-sm">Track flowers, centrepieces, lighting and all décor items here</div> :
          items.map(i => (
            <div key={i.id} className={`bg-white rounded-xl border border-stone-200 p-3.5 flex items-center gap-3 group ${i.ordered ? 'opacity-70' : ''}`}>
              <button onClick={() => toggle(i.id)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${i.ordered ? 'border-[#7A9C6E] bg-[#7A9C6E]' : 'border-stone-300'}`}>{i.ordered && <Check size={11} className="text-white" />}</button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${i.ordered ? 'line-through text-stone-400' : 'text-stone-800'}`}>{i.description}</p>
                <p className="text-xs text-stone-400">{i.area}{i.vendor ? ` · ${i.vendor}` : ''}{i.cost ? ` · $${i.cost}` : ''}</p>
              </div>
              <button onClick={() => remove(i.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          ))}
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between mb-4"><h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add décor item</h2><button onClick={() => setShowAdd(false)}><X size={18} className="text-stone-400" /></button></div>
            <div className="space-y-3">
              <select value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">{AREAS.map(a => <option key={a}>{a}</option>)}</select>
              <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Description *" autoFocus />
              <input value={form.vendor} onChange={e => setForm(f => ({...f, vendor: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Vendor" />
              <input value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Estimated cost ($)" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
              <button onClick={add} disabled={!form.description.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}><Plus size={14} /> Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
