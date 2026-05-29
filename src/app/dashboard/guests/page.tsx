'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Check, AlertCircle } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, Tag, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface Guest {
  id: string; name: string; email: string | null; side: string
  hasPlusOne: boolean; plusOneName: string | null; plusOneDietary: string | null
  dietary: string | null; rsvpStatus: string; tableId: string | null
  isInvitee: boolean; notes: string | null; address: string | null; partyRole: string | null
}

const ROLE_ICONS: Record<string, string> = {
  'Maid of Honor': '', 'Bridesmaid': '', 'Flower Girl': '',
  'Junior Bridesmaid': '', 'Best Man': '', 'Groomsman': '',
  'Usher': '', 'Ring Bearer': '', 'Officiant': '',
}

const STATUS: Record<string, [string, string]> = {
  attending: ['Attending', '#00ff00'],
  declined:  ['Declined',  '#ff0000'],
  pending:   ['Pending',   '#f0b429'],
}

export default function GuestsPage() {
  const [guests, setGuests]   = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [errMsg, setErrMsg]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ name: '', email: '', side: 'bride', hasPlusOne: false, dietary: '', address: '' })

  useEffect(() => {
    $get('guests').then(d => { setGuests(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true); setErrMsg('')
    const res = await $post('guest', form)
    if (res.error) { setErrMsg(res.error); setSaving(false); return }
    setGuests(p => [res, ...p]); setShowAdd(false); setSaving(false)
    setForm({ name: '', email: '', side: 'bride', hasPlusOne: false, dietary: '', address: '' })
  }

  const del = async (id: string) => {
    if (!confirm('Remove guest?')) return
    await $del('guest', id)
    setGuests(p => p.filter(g => g.id !== id))
  }

  const stats = {
    all:       guests.length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    declined:  guests.filter(g => g.rsvpStatus === 'declined').length,
    pending:   guests.filter(g => g.rsvpStatus === 'pending').length,
  }

  const exportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Side', 'RSVP', 'Plus One', 'Dietary', 'Address'],
      ...guests.map(g => [g.name, g.email || '', g.side, g.rsvpStatus, g.plusOneName || '', g.dietary || '', g.address || '']),
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'guests.csv'; a.click()
  }

  const invitees = guests.filter(g => g.isInvitee)
  const plusOnes = guests.filter(g => !g.isInvitee)

  const getRows = (sideFilter: string) => {
    const sideGuests = search
      ? invitees.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase()))
      : invitees.filter(g => sideFilter === 'both' ? g.side === 'both' : g.side === sideFilter)
    const filtered = filter === 'all' ? sideGuests : sideGuests.filter(g => g.rsvpStatus === filter)
    return filtered.map(g => ({
      guest: g,
      plusOne: g.plusOneName ? (plusOnes.find(p => p.name === g.plusOneName) ?? null) : null,
    }))
  }

  const GuestTable = ({ title, rows }: { title: string; rows: { guest: Guest; plusOne: Guest | null }[] }) => (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-[var(--subheader)] uppercase tracking-wider mb-3">{title} ({rows.length})</p>
      <div className="rounded-2xl border border-[#2a3829] overflow-hidden" style={{ background: 'var(--bg3,#1a2419)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/20 bg-black/20 text-left text-xs text-[var(--subheader)] uppercase tracking-wider font-bold">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Addr</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={4} className="text-center py-8 text-[var(--body)] text-xs">No guests</td></tr>
              : rows.map(({ guest: g, plusOne: p }) => {
                const [label, color] = STATUS[g.rsvpStatus] ?? STATUS.pending
                return (
                  <>
                    <tr key={g.id} className="border-b border-black/10 last:border-0 hover:bg-black/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>
                            {g.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-semibold text-[var(--title)] text-xs truncate">{g.name}</p>
                              {g.partyRole && <span className="text-sm" title={g.partyRole}>{ROLE_ICONS[g.partyRole] || ''}</span>}
                            </div>
                            {g.email && <p className="text-[var(--body)] text-[10px] truncate">{g.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Tag color={color}>{label}</Tag></td>
                      <td className="px-4 py-3 text-center">
                        {g.address ? <Check size={14} className="text-[#00ff00] mx-auto" /> : <span className="text-[var(--body)] text-xs"></span>}
                      </td>
                      <td className="px-2 py-3">
                        <button onClick={() => del(g.id)} className="text-[var(--body)] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                    {p && (
                      <tr key={p.id} className="border-b border-black/10 last:border-0 bg-black/5">
                        <td className="pl-10 pr-2 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-5 rounded-full bg-[#2a3829] shrink-0" />
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 bg-[#1e1a3a] text-[#a5b4fc]">
                              {p.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-[11px] text-[var(--body)] truncate">{p.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2"><Tag color={STATUS[p.rsvpStatus]?.[1] ?? '#f0b429'}>{STATUS[p.rsvpStatus]?.[0] ?? 'Pending'}</Tag></td>
                        <td className="px-4 py-2 text-center">{p.address ? <Check size={13} className="text-[#00ff00] mx-auto" /> : <span className="text-[var(--body)] text-xs"></span>}</td>
                        <td className="px-2 py-2" />
                      </tr>
                    )}
                  </>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Guest list"
        sub={`${stats.all} guests  ${stats.attending} attending  ${stats.pending} pending`}
        action={
          <div className="flex gap-3">
            <Btn variant="ghost" onClick={exportCSV}>Export CSV</Btn>
            <Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add guest</Btn>
          </div>
        }
      />

      <div className="flex gap-3 mb-7 flex-wrap">
        {(['all', 'attending', 'declined', 'pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg3,#1a2419)] text-[var(--body)] border border-[#2a3829] hover:border-[var(--sage)]'}`}>
            {f === 'all' ? `All (${stats.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${stats[f]})`}
          </button>
        ))}
      </div>

      <div className="mb-7">
        <Input placeholder="Search guests" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="flex gap-7">
            <GuestTable title="Bride's side" rows={getRows('bride')} />
            <GuestTable title="Both"         rows={getRows('both')}  />
            <GuestTable title="Groom's side" rows={getRows('groom')} />
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add guest"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={save} disabled={saving || !form.name.trim()}>
                {saving ? <><Loader2 size={17} className="animate-spin" />Saving</> : <><Plus size={17} />Add guest</>}
              </Btn>
            </>
          }
        >
          {errMsg && (
            <div className="flex items-center gap-2 bg-red-950 text-red-400 text-sm rounded-xl p-3">
              <AlertCircle size={17} />{errMsg}
            </div>
          )}
          <Field label="Full name *">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Katie Marsh" autoFocus />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="katie@email.com" />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, City, State" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Side">
              <Select value={form.side} onChange={e => setForm(f => ({ ...f, side: e.target.value }))}>
                <option value="bride">Bride&apos;s side</option>
                <option value="groom">Groom&apos;s side</option>
                <option value="both">Both</option>
              </Select>
            </Field>
            <Field label="Dietary">
              <Select value={form.dietary} onChange={e => setForm(f => ({ ...f, dietary: e.target.value }))}>
                <option value="">None</option>
                <option>Vegetarian</option><option>Vegan</option><option>Gluten-free</option>
                <option>Nut allergy</option><option>Halal</option><option>Kosher</option>
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between py-1 px-1">
            <div>
              <p className="text-sm font-medium text-[var(--title)]">Plus one allowed</p>
              <p className="text-xs text-[var(--body)]">Can bring a guest</p>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, hasPlusOne: !f.hasPlusOne }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.hasPlusOne ? 'bg-[var(--accent)]' : 'bg-[#243022]'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--bg3,#1a2419)] shadow transition-transform ${form.hasPlusOne ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
