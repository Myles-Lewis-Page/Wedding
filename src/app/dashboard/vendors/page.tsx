'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Phone, Mail, ExternalLink } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del, fmt$ } from '@/lib/utils'

interface Vendor { id: string; name: string; category: string; contactName: string; phone: string; email: string; website: string; cost: number; paid: number; status: string; notes: string }

const VENDOR_CATS   = ['Catering','Photography','Videography','Flowers','Music / DJ','Hair & Makeup','Officiant','Cake','Transportation','Lighting','Stationery','Photo Booth','Other']
const VENDOR_STATUS: Record<string, [string, string]> = {
  researching: ['Researching', '#78716c'],
  contacted:   ['Contacted',   '#2563eb'],
  booked:      ['Booked',      '#d97706'],
  paid:        ['Paid',        '#059669'],
}

export default function VendorsPage() {
  const [vendors, setVendors]   = useState<Vendor[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [filter, setFilter]     = useState('All')
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ name: '', category: 'Photography', contactName: '', phone: '', email: '', website: '', cost: '', notes: '' })

  useEffect(() => { $get('vendors').then(d => { setVendors(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await $post('vendor', { ...form, cost: parseFloat(form.cost) || 0 })
    setVendors(p => [res, ...p]); setShowAdd(false); setSaving(false)
    setForm({ name: '', category: 'Photography', contactName: '', phone: '', email: '', website: '', cost: '', notes: '' })
  }

  const updateStatus = async (id: string, status: string) => {
    setVendors(p => p.map(v => v.id === id ? { ...v, status } : v))
    await $patch('vendor', { id, status })
  }

  const del = async (id: string) => {
    if (!confirm('Delete vendor?')) return
    await $del('vendor', id); setVendors(p => p.filter(v => v.id !== id))
  }

  const cats     = ['All', ...Array.from(new Set(vendors.map(v => v.category)))]
  const filtered = filter === 'All' ? vendors : vendors.filter(v => v.category === filter)

  return (
    <div>
      <PageHeader
        title="Vendors"
        sub={`${vendors.length} vendors · ${vendors.filter(v => v.status === 'booked' || v.status === 'paid').length} booked`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add vendor</Btn>}
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === c ? 'bg-[var(--accent)] text-white' : 'bg-[#1f2b1e] text-[#7a9878] hover:bg-[#243022]'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="space-y-3">
            {filtered.length === 0
              ? <div className="text-center py-16 text-[var(--body)]">No vendors yet</div>
              : filtered.map(v => {
                const [slabel, scolor] = VENDOR_STATUS[v.status] ?? VENDOR_STATUS.researching
                return (
                  <div key={v.id} className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] hover:border-[var(--sage)] transition-colors overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#202e1f]">
                      <div className="flex items-center gap-3 min-w-0">
                        <p className="font-semibold text-[#e8f0e6] truncate">{v.name}</p>
                        <span className="text-xs text-[var(--body)] bg-black/20 px-2.5 py-1 rounded-full shrink-0">{v.category}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <p className="font-semibold text-[var(--sage)]">{fmt$(v.cost)}</p>
                        <select value={v.status} onChange={e => updateStatus(v.id, e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-full border-0 font-semibold cursor-pointer focus:outline-none"
                          style={{ background: scolor + '22', color: scolor }}>
                          {Object.entries(VENDOR_STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                        <button onClick={() => del(v.id)} className="text-[#3a5038] hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 px-6 py-3 flex-wrap">
                      {v.contactName && <span className="text-sm text-[var(--body)]">{v.contactName}</span>}
                      {v.phone && <a href={`tel:${v.phone}`} className="flex items-center gap-1.5 text-sm text-[#5a7057] hover:text-[var(--sage)] transition-colors"><Phone size={13} />{v.phone}</a>}
                      {v.email && <a href={`mailto:${v.email}`} className="flex items-center gap-1.5 text-sm text-[#5a7057] hover:text-[var(--sage)] transition-colors"><Mail size={13} />{v.email}</a>}
                      {v.website && <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-[#5a7057] hover:text-[var(--sage)] transition-colors"><ExternalLink size={13} />Website</a>}
                      {v.notes && <span className="text-sm text-[#4a6448] italic">{v.notes}</span>}
                      {!v.contactName && !v.phone && !v.email && !v.website && !v.notes && <span className="text-sm text-[var(--body)]">No contact info</span>}
                    </div>
                  </div>
                )
              })}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add vendor"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving || !form.name.trim()}>{saving ? <><Loader2 size={17} className="animate-spin" />Saving…</> : <><Plus size={17} />Add vendor</>}</Btn></>}
        >
          <Field label="Name *"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ABC Photography" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {VENDOR_CATS.map(c => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Contact name"><Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Field>
            <Field label="Email"><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
            <Field label="Website"><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="Total cost ($)"><Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} /></Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] text-sm focus:outline-none focus:border-[var(--sage)] resize-none"
              style={{ color: 'var(--title)' }} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
