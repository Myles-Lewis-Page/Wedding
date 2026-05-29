'use client'
import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { PageHeader, Card } from '@/components/ui'
import { $get, $patch } from '@/lib/utils'

interface ChecklistItem { id: string; section: string; item: string; completed: boolean; assignedTo: string; order: number }

export default function ChecklistPage() {
  const [items, setItems]     = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    $get('checklist').then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const toggle = async (item: ChecklistItem) => {
    setItems(p => p.map(i => i.id === item.id ? { ...i, completed: !item.completed } : i))
    await $patch('checklist-item', { id: item.id, completed: !item.completed })
  }

  const sections = Array.from(new Set(items.map(i => i.section)))
  const done     = items.filter(i => i.completed).length

  return (
    <div>
      <PageHeader title="Checklist" sub={`${done} of ${items.length} complete`} />

      <Card style={{ marginBottom: 24 }}>
        <div className="h-2 bg-[#1f2b1e] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
        <p className="text-xs text-[#5a7057] text-right mt-1">{items.length ? Math.round(done / items.length * 100) : 0}%</p>
      </Card>

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="space-y-4">
            {sections.map(section => {
              const sectionItems = items.filter(i => i.section === section)
              const sectionDone  = sectionItems.filter(i => i.completed).length
              return (
                <div key={section} className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] overflow-hidden">
                  <div className="flex justify-between items-center px-6 py-3 border-b border-[#202e1f]">
                    <p className="text-sm font-medium text-[var(--title)]">{section}</p>
                    <span className="text-xs text-[var(--body)] shrink-0 ml-4">{sectionDone}/{sectionItems.length}</span>
                  </div>
                  <div className="p-3">
                    {sectionItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggle(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-black/10 ${item.completed ? 'opacity-60' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.completed ? 'border-[var(--sage)] bg-[var(--accent)]' : 'border-[#5a7057]'}`}>
                          {item.completed && <Check size={11} className="text-white" />}
                        </div>
                        {/* Text must not overflow — min-w-0 + truncate on the span */}
                        <span className={`text-sm flex-1 min-w-0 truncate pr-2 ${item.completed ? 'line-through text-[#5a7057]' : 'text-[#e8f0e6]'}`}>{item.item}</span>
                        {item.assignedTo !== 'Both' && (
                          <span className="text-xs text-[#3a5038] shrink-0 pl-2">{item.assignedTo}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
