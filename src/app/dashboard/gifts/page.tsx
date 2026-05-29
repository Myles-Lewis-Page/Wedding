'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Check, Edit3 } from 'lucide-react'
import { Modal, Field, Input, Btn, PageHeader, Card } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface Gift { id: string; fromName: string; description: string; value: number | null; thankYouSent: boolean }
interface Guest { id: string; name: string; email: string | null; side: string; isInvitee: boolean }

export default function GiftsPage() {
  const [gifts, setGifts]         = useState<Gift[]>([])
  const [guests, setGuests]       = useState<Guest[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [editTarget, setEditTarget] = useState<Gift | null>(null)
  const [selectedGuests, setSelected] = useState<string[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [descForm, setDescForm]   = useState('')
  const [editForm, setEditForm]   = useState({ fromName: '', description: '', value: '' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    Promise.all([$get('gifts'), $get('guests')]).then(([g, gs]) => {
      setGifts(Array.isArray(g) ? g : [])
      setGuests(Array.isArray(gs) ? gs : [])
      setLoading(false)
    })
  }, [])

  const filteredGuests = guests.filter(g =>
    g.isInvitee && (g.name.toLowerCase().includes(guestSearch.toLowerCase()) || g.email?.toLowerCase().includes(guestSearch.toLowerCase()))
  )

  const toggleGuest = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const add = async () => {
    if (selectedGuests.length === 0) return
    setSaving(true)
    const names = selectedGuests.map(id => guests.find(g => g.id === id)?.name || 'Unknown').join(' & ')
    const res   = await $post('gift', { fromName: names, description: descForm, value: null })
    setGifts(p => [res, ...p])
    setDescForm(''); setSelected([]); setGuestSearch(''); setShowAdd(false); setSaving(false)
  }

  const saveEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    const res = await $patch('gift', { id: editTarget.id, fromName: editForm.fromName, description: editForm.description, value: parseFloat(editForm.value) || null })
    setGifts(p => p.map(g => g.id === res.id ? res : g)); setEditTarget(null); setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this gift?')) return
    await $del('gift', id); setGifts(p => p.filter(g => g.id !== id))
  }

  const toggle = async (id: string, sent: boolean) => {
    setGifts(p => p.map(g => g.id === id ? { ...g, thankYouSent: !sent } : g))
    await $patch('gift', { id, thankYouSent: !sent })
  }

  const pending = gifts.filter(g => !g.thankYouSent).length

  return (
    <div>
      <PageHeader
        title="Gifts & thank yous"
        sub={`${gifts.length} gifts  ${pending} thank you${pending !== 1 ? 's' : ''} to send`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Log gift</Btn>}
      />

      <div className="grid grid-cols-2 gap-6 mb-6">
        {[{ label: 'Total gifts', val: String(gifts.length) }, { label: 'Thank yous pending', val: String(pending) }].map(({ label, val }) => (
          <Card key={label} style={{ textAlign: 'center' }}>
            <p className="text-3xl font-light text-[var(--title)]" style={{ fontFamily: 'var(--font-display)' }}>{val}</p>
            <p className="text-xs font-bold text-[var(--subheader)] uppercase tracking-wider mt-2">{label}</p>
          </Card>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] overflow-hidden">
            {gifts.length === 0
              ? <div className="text-center py-14 text-[var(--body)]">No gifts logged yet</div>
              : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/20 bg-black/20 text-left text-xs text-[var(--subheader)] uppercase tracking-wider font-bold">
                      {['From', 'Gift', 'Thank you', ''].map(h => <th key={h} className="px-6 py-3 font-bold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {gifts.map(g => (
                      <tr key={g.id} className="border-b border-black/10 last:border-0 hover:bg-black/10 group">
                        <td className="px-6 py-3 font-semibold text-[var(--title)]">{g.fromName}</td>
                        <td className="px-6 py-3 text-[var(--body)]">{g.description || ''}</td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => toggle(g.id, g.thankYouSent)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${g.thankYouSent ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400 hover:bg-amber-900'}`}
                          >
                            {g.thankYouSent ? <><Check size={11} />Sent</> : 'Mark sent'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => { setEditTarget(g); setEditForm({ fromName: g.fromName, description: g.description, value: g.value ? String(g.value) : '' }) }} className="text-[var(--body)] hover:text-[var(--sage)] transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => del(g.id)} className="text-[var(--body)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Log a gift"
          onClose={() => { setShowAdd(false); setSelected([]); setGuestSearch('') }}
          footer={<><Btn variant="ghost" onClick={() => { setShowAdd(false); setSelected([]); setGuestSearch('') }}>Cancel</Btn><Btn onClick={add} disabled={saving || selectedGuests.length === 0}>{saving ? <><Loader2 size={17} className="animate-spin" />Saving</> : <><Plus size={17} />Save</>}</Btn></>}
        >
          <Field label={`Select guests (${selectedGuests.length} selected)`}>
            <div className="space-y-2">
              <Input placeholder="Search guests" value={guestSearch} onChange={e => setGuestSearch(e.target.value)} autoFocus />
              <div className="max-h-52 overflow-y-auto rounded-xl border border-[#2a3829] divide-y divide-[#2a3829]">
                {filteredGuests.length === 0
                  ? <p className="text-xs text-[var(--body)] text-center py-4">No guests found</p>
                  : filteredGuests.map(g => {
                    const sel = selectedGuests.includes(g.id)
                    return (
                      <button key={g.id} type="button" onClick={() => toggleGuest(g.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/20 transition-colors"
                        style={{ background: sel ? 'var(--accent)22' : 'transparent' }}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${sel ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[#2a3829]'}`}>
                          {sel && <Check size={11} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--title)] truncate">{g.name}</p>
                          {g.email && <p className="text-xs text-[var(--body)] truncate">{g.email}</p>}
                        </div>
                        <span className="text-xs text-[var(--body)] capitalize shrink-0">{g.side}</span>
                      </button>
                    )
                  })}
              </div>
              {selectedGuests.length > 0 && (
                <p className="text-xs text-[var(--sage)]">Selected: {selectedGuests.map(id => guests.find(g => g.id === id)?.name).filter(Boolean).join(', ')}</p>
              )}
            </div>
          </Field>
          <Field label="Gift description (optional)">
            <Input value={descForm} onChange={e => setDescForm(e.target.value)} placeholder="KitchenAid stand mixer, cash, etc." />
          </Field>
        </Modal>
      )}

      {editTarget && (
        <Modal
          title="Edit gift"
          onClose={() => setEditTarget(null)}
          footer={<><Btn variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Btn><Btn onClick={saveEdit} disabled={saving}>{saving ? <><Loader2 size={17} className="animate-spin" />Saving</> : <><Check size={17} />Save</>}</Btn></>}
        >
          <Field label="From"><Input value={editForm.fromName} onChange={e => setEditForm(f => ({ ...f, fromName: e.target.value }))} autoFocus /></Field>
          <Field label="Description"><Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <Field label="Value ($)"><Input type="number" value={editForm.value} onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))} /></Field>
        </Modal>
      )}
    </div>
  )
}
