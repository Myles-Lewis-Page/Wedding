'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Check } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface DecorItem { id: string; area: string; desc: string; vendor: string; cost: number; done: boolean }

const AREAS = ['Ceremony arch','Aisle','Head table','Guest tables','Cocktail hour','Entrance','Cake table','Outdoor','Lighting','Other']

export default function DecorPage() {
  const [items, setItems]     = useState<DecorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ area: 'Guest tables', desc: '', vendor: '', cost: '' })

  useEffect(() => { $get('decor').then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const add = async () => {
    if (!form.desc.trim()) return
    const res = await $post('decor-item', { ...form, cost: parseFloat(form.cost) || 0 })
    setItems(p => [...p, res]); setShowAdd(false)
    setForm({ area: 'Guest tables', desc: '', vendor: '', cost: '' })
  }

  const toggle = async (item: DecorItem) => {
    setItems(p => p.map(i => i.id === item.id ? { ...i, done: !item.done } : i))
    await $patch('decor-item', { id: item.id, done: !item.done })
  }

  const del = async (id: string) => {
    await $del('decor-item', id); setItems(p => p.filter(i => i.id !== id))
  }

  const ordered = items.filter(i => i.done).length

  return (
    <div>
      <PageHeader
        title="Décor"
        sub={`${ordered}/${items.length} ordered`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add item</Btn>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="space-y-2">
            {items.length === 0
              ? <div className="text-center py-16 text-[var(--body)]">Track florals, centrepieces, lighting and décor items here</div>
              : items.map(item => (
                <div key={item.id} className={`rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] p-3.5 flex items-center gap-4 group ${item.done ? 'opacity-60' : ''}`}>
                  <button
                    onClick={() => toggle(item)}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${item.done ? 'border-[var(--sage)] bg-[var(--accent)]' : 'border-[#5a7057]'}`}
                  >
                    {item.done && <Check size={11} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${item.done ? 'line-through text-[#5a7057]' : 'text-[#e8f0e6]'}`}>{item.desc}</p>
                    <p className="text-xs text-[var(--body)]">{item.area}{item.vendor ? ` · ${item.vendor}` : ''}{item.cost ? ` · $${item.cost}` : ''}</p>
                  </div>
                  <button onClick={() => del(item.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={15} /></button>
                </div>
              ))}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add décor item"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.desc.trim()}><Plus size={17} />Add</Btn></>}
        >
          <Field label="Area"><Select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>{AREAS.map(a => <option key={a}>{a}</option>)}</Select></Field>
          <Field label="Description *"><Input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="e.g. Eucalyptus centrepieces" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vendor"><Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} /></Field>
            <Field label="Cost ($)"><Input value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} type="number" /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
