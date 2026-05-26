'use client'
import { useState, useEffect } from 'react'
import { Plus, Check, X, Loader2, Gift } from 'lucide-react'

interface GiftItem { id: string; from_name: string; description: string; value: number | null; thank_you_sent: boolean; received_at: string | null }

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ from_name: '', description: '', value: '', received_at: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/gifts').then(r => r.json()).then(d => { setGifts(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const addGift = async () => {
    if (!form.from_name.trim()) return
    setSaving(true)
    const res = await fetch('/api/gifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, value: parseFloat(form.value) || null, thank_you_sent: false, received_at: form.received_at || null }) })
    const newGift = await res.json()
    setGifts(p => [newGift, ...p])
    setForm({ from_name: '', description: '', value: '', received_at: '' })
    setShowAdd(false)
    setSaving(false)
  }

  const toggleThankYou = async (id: string, sent: boolean) => {
    setGifts(prev => prev.map(g => g.id === id ? { ...g, thank_you_sent: !sent } : g))
    await fetch(`/api/gifts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thank_you_sent: !sent }) })
  }

  const pending = gifts.filter(g => !g.thank_you_sent).length
  const totalValue = gifts.reduce((s, g) => s + (g.value || 0), 0)

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Gifts & thank yous</h1>
          <p className="text-sm text-stone-400 mt-0.5">{gifts.length} gifts · {pending} thank you{pending !== 1 ? 's' : ''} to send</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Log gift
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-medium text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>{gifts.length}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total gifts</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-medium text-red-400" style={{ fontFamily: 'var(--font-display)' }}>{pending}</p>
          <p className="text-xs text-stone-400 mt-0.5">Thank yous pending</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-medium text-[#4A6B3E]" style={{ fontFamily: 'var(--font-display)' }}>${totalValue.toLocaleString()}</p>
          <p className="text-xs text-stone-400 mt-0.5">Estimated total value</p>
        </div>
      </div>

      {loading ? <div className="flex items-center justify-center h-32 text-stone-400"><Loader2 size={22} className="animate-spin" /></div> : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {gifts.length === 0 ? <div className="text-center py-16 text-stone-400 text-sm flex flex-col items-center gap-3"><Gift size={32} className="text-stone-300" />No gifts logged yet</div> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">From</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Gift</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Thank you</th>
              </tr></thead>
              <tbody>
                {gifts.map(g => (
                  <tr key={g.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-800">{g.from_name}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{g.description || '—'}</td>
                    <td className="px-4 py-3 text-stone-700">{g.value ? `$${g.value.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleThankYou(g.id, g.thank_you_sent)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${g.thank_you_sent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                        {g.thank_you_sent ? <><Check size={11} /> Sent</> : 'Mark sent'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Log a gift</h2>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div><label className="block text-xs font-medium text-stone-500 mb-1">From *</label>
                <input value={form.from_name} onChange={e => setForm(f => ({...f, from_name: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="John & Jane Smith" autoFocus /></div>
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="KitchenAid stand mixer" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-stone-500 mb-1">Estimated value ($)</label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
                <div><label className="block text-xs font-medium text-stone-500 mb-1">Received date</label>
                  <input type="date" value={form.received_at} onChange={e => setForm(f => ({...f, received_at: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
              <button onClick={addGift} disabled={saving || !form.from_name.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
