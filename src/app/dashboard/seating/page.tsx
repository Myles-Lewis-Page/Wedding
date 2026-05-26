'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Loader2, Users, X } from 'lucide-react'
import { Table, Guest } from '@/types'

interface TableWithGuests extends Table { guestCount: number }

const SHAPES = ['round','rectangular','oval'] as const
const COLORS: Record<string, string> = { round: '#E1F5EE', rectangular: '#E6F1FB', oval: '#FAEEDA' }
const BORDER_COLORS: Record<string, string> = { round: '#5DCAA5', rectangular: '#378ADD', oval: '#EF9F27' }

function AddTableModal({ onClose, onSave }: { onClose: () => void; onSave: (t: Table) => void }) {
  const [form, setForm] = useState({ name: '', shape: 'round', seats: 8 })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, x: 100 + Math.random() * 200, y: 80 + Math.random() * 100, color: COLORS[form.shape] }) })
    onSave(await res.json())
    setSaving(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add table</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Table name</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Table 1, Head Table…" autoFocus /></div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(s => <button key={s} onClick={() => setForm(f => ({...f, shape: s}))} className={`py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${form.shape === s ? 'border-[#7A9C6E] bg-[#EDF4EA] text-[#4A6B3E]' : 'border-stone-200 text-stone-500'}`}>{s}</button>)}
            </div>
          </div>
          <div><label className="block text-xs font-medium text-stone-500 mb-1">Number of seats: <strong>{form.seats}</strong></label>
            <input type="range" min={2} max={20} value={form.seats} onChange={e => setForm(f => ({...f, seats: parseInt(e.target.value)}))} className="w-full" /></div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
          <button onClick={save} disabled={saving || !form.name.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add table
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SeatingPage() {
  const [tables, setTables] = useState<TableWithGuests[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [assignTarget, setAssignTarget] = useState<TableWithGuests | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/tables').then(r => r.json()),
      fetch('/api/guests').then(r => r.json()),
    ]).then(([tbls, gsts]) => {
      const guestArr: Guest[] = Array.isArray(gsts) ? gsts : []
      setGuests(guestArr)
      const tblArr: Table[] = Array.isArray(tbls) ? tbls : []
      setTables(tblArr.map(t => ({ ...t, guestCount: guestArr.filter(g => g.table_id === t.id).length })))
      setLoading(false)
    })
  }, [])

  const startDrag = (e: React.MouseEvent, id: string, tx: number, ty: number) => {
    e.preventDefault()
    const canvas = canvasRef.current!.getBoundingClientRect()
    setDragging(id)
    setDragOffset({ x: e.clientX - canvas.left - tx, y: e.clientY - canvas.top - ty })
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !canvasRef.current) return
    const canvas = canvasRef.current.getBoundingClientRect()
    const nx = Math.max(0, e.clientX - canvas.left - dragOffset.x)
    const ny = Math.max(0, e.clientY - canvas.top - dragOffset.y)
    setTables(prev => prev.map(t => t.id === dragging ? { ...t, x: nx, y: ny } : t))
  }, [dragging, dragOffset])

  const onMouseUp = useCallback(() => {
    if (!dragging) return
    const t = tables.find(tbl => tbl.id === dragging)
    if (t) fetch(`/api/tables/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ x: t.x, y: t.y }) })
    setDragging(null)
  }, [dragging, tables])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [onMouseMove, onMouseUp])

  const deleteTable = async (id: string) => {
    if (!confirm('Delete table?')) return
    await fetch(`/api/tables/${id}`, { method: 'DELETE' })
    setTables(p => p.filter(t => t.id !== id))
  }

  const assignGuest = async (guestId: string, tableId: string) => {
    await fetch(`/api/guests/${guestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table_id: tableId }) })
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: tableId } : g))
    setTables(prev => prev.map(t => ({ ...t, guestCount: guests.filter(g => g.id === guestId ? tableId === t.id : g.table_id === t.id).length })))
    setAssignTarget(null)
  }

  const unassignedGuests = guests.filter(g => g.rsvp_status === 'attending' && !g.table_id)
  const totalSeats = tables.reduce((s, t) => s + t.seats, 0)
  const totalAssigned = guests.filter(g => g.table_id).length

  const getTableDimensions = (shape: string) => {
    if (shape === 'rectangular') return { w: 100, h: 55, r: 8 }
    if (shape === 'oval') return { w: 110, h: 65, r: 50 }
    return { w: 75, h: 75, r: 37.5 }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Seating chart</h1>
          <p className="text-sm text-stone-400 mt-0.5">{totalAssigned} seated · {unassignedGuests.length} unassigned · {totalSeats} total seats</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Add table
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center flex-1 text-stone-400"><Loader2 size={22} className="animate-spin" /></div> : (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
            {/* Tables list */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Tables ({tables.length})</p>
              {tables.length === 0 ? <p className="text-xs text-stone-400">No tables yet</p> : tables.map(t => {
                const seated = guests.filter(g => g.table_id === t.id).length
                return (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0 cursor-pointer hover:bg-stone-50 rounded-lg px-1 group" onClick={() => setAssignTarget(t)}>
                    <div>
                      <p className="text-sm font-medium text-stone-700">{t.name}</p>
                      <p className="text-xs text-stone-400 capitalize">{t.shape} · {seated}/{t.seats} seated</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: BORDER_COLORS[t.shape] || '#888' }} />
                      <button onClick={e => { e.stopPropagation(); deleteTable(t.id) }} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 ml-1"><Trash2 size={12} /></button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unassigned */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Unassigned ({unassignedGuests.length})</p>
              {unassignedGuests.length === 0 ? <p className="text-xs text-stone-400">Everyone is seated! 🎉</p> :
                unassignedGuests.map(g => (
                  <div key={g.id} className="flex items-center gap-2 py-1.5 border-b border-stone-50 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-[#EDF4EA] flex items-center justify-center text-xs font-medium text-[#4A6B3E] flex-shrink-0">
                      {g.name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <span className="text-xs text-stone-600 flex-1 truncate">{g.name}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Canvas */}
          <div ref={canvasRef} className="flex-1 bg-white rounded-2xl border border-stone-200 relative overflow-hidden select-none" style={{ minHeight: 400 }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #d1c9bd 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <p className="absolute top-3 left-3 text-xs text-stone-300">Drag tables to arrange · click a table to assign guests</p>
            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">Add tables to start building your floor plan</div>
            )}
            {tables.map(t => {
              const { w, h, r } = getTableDimensions(t.shape)
              const seated = guests.filter(g => g.table_id === t.id).length
              return (
                <div key={t.id} style={{ position: 'absolute', left: t.x, top: t.y, width: w, height: h, background: t.color || COLORS[t.shape], borderRadius: r, border: `2px solid ${BORDER_COLORS[t.shape] || '#888'}`, cursor: dragging === t.id ? 'grabbing' : 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', boxShadow: dragging === t.id ? '0 8px 24px rgba(0,0,0,0.15)' : 'none', transition: dragging === t.id ? 'none' : 'box-shadow 0.2s', zIndex: dragging === t.id ? 10 : 1 }}
                  onMouseDown={e => startDrag(e, t.id, t.x, t.y)}
                  onClick={() => setAssignTarget(t)}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#444', textAlign: 'center', lineHeight: 1.2, maxWidth: w - 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>{t.name}</p>
                  <p style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{seated}/{t.seats}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showAdd && <AddTableModal onClose={() => setShowAdd(false)} onSave={t => { setTables(p => [...p, { ...t, guestCount: 0 }]); setShowAdd(false) }} />}

      {/* Assign guest modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">{assignTarget.name}</h2>
                <p className="text-xs text-stone-400">{guests.filter(g => g.table_id === assignTarget.id).length}/{assignTarget.seats} seats filled</p>
              </div>
              <button onClick={() => setAssignTarget(null)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-1">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Assigned</p>
              {guests.filter(g => g.table_id === assignTarget.id).map(g => (
                <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-stone-50">
                  <span className="text-sm text-stone-700">{g.name}</span>
                  <button onClick={() => assignGuest(g.id, '')} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
              ))}
              {unassignedGuests.length > 0 && <>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mt-3 mb-2">Add guest</p>
                {unassignedGuests.map(g => (
                  <div key={g.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#EDF4EA] cursor-pointer" onClick={() => assignGuest(g.id, assignTarget.id)}>
                    <span className="text-sm text-stone-700">{g.name}</span>
                    <Plus size={14} className="text-[#7A9C6E]" />
                  </div>
                ))}
              </>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
