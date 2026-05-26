'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, ExternalLink, Phone, Mail } from 'lucide-react'
import { Vendor } from '@/types'
import { formatCurrency } from '@/lib/utils'

const CATEGORIES = ['Venue','Catering','Photography','Videography','Flowers','Music / DJ','Hair & Makeup','Officiant','Cake','Transportation','Stationery','Lighting','Photo Booth','Other']
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  researching: { label: 'Researching', cls: 'bg-stone-100 text-stone-500' },
  contacted: { label: 'Contacted', cls: 'bg-blue-50 text-blue-600' },
  booked: { label: 'Booked', cls: 'bg-amber-50 text-amber-600' },
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700' },
}

function AddVendorModal({ onClose, onSave }: { onClose: () => void; onSave: (v: Vendor) => void }) {
  const [form, setForm] = useState({ name: '', category: 'Photography', contact_name: '', phone: '', email: '', website: '', cost: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await fetch('/api/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, cost: parseFloat(form.cost) || 0, paid: 0, status: 'researching' }) })
    onSave(await res.json())
    setSaving(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add vendor</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="block text-xs font-medium text-stone-500 mb-1">Vendor name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="ABC Photography" autoFocus /></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Contact name</label>
            <input value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Website</label>
            <input value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="https://..." /></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Total cost ($)</label>
            <input type="number" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="0" /></div>
          <div className="col-span-2"><label className="block text-xs font-medium text-stone-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
          <button onClick={save} disabled={saving || !form.name.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add vendor
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('All')

  useEffect(() => { fetch('/api/vendors').then(r => r.json()).then(d => { setVendors(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const updateStatus = async (id: string, status: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: status as Vendor['status'] } : v))
    await fetch(`/api/vendors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }
  const deleteVendor = async (id: string) => {
    if (!confirm('Delete vendor?')) return
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' })
    setVendors(prev => prev.filter(v => v.id !== id))
  }

  const cats = ['All', ...Array.from(new Set(vendors.map(v => v.category)))]
  const filtered = filter === 'All' ? vendors : vendors.filter(v => v.category === filter)

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Vendors</h1>
          <p className="text-sm text-stone-400 mt-0.5">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} · {vendors.filter(v => v.status === 'booked' || v.status === 'paid').length} booked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Add vendor
        </button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === c ? 'bg-[#7A9C6E] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{c}</button>)}
      </div>

      {loading ? <div className="flex items-center justify-center h-32 text-stone-400"><Loader2 size={22} className="animate-spin" /></div> : (
        <div className="grid gap-3">
          {filtered.length === 0 ? <div className="text-center py-16 text-stone-400">No vendors yet</div> : filtered.map(v => {
            const st = STATUS_CONFIG[v.status]
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-start gap-4 hover:border-stone-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-stone-800">{v.name}</p>
                    <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{v.category}</span>
                  </div>
                  {v.contact_name && <p className="text-xs text-stone-400 mb-1">{v.contact_name}</p>}
                  <div className="flex items-center gap-3 flex-wrap">
                    {v.phone && <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#7A9C6E]"><Phone size={11} /> {v.phone}</a>}
                    {v.email && <a href={`mailto:${v.email}`} className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#7A9C6E]"><Mail size={11} /> {v.email}</a>}
                    {v.website && <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#7A9C6E]"><ExternalLink size={11} /> Website</a>}
                  </div>
                  {v.notes && <p className="text-xs text-stone-400 mt-1.5 italic">{v.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-sm font-medium text-stone-700">{formatCurrency(v.cost)}</p>
                  <select value={v.status} onChange={e => updateStatus(v.id, e.target.value)} className={`text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none ${st.cls}`}>
                    {Object.entries(STATUS_CONFIG).map(([k, sc]) => <option key={k} value={k}>{sc.label}</option>)}
                  </select>
                  <button onClick={() => deleteVendor(v.id)} className="text-stone-300 hover:text-red-400 transition-colors mt-1"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} onSave={v => { setVendors(p => [v, ...p]); setShowAdd(false) }} />}
    </div>
  )
}
