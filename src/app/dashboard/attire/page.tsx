'use client'
import { useState } from 'react'
import { Plus, Check, X, Trash2 } from 'lucide-react'
interface AttireItem { id: string; person: string; item: string; shop: string; status: string; notes: string }
const STATUSES = ['Shopping','Ordered','In','Fitting 1','Fitting 2','Ready','Picked up']
export default function AttirePage() {
  const [items, setItems] = useState<AttireItem[]>([
    { id: '1', person: 'Bride', item: 'Wedding gown', shop: '', status: 'Shopping', notes: '' },
    { id: '2', person: 'Bride', item: 'Veil', shop: '', status: 'Shopping', notes: '' },
    { id: '3', person: 'Groom', item: 'Suit / tuxedo', shop: '', status: 'Shopping', notes: '' },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ person: 'Bride', item: '', shop: '', notes: '' })
  const add = () => { if (!form.item.trim()) return; setItems(p => [...p, { id: Date.now().toString(), ...form, status: 'Shopping' }]); setForm({ person: 'Bride', item: '', shop: '', notes: '' }); setShowAdd(false) }
  const update = (id: string, field: string, val: string) => setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i))
  const remove = (id: string) => setItems(p => p.filter(i => i.id !== id))
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Attire tracker</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}><Plus size={14} /> Add item</button>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-stone-100 bg-stone-50">{['Person','Item','Shop / Designer','Status','Notes'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">{h}</th>)}<th /></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 group">
                <td className="px-4 py-2.5 font-medium text-stone-700 text-xs">{i.person}</td>
                <td className="px-4 py-2.5 text-stone-700">{i.item}</td>
                <td className="px-4 py-2.5"><input value={i.shop} onChange={e => update(i.id, 'shop', e.target.value)} className="w-full bg-transparent border-0 focus:outline-none text-sm text-stone-600 focus:bg-white focus:border focus:border-stone-200 rounded px-1" placeholder="Add shop…" /></td>
                <td className="px-4 py-2.5"><select value={i.status} onChange={e => update(i.id, 'status', e.target.value)} className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none cursor-pointer ${i.status === 'Ready' || i.status === 'Picked up' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                <td className="px-4 py-2.5"><input value={i.notes} onChange={e => update(i.id, 'notes', e.target.value)} className="w-full bg-transparent border-0 focus:outline-none text-xs text-stone-400 focus:bg-white focus:border focus:border-stone-200 rounded px-1" placeholder="Notes…" /></td>
                <td className="px-4 py-2.5"><button onClick={() => remove(i.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between mb-4"><h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add attire item</h2><button onClick={() => setShowAdd(false)}><X size={18} className="text-stone-400" /></button></div>
            <div className="space-y-3">
              <select value={form.person} onChange={e => setForm(f => ({...f, person: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
                {['Bride','Groom','Maid of Honor','Bridesmaid','Best Man','Groomsman','Flower Girl','Ring Bearer'].map(p => <option key={p}>{p}</option>)}
              </select>
              <input value={form.item} onChange={e => setForm(f => ({...f, item: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Item (e.g. Wedding gown) *" autoFocus />
              <input value={form.shop} onChange={e => setForm(f => ({...f, shop: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Shop / Designer" />
              <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Notes" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
              <button onClick={add} disabled={!form.item.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}><Plus size={14} /> Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
