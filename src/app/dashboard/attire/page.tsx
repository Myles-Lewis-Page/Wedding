'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface AttireItem { id: string; person: string; item: string; shop: string; status: string; notes: string }

const STATUSES = ['Shopping','Ordered','In alterations','Fitting 1','Fitting 2','Ready','Picked up']
const PEOPLE   = ['Bride','Groom','Maid of Honor','Bridesmaid','Best Man','Groomsman','Flower Girl']

export default function AttirePage() {
  const [items, setItems]     = useState<AttireItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ person: 'Bride', item: '', shop: '', notes: '' })

  useEffect(() => { $get('attire').then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const add = async () => {
    if (!form.item.trim()) return
    const res = await $post('attire-item', { ...form, status: 'Shopping', order: items.length })
    setItems(p => [...p, res]); setShowAdd(false)
    setForm({ person: 'Bride', item: '', shop: '', notes: '' })
  }

  const upd = async (id: string, field: string, val: string) => {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i))
    await $patch('attire-item', { id, [field]: val })
  }

  const del = async (id: string) => {
    await $del('attire-item', id); setItems(p => p.filter(i => i.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Attire"
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add item</Btn>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-black/20 bg-black/20 text-left text-xs text-[var(--subheader)] uppercase tracking-wider font-bold">
                  {['Person', 'Item', 'Shop', 'Status', 'Notes', ''].map(h => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={6} className="text-center py-10 text-[var(--body)]">No attire items yet</td></tr>
                  : items.map(i => (
                    <tr key={i.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#1a2419] group">
                      <td className="px-5 py-3 text-sm font-medium text-[#a8c4a4]">{i.person}</td>
                      <td className="px-5 py-3 font-medium text-[#e8f0e6]">{i.item}</td>
                      <td className="px-5 py-3">
                        <input value={i.shop} onChange={e => upd(i.id, 'shop', e.target.value)}
                          className="w-full bg-transparent border-0 focus:outline-none text-sm"
                          style={{ color: 'var(--body)' }} placeholder="Add shop…" />
                      </td>
                      <td className="px-5 py-3">
                        <select value={i.status} onChange={e => upd(i.id, 'status', e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none ${i.status === 'Ready' || i.status === 'Picked up' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <input value={i.notes} onChange={e => upd(i.id, 'notes', e.target.value)}
                          className="w-full bg-transparent border-0 focus:outline-none text-sm"
                          style={{ color: 'var(--body)' }} placeholder="Notes…" />
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => del(i.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add attire item"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.item.trim()}><Plus size={17} />Add</Btn></>}
        >
          <Field label="Person"><Select value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))}>{PEOPLE.map(p => <option key={p}>{p}</option>)}</Select></Field>
          <Field label="Item *"><Input value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} placeholder="Wedding gown, Suit…" autoFocus /></Field>
          <Field label="Shop / Designer"><Input value={form.shop} onChange={e => setForm(f => ({ ...f, shop: e.target.value }))} /></Field>
          <Field label="Notes"><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></Field>
        </Modal>
      )}
    </div>
  )
}
