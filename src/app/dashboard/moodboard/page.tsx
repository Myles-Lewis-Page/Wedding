'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, PageHeader } from '@/components/ui'

interface MoodItem { id: string; label: string; imageUrl: string; category: string }

const CATS = ['Color palette','Venue','Florals','Tablescape','Dress','Invitations','Décor','Cake','Hair & makeup']

export default function MoodboardPage() {
  const [items, setItems]   = useState<MoodItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]     = useState({ imageUrl: '', label: '', category: 'Florals' })

  const add = () => {
    if (!form.imageUrl.trim()) return
    setItems(p => [...p, { id: Date.now().toString(), ...form }])
    setForm({ imageUrl: '', label: '', category: 'Florals' }); setShowAdd(false)
  }

  return (
    <div>
      <PageHeader
        title="Mood board"
        sub="Pin anything that inspires your vision"
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add image</Btn>}
      />

      {items.length === 0
        ? (
          <div className="text-center py-20 text-[var(--body)]">
            <p className="mb-4">Paste image URLs from Pinterest, Instagram, or anywhere</p>
            <Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add first image</Btn>
          </div>
        )
        : (
          <div className="columns-2 md:columns-3 gap-6 space-y-4">
            {items.map(item => (
              <div key={item.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-[#2a3829]">
                <img src={item.imageUrl} alt={item.label} className="w-full object-cover"
                  onError={e => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23f1efe8" width="300" height="200"/><text x="150" y="105" text-anchor="middle" fill="%23aaa" font-size="14">Image not found</text></svg>' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-xs">{item.label || item.category}</span>
                  <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} className="ml-auto w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-red-500/60 transition-colors">
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add to mood board"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.imageUrl.trim()}><Plus size={17} />Add</Btn></>}
        >
          <Field label="Image URL *"><Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." autoFocus /></Field>
          <Field label="Category"><Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATS.map(c => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Label"><Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Inspiration for florals" /></Field>
          {form.imageUrl && <div className="h-32 rounded-xl overflow-hidden bg-[#1f2b1e]"><img src={form.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
        </Modal>
      )}
    </div>
  )
}
