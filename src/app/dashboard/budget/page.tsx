'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Modal, Field, Input, Btn, PageHeader, Card } from '@/components/ui'
import { $get, $post, $patch, $del, fmt$ } from '@/lib/utils'

interface BudgetCat { id: string; name: string; budgeted: number; paid: number; color: string; order: number }

const COLORS = ['#8FAF7A', '#8fb882', '#378ADD', '#EF9F27', '#D85A30', '#D4537E', '#7F77DD', '#888780']

export default function BudgetPage() {
  const [cats, setCats]       = useState<BudgetCat[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(45000)
  const [addName, setAddName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    $get('budget').then(d => { setCats(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const update = async (id: string, field: string, val: number) => {
    setCats(p => p.map(c => c.id === id ? { ...c, [field]: val } : c))
    await $patch('budget', { id, [field]: val })
  }

  const add = async () => {
    if (!addName.trim()) return
    const color = COLORS[cats.length % COLORS.length]
    const res   = await $post('budget', { name: addName, color, order: cats.length })
    setCats(p => [...p, res]); setAddName(''); setShowAdd(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete category?')) return
    await $del('budget', id); setCats(p => p.filter(c => c.id !== id))
  }

  const allocated = cats.reduce((s, c) => s + c.budgeted, 0)
  const paid      = cats.reduce((s, c) => s + c.paid, 0)

  return (
    <div>
      <PageHeader
        title="Budget"
        sub="Track every dollar before you spend it"
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add category</Btn>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total budget',  val: total,            editable: true },
          { label: 'Allocated',     val: allocated,        sub: `${total ? Math.round(allocated / total * 100) : 0}%` },
          { label: 'Paid',          val: paid,             sub: `${allocated ? Math.round(paid / allocated * 100) : 0}% of allocated` },
          { label: 'Remaining',     val: total - allocated, color: total - allocated < 0 ? '#dc2626' : undefined },
        ].map(({ label, val, sub, editable, color }) => (
          <Card key={label}>
            <p className="text-xs font-bold text-[var(--subheader)] uppercase tracking-wider mb-2">{label}</p>
            {editable
              ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[var(--body)]">$</span>
                  <input
                    type="number" value={total}
                    onChange={e => setTotal(+e.target.value)}
                    className="text-2xl font-light w-full focus:outline-none bg-transparent"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--title)' }}
                  />
                </div>
              )
              : <p className="text-2xl font-light" style={{ fontFamily: 'var(--font-display)', color: color || 'var(--title)' }}>{fmt$(val)}</p>}
            {sub && <p className="text-xs text-[#5a7057] mt-0.5">{sub}</p>}
          </Card>
        ))}
      </div>

      {/* Allocation bar */}
      <Card style={{ marginBottom: 24 }}>
        <div className="flex justify-between text-xs font-bold text-[var(--subheader)] mb-2">
          <span>Allocation</span>
          <span className="font-normal text-[var(--body)]">{fmt$(allocated)} of {fmt$(total)}</span>
        </div>
        <div className="h-3 bg-[#1f2b1e] rounded-full overflow-hidden flex gap-px">
          {cats.filter(c => c.budgeted > 0).map(c => (
            <div key={c.id} className="h-full transition-all" style={{ width: `${(c.budgeted / total) * 100}%`, background: c.color }} />
          ))}
        </div>
        {/* Legend — wraps naturally, each item has breathing room */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
          {cats.map(c => (
            <span key={c.id} className="flex items-center gap-2 text-xs text-[var(--body)] min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="truncate max-w-[120px]">{c.name}</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Table */}
      {loading
        ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/20 bg-black/20 text-left text-xs text-[var(--subheader)] uppercase tracking-wider font-bold">
                  {['Category', 'Budgeted', 'Paid', 'Remaining', 'Progress', ''].map(h => (
                    <th key={h} className="px-6 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cats.length === 0
                  ? <tr><td colSpan={6} className="text-center py-10 text-[var(--body)]">No categories yet</td></tr>
                  : cats.map(c => {
                    const rem = c.budgeted - c.paid
                    const pct = c.budgeted > 0 ? Math.min(Math.round(c.paid / c.budgeted * 100), 100) : 0
                    return (
                      <tr key={c.id} className="border-b border-[#1a2419] last:border-0 hover:bg-[#1a2419] group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                            <span className="font-medium text-[#e8f0e6] truncate">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-[var(--body)] text-xs shrink-0">$</span>
                            <input type="number" defaultValue={c.budgeted} onBlur={e => update(c.id, 'budgeted', +e.target.value)}
                              className="w-24 px-2 py-1.5 rounded-lg border border-transparent hover:border-[#2a3829] focus:border-[var(--sage)] focus:outline-none text-sm bg-transparent focus:bg-[var(--bg3)]"
                              style={{ color: 'var(--title)' }} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-[var(--body)] text-xs shrink-0">$</span>
                            <input type="number" defaultValue={c.paid} onBlur={e => update(c.id, 'paid', +e.target.value)}
                              className="w-24 px-2 py-1.5 rounded-lg border border-transparent hover:border-[#2a3829] focus:border-[var(--sage)] focus:outline-none text-sm bg-transparent focus:bg-[var(--bg3)]"
                              style={{ color: 'var(--title)' }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: rem < 0 ? '#dc2626' : 'var(--title)' }}>{fmt$(rem)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#1f2b1e] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                            </div>
                            <span className="text-xs text-[#5a7057] w-8 text-right shrink-0">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => del(c.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
              <tfoot className="border-t border-[#2a3829] bg-[var(--bg3,#1a2419)]">
                <tr>
                  <td className="px-6 py-3 text-sm font-semibold text-[var(--title)]">Total</td>
                  <td className="px-6 py-3 text-sm font-semibold text-[var(--title)]">{fmt$(allocated)}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-[var(--title)]">{fmt$(paid)}</td>
                  <td className="px-6 py-3 text-sm font-semibold" style={{ color: total - allocated < 0 ? '#dc2626' : '#3d6b2e' }}>{fmt$(total - allocated)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add category"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!addName.trim()}><Plus size={17} />Add</Btn></>}
        >
          <Field label="Category name">
            <Input value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Photography, Flowers" autoFocus />
          </Field>
        </Modal>
      )}
    </div>
  )
}
