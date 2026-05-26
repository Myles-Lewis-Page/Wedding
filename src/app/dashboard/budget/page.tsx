'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Loader2, X, DollarSign } from 'lucide-react'
import { BudgetCategory } from '@/types'
import { formatCurrency } from '@/lib/utils'

const PALETTE = ['#8FAF7A','#5DCAA5','#378ADD','#EF9F27','#D85A30','#D4537E','#7F77DD','#888780','#5DCAA5','#E24B4A']

function CategoryRow({ cat, onUpdate, onDelete }: {
  cat: BudgetCategory
  onUpdate: (id: string, field: string, val: number) => void
  onDelete: (id: string) => void
}) {
  const pct = cat.budgeted > 0 ? Math.round((cat.paid / cat.budgeted) * 100) : 0
  const remaining = cat.budgeted - cat.paid

  return (
    <tr className="border-b border-stone-50 hover:bg-stone-50 group transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
          <span className="font-medium text-stone-800 text-sm">{cat.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="relative">
          <span className="absolute left-2.5 top-1.5 text-stone-400 text-sm">$</span>
          <input
            type="number"
            defaultValue={cat.budgeted}
            onBlur={e => onUpdate(cat.id, 'budgeted', parseFloat(e.target.value) || 0)}
            className="w-28 pl-6 pr-2 py-1.5 rounded-lg border border-transparent hover:border-stone-200 focus:border-[#7A9C6E] focus:outline-none text-sm bg-transparent focus:bg-white transition-all"
          />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="relative">
          <span className="absolute left-2.5 top-1.5 text-stone-400 text-sm">$</span>
          <input
            type="number"
            defaultValue={cat.paid}
            onBlur={e => onUpdate(cat.id, 'paid', parseFloat(e.target.value) || 0)}
            className="w-28 pl-6 pr-2 py-1.5 rounded-lg border border-transparent hover:border-stone-200 focus:border-[#7A9C6E] focus:outline-none text-sm bg-transparent focus:bg-white transition-all"
          />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`text-sm font-medium ${remaining < 0 ? 'text-red-500' : 'text-stone-700'}`}>
          {formatCurrency(remaining)}
        </span>
      </td>
      <td className="px-4 py-3.5 w-40">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: cat.color }} />
          </div>
          <span className="text-xs text-stone-400 w-8 text-right">{pct}%</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <button onClick={() => onDelete(cat.id)}
          className="text-stone-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  )
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [totalBudget, setTotalBudget] = useState(45000)
  const [loading, setLoading] = useState(true)
  const [addName, setAddName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/budget').then(r => r.json()).then(d => { setCategories(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const allocated = categories.reduce((s, c) => s + c.budgeted, 0)
  const paid = categories.reduce((s, c) => s + c.paid, 0)
  const remaining = totalBudget - allocated

  const updateCategory = async (id: string, field: string, val: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c))
    await fetch(`/api/budget/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
  }

  const addCategory = async () => {
    if (!addName.trim()) return
    setSaving(true)
    const color = PALETTE[categories.length % PALETTE.length]
    const res = await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName, budgeted: 0, paid: 0, color, order: categories.length }),
    })
    const cat = await res.json()
    setCategories(prev => [...prev, cat])
    setAddName('')
    setShowAdd(false)
    setSaving(false)
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/budget/${id}`, { method: 'DELETE' })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Budget</h1>
          <p className="text-sm text-stone-400 mt-0.5">Track every dollar before you spend it</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Add category
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total budget', val: totalBudget, editable: true, color: '#7A9C6E' },
          { label: 'Allocated', val: allocated, sub: `${totalBudget > 0 ? Math.round((allocated/totalBudget)*100) : 0}% of budget`, color: '#378ADD' },
          { label: 'Paid so far', val: paid, sub: `${allocated > 0 ? Math.round((paid/allocated)*100) : 0}% of allocated`, color: '#5DCAA5' },
          { label: 'Unallocated', val: remaining, sub: remaining < 0 ? 'Over budget!' : 'left to assign', color: remaining < 0 ? '#E24B4A' : '#888780' },
        ].map(({ label, val, sub, editable, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-stone-200">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{label}</p>
            {editable ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-stone-400 text-sm">$</span>
                <input type="number" value={totalBudget} onChange={e => setTotalBudget(parseFloat(e.target.value) || 0)}
                  className="text-2xl font-medium text-stone-800 w-full focus:outline-none bg-transparent" style={{ fontFamily: 'var(--font-display)' }} />
              </div>
            ) : (
              <p className="text-2xl font-medium" style={{ fontFamily: 'var(--font-display)', color }}>{formatCurrency(val)}</p>
            )}
            {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Allocation bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-stone-700">Budget allocation</p>
          <p className="text-xs text-stone-400">{formatCurrency(allocated)} of {formatCurrency(totalBudget)} allocated</p>
        </div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden flex gap-0.5 mb-3">
          {categories.filter(c => c.budgeted > 0).map(c => (
            <div key={c.id} className="h-full transition-all" style={{ width: `${(c.budgeted / totalBudget) * 100}%`, background: c.color, minWidth: '2px' }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-stone-500">
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {c.name}
              <span className="text-stone-400">{totalBudget > 0 ? Math.round((c.budgeted/totalBudget)*100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-stone-400"><Loader2 size={22} className="animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Budgeted</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Paid</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Remaining</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider w-40">Progress</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <CategoryRow key={c.id} cat={c} onUpdate={updateCategory} onDelete={deleteCategory} />
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-stone-400 text-sm">No categories yet</td></tr>
              )}
            </tbody>
            <tfoot className="border-t border-stone-200 bg-stone-50">
              <tr>
                <td className="px-5 py-3 text-sm font-medium text-stone-700">Total</td>
                <td className="px-4 py-3 text-sm font-medium text-stone-800">{formatCurrency(allocated)}</td>
                <td className="px-4 py-3 text-sm font-medium text-stone-800">{formatCurrency(paid)}</td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: remaining < 0 ? '#E24B4A' : '#4A6B3E' }}>{formatCurrency(remaining)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Add category inline */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-medium text-stone-800 mb-4">Add budget category</h3>
            <input value={addName} onChange={e => setAddName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="e.g. Photography, Flowers…"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E] mb-4" autoFocus />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 border border-stone-200 hover:bg-stone-50">Cancel</button>
              <button onClick={addCategory} disabled={saving || !addName.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: '#7A9C6E' }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
