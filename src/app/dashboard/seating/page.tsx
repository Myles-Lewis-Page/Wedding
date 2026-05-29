'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, X } from 'lucide-react'
import { Modal, Field, Input, Btn, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface SeatingTable { id: string; name: string; shape: string; seats: number; x: number; y: number; color: string }
interface Guest        { id: string; name: string; rsvpStatus: string; tableId: string | null }

const COLORS  = { round: '#E1F5EE', rectangular: '#E6F1FB', oval: '#FAEEDA' }
const BORDERS = { round: 'var(--sage)', rectangular: '#378ADD', oval: '#EF9F27' }
const DIMS    = { round: { w: 72, h: 72, r: 36 }, rectangular: { w: 100, h: 55, r: 8 }, oval: { w: 108, h: 62, r: 40 } }

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
    await $patch('guest', { id: guestId, tableId: tableId || null })
    setGuests(p => p.map(g => g.id === guestId ? { ...g, tableId: tableId || null } : g))
    setAssign(null)
  }

  const unassigned = guests.filter(g => g.rsvpStatus === 'attending' && !g.tableId)

  return (
    <div>
      <PageHeader
        title="Seating chart"
        sub={`${guests.filter(g => g.tableId).length} seated  ${unassigned.length} unassigned`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add table</Btn>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="flex gap-6 h-[520px]">
            {/* Sidebar */}
            <div className="w-52 shrink-0 flex flex-col gap-4">
              <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] p-5 flex-1 overflow-y-auto">
                <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider mb-3">Tables</p>
                {tables.map(t => {
                  const cnt = guests.filter(g => g.tableId === t.id).length
                  return (
                    <div key={t.id} className="flex items-center gap-1 py-2 border-b border-[#1a2419] last:border-0 group rounded-lg px-1 hover:bg-black/10">
                      <div className="flex-1 cursor-pointer" onClick={() => setAssign(t.id)}>
                        <p className="text-sm font-medium text-[var(--title)]">{t.name}</p>
                        <p className="text-xs text-[#5a7057] capitalize">{t.shape}  {cnt}/{t.seats}</p>
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
                {tables.length === 0 && <p className="text-xs text-[var(--body)]">No tables yet</p>}
              </div>
              <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] p-5 flex-1 overflow-y-auto">
                <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider mb-3">Unassigned ({unassigned.length})</p>
                {unassigned.length === 0
                  ? <p className="text-xs text-[var(--body)]">Everyone seated </p>
                  : unassigned.map(g => (
                    <div key={g.id} className="flex items-center gap-2 py-1.5 border-b border-[#1a2419] last:border-0">
                      <div className="w-5 h-5 rounded-full bg-[#1e3a1e] flex items-center justify-center text-[10px] font-semibold text-[var(--sage)] shrink-0">{g.name[0]}</div>
                      <span className="text-xs text-[#a8c4a4] truncate">{g.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Canvas */}
            <div ref={canvasRef} style={{ flex: 1, background: '#0f180e', borderRadius: 16, border: '1px solid #1e2e1c', position: 'relative', overflow: 'hidden', userSelect: 'none', minHeight: 420 }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle,#4a7048 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
              {tables.length === 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a5038', fontSize: 15 }}>Add tables to build your floor plan</div>}
              {tables.map(t => {
                const d = DIMS[t.shape as keyof typeof DIMS] || DIMS.round
                return (
                  <div key={t.id}
                    style={{ position: 'absolute', left: t.x, top: t.y, width: d.w, height: d.h, background: t.color, borderRadius: d.r, border: `2.5px solid ${BORDERS[t.shape as keyof typeof BORDERS] || '#888'}`, cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                    onMouseDown={e => onMouseDown(e, t.id, t.x, t.y)}
                    onClick={() => setAssign(t.id)}
                  >
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', textAlign: 'center', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: d.w - 10, lineHeight: 1.2 }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: '#2a4428', marginTop: 2, fontWeight: 500 }}>{guests.filter(g => g.tableId === t.id).length}/{t.seats}</p>
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

      {assignTarget && (
        <Modal title={tables.find(t => t.id === assignTarget)?.name || 'Table'} onClose={() => setAssign(null)}>
          <div className="space-y-1">
            {guests.filter(g => g.tableId === assignTarget).map(g => (
              <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-black/10">
                <span className="text-sm text-[var(--title)]">{g.name}</span>
                <button onClick={() => assignGuest(g.id, '')} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
            ))}
            {unassigned.length > 0 && (
              <>
                <p className="text-xs font-semibold text-[#5a7057] uppercase tracking-wider pt-2 pb-1">Add guest</p>
                {unassigned.map(g => (
                  <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#1e3a1e] cursor-pointer" onClick={() => assignGuest(g.id, assignTarget)}>
                    <span className="text-sm text-[var(--title)]">{g.name}</span>
                    <Plus size={15} className="text-[var(--sage)]" />
                  </div>
                ))}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
