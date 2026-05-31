'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, X } from 'lucide-react'
import { Modal, Field, Input, Btn, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface SeatingTable { id: string; name: string; shape: string; seats: number; x: number; y: number; color: string }
interface Guest        { id: string; name: string; rsvpStatus: string; tableId: string | null }

const COLORS  = { round: '#E1F5EE', rectangular: '#E6F1FB', oval: '#FAEEDA' }
const BORDERS = { round: 'var(--sage)', rectangular: '#378ADD', oval: '#EF9F27' }
const DIMS    = { round: { w: 90, h: 90, r: 45 }, rectangular: { w: 120, h: 70, r: 8 }, oval: { w: 130, h: 76, r: 50 } }

/** Place guest name labels around a table shape */
function TableGuestLabels({ table, guests }: { table: SeatingTable; guests: Guest[] }) {
  const d = DIMS[table.shape as keyof typeof DIMS] || DIMS.round
  const cx = d.w / 2
  const cy = d.h / 2
  const count = guests.length

  if (count === 0) return null

  return (
    <>
      {guests.map((g, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2
        const rx = table.shape === 'round' ? cx + 32 : (table.shape === 'rectangular' ? cx + 28 : cx + 30)
        const ry = table.shape === 'round' ? cy + 32 : (table.shape === 'rectangular' ? cy + 24 : cy + 26)
        const x = cx + rx * Math.cos(angle)
        const y = cy + ry * Math.sin(angle)
        const firstName = g.name.split(' ')[0]
        return (
          <div
            key={g.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              fontSize: 9,
              fontWeight: 600,
              color: '#1a2e1a',
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 4,
              padding: '1px 4px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              maxWidth: 52,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
            }}
          >
            {firstName}
          </div>
        )
      })}
    </>
  )
}

export default function SeatingPage() {
  const [tables, setTables]       = useState<SeatingTable[]>([])
  const [guests, setGuests]       = useState<Guest[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [assignTarget, setAssign] = useState<string | null>(null)
  const [form, setForm]           = useState({ name: '', shape: 'round', seats: 8 })
  const canvasRef  = useRef<HTMLDivElement>(null)
  const dragging   = useRef<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    Promise.all([$get('tables'), $get('guests')]).then(([t, g]) => {
      setTables(Array.isArray(t) ? t : [])
      setGuests(Array.isArray(g) ? g : [])
      setLoading(false)
    })
  }, [])

  const addTable = async () => {
    if (!form.name.trim()) return
    const res = await $post('table', { ...form, x: 80 + Math.random() * 200, y: 60 + Math.random() * 100, color: COLORS[form.shape as keyof typeof COLORS] })
    setTables(p => [...p, res]); setShowAdd(false); setForm({ name: '', shape: 'round', seats: 8 })
  }

  const onMouseDown = (e: React.MouseEvent, id: string, tx: number, ty: number) => {
    e.preventDefault()
    const r = canvasRef.current!.getBoundingClientRect()
    dragging.current = id; dragOffset.current = { x: e.clientX - r.left - tx, y: e.clientY - r.top - ty }
  }

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current || !canvasRef.current) return
      const r  = canvasRef.current.getBoundingClientRect()
      const nx = Math.max(0, e.clientX - r.left - dragOffset.current.x)
      const ny = Math.max(0, e.clientY - r.top - dragOffset.current.y)
      setTables(p => p.map(t => t.id === dragging.current ? { ...t, x: nx, y: ny } : t))
    }
    const up = () => {
      if (!dragging.current) return
      const t = tables.find(t => t.id === dragging.current)
      if (t) $patch('table', { id: t.id, x: t.x, y: t.y })
      dragging.current = null
    }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [tables])

  const assignGuest = async (guestId: string, tableId: string | null) => {
    // Capacity check
    const table = tables.find(t => t.id === tableId)
    const seatedCount = guests.filter(g => g.tableId === tableId).length
    if (table && seatedCount >= table.seats) {
      alert(`${table.name} is full (${table.seats}/${table.seats} seats)`)
      return
    }
    await $patch('guest', { id: guestId, tableId: tableId || null })
    setGuests(p => p.map(g => g.id === guestId ? { ...g, tableId: tableId || null } : g))
    // keep modal open so user can keep adding
  }

  const removeGuest = async (guestId: string) => {
    await $patch('guest', { id: guestId, tableId: null })
    setGuests(p => p.map(g => g.id === guestId ? { ...g, tableId: null } : g))
  }

  const unassigned = guests.filter(g => g.rsvpStatus === 'attending' && !g.tableId)

  return (
    <div>
      <PageHeader
        title="Seating chart"
        sub={`${guests.filter(g => g.tableId).length} seated · ${unassigned.length} unassigned`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add table</Btn>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="flex gap-6 h-[520px]">
            {/* Sidebar */}
            <div className="w-56 shrink-0 flex flex-col gap-4">
              {/* Tables panel */}
              <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] flex-1 overflow-hidden flex flex-col">
                <div className="px-5 pt-5 pb-3 border-b border-[#1a2419] shrink-0">
                  <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider">Tables</p>
                </div>
                <div className="overflow-y-auto flex-1 px-3 py-3">
                  {tables.map(t => {
                    const cnt = guests.filter(g => g.tableId === t.id).length
                    const full = cnt >= t.seats
                    return (
                      <div key={t.id} className="flex items-center gap-1 py-2 border-b border-[#1a2419] last:border-0 group rounded-lg px-2 hover:bg-black/10">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setAssign(t.id)}>
                          <p className="text-sm font-medium text-[var(--title)] truncate">{t.name}</p>
                          <p className={`text-xs capitalize ${full ? 'text-amber-400' : 'text-[#5a7057]'}`}>
                            {t.shape} · {cnt}/{t.seats}{full ? ' · Full' : ''}
                          </p>
                        </div>
                        <button onClick={async () => {
                          if (!confirm(`Delete ${t.name}?`)) return
                          await $del('table', t.id)
                          setTables(p => p.filter(x => x.id !== t.id))
                          setGuests(p => p.map(g => g.tableId === t.id ? { ...g, tableId: null } : g))
                        }} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                  {tables.length === 0 && <p className="text-xs text-[var(--body)] px-1 pt-1">No tables yet</p>}
                </div>
              </div>

              {/* Unassigned panel */}
              <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] flex-1 overflow-hidden flex flex-col">
                <div className="px-5 pt-5 pb-3 border-b border-[#1a2419] shrink-0">
                  <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider">Unassigned ({unassigned.length})</p>
                </div>
                <div className="overflow-y-auto flex-1 px-3 py-3">
                  {unassigned.length === 0
                    ? <p className="text-xs text-[var(--body)] px-1 pt-1">Everyone seated 🎉</p>
                    : unassigned.map(g => (
                      <div key={g.id} className="flex items-center gap-2 py-1.5 border-b border-[#1a2419] last:border-0 px-1">
                        <div className="w-5 h-5 rounded-full bg-[#1e3a1e] flex items-center justify-center text-[10px] font-semibold text-[var(--sage)] shrink-0">{g.name[0]}</div>
                        <span className="text-xs text-[#a8c4a4] truncate min-w-0">{g.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div ref={canvasRef} style={{ flex: 1, background: '#0f180e', borderRadius: 16, border: '1px solid #1e2e1c', position: 'relative', overflow: 'hidden', userSelect: 'none', minHeight: 420 }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle,#4a7048 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
              {tables.length === 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a5038', fontSize: 15 }}>Add tables to build your floor plan</div>}
              {tables.map(t => {
                const d = DIMS[t.shape as keyof typeof DIMS] || DIMS.round
                const tableGuests = guests.filter(g => g.tableId === t.id)
                const full = tableGuests.length >= t.seats
                return (
                  <div key={t.id}
                    style={{ position: 'absolute', left: t.x, top: t.y, width: d.w, height: d.h }}
                  >
                    <div
                      style={{ position: 'absolute', inset: 0, background: full ? '#3a1a1a' : t.color, borderRadius: d.r, border: `2.5px solid ${full ? '#f87171' : BORDERS[t.shape as keyof typeof BORDERS] || '#888'}`, cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                      onMouseDown={e => onMouseDown(e, t.id, t.x, t.y)}
                      onClick={() => setAssign(t.id)}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, color: full ? '#f87171' : '#1a2e1a', textAlign: 'center', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: d.w - 10, lineHeight: 1.2 }}>{t.name}</p>
                      <p style={{ fontSize: 10, color: full ? '#f87171' : '#2a4428', marginTop: 1, fontWeight: 500 }}>{tableGuests.length}/{t.seats}</p>
                    </div>
                    <TableGuestLabels table={t} guests={tableGuests} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add table"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={addTable} disabled={!form.name.trim()}><Plus size={17} />Add</Btn></>}
        >
          <Field label="Table name"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Table 1, Head Table" autoFocus /></Field>
          <Field label="Shape">
            <div className="grid grid-cols-3 gap-3">
              {['round', 'rectangular', 'oval'].map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, shape: s }))}
                  className={`py-2 rounded-xl text-sm font-medium capitalize border-2 transition-all ${form.shape === s ? 'border-[var(--sage)] bg-[#1e3a1e] text-[var(--sage)]' : 'border-[#2a3829] text-[#7a9878]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label={`Seats: ${form.seats}`}>
            <input type="range" min={2} max={20} value={form.seats} onChange={e => setForm(f => ({ ...f, seats: +e.target.value }))} className="w-full" />
          </Field>
        </Modal>
      )}

      {assignTarget && (() => {
        const table = tables.find(t => t.id === assignTarget)
        const seated = guests.filter(g => g.tableId === assignTarget)
        const available = guests.filter(g => g.rsvpStatus === 'attending' && !g.tableId)
        const seatedCount = seated.length
        const isFull = table ? seatedCount >= table.seats : false

        return (
          <Modal title={table?.name || 'Table'} onClose={() => setAssign(null)}>
            {/* Currently seated */}
            {seated.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider mb-2">
                  Seated ({seatedCount}/{table?.seats})
                </p>
                <div className="space-y-1">
                  {seated.map(g => (
                    <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-black/10">
                      <span className="text-sm text-[var(--title)]">{g.name}</span>
                      <button onClick={() => removeGuest(g.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full warning */}
            {isFull && (
              <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-900 rounded-lg px-3 py-2">
                This table is full ({table?.seats}/{table?.seats} seats). Remove a guest or increase the seat count to add more.
              </p>
            )}

            {/* Add guests */}
            {available.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider mb-2 pt-2">Add guest</p>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {available.map(g => (
                    <div
                      key={g.id}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${isFull ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#1e3a1e] cursor-pointer'}`}
                      onClick={() => !isFull && assignGuest(g.id, assignTarget)}
                    >
                      <span className="text-sm text-[var(--title)]">{g.name}</span>
                      {isFull
                        ? <span className="text-xs text-[#5a7057]">Full</span>
                        : <Plus size={15} className="text-[var(--sage)]" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seated.length === 0 && available.length === 0 && (
              <p className="text-sm text-[var(--body)] text-center py-4">No attending guests to assign</p>
            )}
          </Modal>
        )
      })()}
    </div>
  )
}
