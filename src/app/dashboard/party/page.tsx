'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Check } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, PageHeader } from '@/components/ui'
import { $get, $patch } from '@/lib/utils'

interface Guest { id: string; name: string; email: string | null; side: string; isInvitee: boolean; partyRole: string | null }

const ROLE_ICONS: Record<string, string> = {
  'Maid of Honor': '', 'Bridesmaid': '', 'Flower Girl': '', 'Junior Bridesmaid': '',
  'Best Man': '', 'Groomsman': '', 'Usher': '', 'Ring Bearer': '', 'Officiant': '',
}
const BRIDE_ROLES = ['Maid of Honor','Bridesmaid','Flower Girl','Junior Bridesmaid']
const GROOM_ROLES = ['Best Man','Groomsman','Usher','Ring Bearer']

function GuestSearch({ guests, value, onChange }: { guests: Guest[]; value: string; onChange: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const filtered = guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-2">
      <Input placeholder="Search by name or email" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      <div className="max-h-48 overflow-y-auto rounded-xl border border-[#2a3829] divide-y divide-[#2a3829]">
        {filtered.length === 0
          ? <p className="text-xs text-[var(--body)] text-center py-4">No guests found</p>
          : filtered.map(g => (
            <button key={g.id} type="button" onClick={() => onChange(g.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/20 transition-colors"
              style={{ background: value === g.id ? 'var(--accent)22' : 'transparent' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>
                {g.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--title)] truncate">{g.name}</p>
                {g.email && <p className="text-xs text-[var(--body)] truncate">{g.email}</p>}
              </div>
              <span className="text-xs text-[var(--body)] capitalize shrink-0">{g.side}</span>
              {value === g.id && <Check size={14} className="text-[var(--sage)] shrink-0" />}
            </button>
          ))}
      </div>
    </div>
  )
}

export default function PartyPage() {
  const [guests, setGuests]         = useState<Guest[]>([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [selectedGuest, setSelected] = useState('')
  const [selectedRole, setRole]     = useState('Bridesmaid')
  const [saving, setSaving]         = useState(false)
  const [removing, setRemoving]     = useState<string | null>(null)

  useEffect(() => { $get('guests').then(d => { setGuests(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const partyMembers = guests.filter(g => g.partyRole && g.partyRole.trim() !== '')
  const bride        = partyMembers.filter(m => BRIDE_ROLES.includes(m.partyRole || ''))
  const groom        = partyMembers.filter(m => GROOM_ROLES.includes(m.partyRole || '') || m.partyRole === 'Officiant')
  const available    = guests.filter(g => g.isInvitee && (!g.partyRole || g.partyRole.trim() === ''))

  const addMember = async () => {
    if (!selectedGuest) return
    setSaving(true)
    const res = await $patch('guest', { id: selectedGuest, partyRole: selectedRole })
    setGuests(p => p.map(g => g.id === res.id ? res : g))
    setSelected(''); setRole('Bridesmaid'); setShowAdd(false); setSaving(false)
  }

  const removeMember = async (id: string) => {
    setRemoving(id)
    const res = await $patch('guest', { id, partyRole: '' })
    setGuests(p => p.map(g => g.id === res.id ? { ...g, partyRole: '' } : g))
    setRemoving(null)
  }

  const MemberCard = ({ m }: { m: Guest }) => (
    <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] p-4 group flex items-center gap-3">
      <div className="text-2xl">{ROLE_ICONS[m.partyRole || ''] || ''}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--title)] text-sm truncate">{m.name}</p>
        <p className="text-xs text-[var(--sage)]">{m.partyRole}</p>
        {m.email && <p className="text-xs text-[var(--body)] truncate">{m.email}</p>}
      </div>
      <button onClick={() => removeMember(m.id)} disabled={removing === m.id} className="text-[var(--body)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        {removing === m.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Wedding party"
        sub={`${partyMembers.length} members`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add member</Btn>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="grid grid-cols-2 gap-6">
            {[{ label: "Bride's side", list: bride }, { label: "Groom's side", list: groom }].map(({ label, list }) => (
              <div key={label}>
                <h2 className="text-xs font-bold text-[var(--subheader)] uppercase tracking-wider mb-4">{label}</h2>
                <div className="space-y-3">
                  {list.length === 0
                    ? <div className="border-2 border-dashed border-[#2a3829] rounded-2xl py-10 text-center text-[var(--body)] text-sm">No members yet</div>
                    : list.map(m => <MemberCard key={m.id} m={m} />)}
                </div>
              </div>
            ))}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add to wedding party"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={addMember} disabled={saving || !selectedGuest}>{saving ? <><Loader2 size={17} className="animate-spin" />Saving</> : <><Plus size={17} />Add</>}</Btn></>}
        >
          <Field label="Search guest">
            <GuestSearch guests={available} value={selectedGuest} onChange={setSelected} />
          </Field>
          <Field label="Role">
            <Select value={selectedRole} onChange={e => setRole(e.target.value)}>
              <optgroup label="Bride's side">{BRIDE_ROLES.map(r => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="Groom's side">{GROOM_ROLES.map(r => <option key={r}>{r}</option>)}</optgroup>
              <option value="Officiant">Officiant</option>
            </Select>
          </Field>
          {selectedRole && <p className="text-2xl text-center py-2">{ROLE_ICONS[selectedRole] || ''} {selectedRole}</p>}
        </Modal>
      )}
    </div>
  )
}
