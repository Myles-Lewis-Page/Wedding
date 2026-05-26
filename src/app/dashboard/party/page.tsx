'use client'
import { useState } from 'react'
import { Plus, X, Trash2, Phone, Mail } from 'lucide-react'

interface PartyMember { id: string; name: string; role: string; side: 'bride' | 'groom'; phone: string; email: string; attire: string; notes: string }

const BRIDE_ROLES = ['Maid of Honor','Bridesmaid','Flower Girl','Ring Bearer','Junior Bridesmaid']
const GROOM_ROLES = ['Best Man','Groomsman','Usher','Ring Bearer','Flower Girl']

export default function PartyPage() {
  const [members, setMembers] = useState<PartyMember[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<{ name: string; role: string; side: 'bride'|'groom'; phone: string; email: string; attire: string; notes: string }>({ name: '', role: 'Bridesmaid', side: 'bride', phone: '', email: '', attire: '', notes: '' })

  const add = () => {
    if (!form.name.trim()) return
    setMembers(p => [...p, { id: Date.now().toString(), ...form }])
    setForm({ name: '', role: 'Bridesmaid', side: 'bride', phone: '', email: '', attire: '', notes: '' })
    setShowAdd(false)
  }
  const remove = (id: string) => setMembers(p => p.filter(m => m.id !== id))

  const bride = members.filter(m => m.side === 'bride')
  const groom = members.filter(m => m.side === 'groom')

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Wedding party</h1>
          <p className="text-sm text-stone-400 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Add member
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[{ label: "Bride's side", side: 'bride', list: bride, roles: BRIDE_ROLES }, { label: "Groom's side", side: 'groom', list: groom, roles: GROOM_ROLES }].map(({ label, list }) => (
          <div key={label}>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-light text-stone-700 mb-3">{label}</h2>
            <div className="space-y-2">
              {list.length === 0 ? <div className="text-center py-8 text-stone-300 text-sm border-2 border-dashed border-stone-200 rounded-2xl">No members yet</div> :
                list.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl border border-stone-200 p-4 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EDF4EA] flex items-center justify-center text-sm font-medium text-[#4A6B3E]">
                          {m.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800 text-sm">{m.name}</p>
                          <p className="text-xs text-[#7A9C6E]">{m.role}</p>
                        </div>
                      </div>
                      <button onClick={() => remove(m.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-3">
                      {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><Phone size={11} />{m.phone}</a>}
                      {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#7A9C6E]"><Mail size={11} />{m.email}</a>}
                    </div>
                    {m.attire && <p className="text-xs text-stone-400 mt-1.5">Attire: {m.attire}</p>}
                    {m.notes && <p className="text-xs text-stone-400 mt-0.5 italic">{m.notes}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add party member</h2>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-stone-400" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-xs font-medium text-stone-500 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" autoFocus /></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Side</label>
                <select value={form.side} onChange={e => setForm(f => ({...f, side: e.target.value as 'bride'|'groom', role: e.target.value === 'bride' ? 'Bridesmaid' : 'Groomsman'}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
                  <option value="bride">Bride&apos;s side</option><option value="groom">Groom&apos;s side</option>
                </select></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
                  {(form.side === 'bride' ? BRIDE_ROLES : GROOM_ROLES).map(r => <option key={r}>{r}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
              <div className="col-span-2"><label className="block text-xs font-medium text-stone-500 mb-1">Attire details</label>
                <input value={form.attire} onChange={e => setForm(f => ({...f, attire: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="e.g. Sage green chiffon, floor length" /></div>
              <div className="col-span-2"><label className="block text-xs font-medium text-stone-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" /></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
              <button onClick={add} disabled={!form.name.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                <Plus size={14} /> Add member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
