'use client'
import { useState } from 'react'
import { Plus, Check, X, Trash2 } from 'lucide-react'
interface Shot { id: string; group: string; description: string; must_have: boolean; completed: boolean }
const GROUPS = ['Couples','Ceremony','Family - Bride','Family - Groom','Wedding party','Details','Reception','Getting ready']
export default function PhotoshootPage() {
  const [shots, setShots] = useState<Shot[]>([
    { id: '1', group: 'Couples', description: 'First look reveal', must_have: true, completed: false },
    { id: '2', group: 'Ceremony', description: 'Bride walking down the aisle', must_have: true, completed: false },
    { id: '3', group: 'Ceremony', description: 'First kiss', must_have: true, completed: false },
    { id: '4', group: 'Family - Bride', description: 'Bride with both parents', must_have: true, completed: false },
    { id: '5', group: 'Family - Groom', description: 'Groom with both parents', must_have: true, completed: false },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ group: 'Couples', description: '', must_have: false })
  const add = () => { if (!form.description.trim()) return; setShots(p => [...p, { id: Date.now().toString(), ...form, completed: false }]); setForm({ group: 'Couples', description: '', must_have: false }); setShowAdd(false) }
  const toggle = (id: string) => setShots(p => p.map(s => s.id === id ? { ...s, completed: !s.completed } : s))
  const remove = (id: string) => setShots(p => p.filter(s => s.id !== id))
  const done = shots.filter(s => s.completed).length
  const grouped = GROUPS.map(g => ({ group: g, shots: shots.filter(s => s.group === g) })).filter(g => g.shots.length > 0)
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div><h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Photoshoot</h1>
          <p className="text-sm text-stone-400 mt-0.5">{done}/{shots.length} shots done · {shots.filter(s => s.must_have).length} must-haves</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}><Plus size={14} /> Add shot</button>
      </div>
      <div className="space-y-5">
        {grouped.map(({ group, shots: gs }) => (
          <div key={group} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
              <h3 className="font-medium text-stone-700 text-sm">{group}</h3>
              <span className="text-xs text-stone-400">{gs.filter(s => s.completed).length}/{gs.length}</span>
            </div>
            <div className="p-2">
              {gs.map(s => (
                <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-stone-50 ${s.completed ? 'opacity-60' : ''}`}>
                  <button onClick={() => toggle(s.id)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${s.completed ? 'border-[#7A9C6E] bg-[#7A9C6E]' : 'border-stone-300'}`}>{s.completed && <Check size={11} className="text-white" />}</button>
                  <span className={`text-sm flex-1 ${s.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>{s.description}</span>
                  {s.must_have && <span className="text-xs px-2 py-0.5 bg-[#EDF4EA] text-[#4A6B3E] rounded-full">Must have</span>}
                  <button onClick={() => remove(s.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between mb-4"><h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add photo shot</h2><button onClick={() => setShowAdd(false)}><X size={18} className="text-stone-400" /></button></div>
            <div className="space-y-3">
              <select value={form.group} onChange={e => setForm(f => ({...f, group: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">{GROUPS.map(g => <option key={g}>{g}</option>)}</select>
              <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Describe the shot *" autoFocus />
              <label className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => setForm(f => ({...f, must_have: !f.must_have}))} className={`w-10 h-6 rounded-full transition-colors ${form.must_have ? 'bg-[#7A9C6E]' : 'bg-stone-200'}`}><div className={`w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${form.must_have ? 'translate-x-4' : ''}`} /></button>
                <span className="text-sm text-stone-600">Must-have shot</span>
              </label>
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
