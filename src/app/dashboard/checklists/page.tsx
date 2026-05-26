'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'

const CHECKLIST: Record<string, string[]> = {
  '12+ months out': ['Set your budget','Create your guest list','Choose a wedding date','Book your venue','Hire a wedding planner (optional)','Start dress shopping','Book your photographer','Book your videographer'],
  '8–12 months': ['Book your caterer','Hire a florist','Book hair & makeup','Book officiant','Book DJ or band','Send save-the-dates','Start honeymoon planning','Register for gifts'],
  '6–8 months': ['Order wedding dress','Choose bridesmaids & groomsmen attire','Book transportation','Finalize ceremony details','Book rehearsal dinner venue','Order wedding cake','Plan honeymoon details'],
  '4–6 months': ['Send invitations','Finalize menu','Book hotel room blocks','Schedule dress fittings','Arrange accommodations for out-of-town guests','Purchase wedding rings'],
  '1–3 months': ['Final dress fitting','Confirm all vendors','Finalize seating chart','Write vows','Get marriage license','Create day-of timeline','Break in wedding shoes'],
  '2 weeks out': ['Confirm headcount with caterer','Confirm final details with all vendors','Delegate day-of tasks','Prepare vendor payments / envelopes','Pack for honeymoon'],
  'Week of': ['Pick up wedding dress','Confirm rehearsal dinner details','Rest and relax!','Pack emergency kit','Day before: rehearsal & rehearsal dinner'],
}

export default function ChecklistsPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const toggle = (key: string) => setChecked(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const total = Object.values(CHECKLIST).flat().length
  const done = checked.size

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Checklists</h1>
        <p className="text-sm text-stone-400 mt-0.5">{done} of {total} complete</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-[#7A9C6E] rounded-full transition-all" style={{ width: `${(done/total)*100}%` }} />
        </div>
        <p className="text-xs text-stone-400 text-right">{Math.round((done/total)*100)}% complete</p>
      </div>
      <div className="space-y-6">
        {Object.entries(CHECKLIST).map(([section, items]) => {
          const sectionDone = items.filter(i => checked.has(`${section}-${i}`)).length
          return (
            <div key={section} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50">
                <h3 className="font-medium text-stone-700 text-sm">{section}</h3>
                <span className="text-xs text-stone-400">{sectionDone}/{items.length}</span>
              </div>
              <div className="p-2">
                {items.map(item => {
                  const key = `${section}-${item}`
                  const done = checked.has(key)
                  return (
                    <button key={item} onClick={() => toggle(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${done ? 'opacity-60' : 'hover:bg-stone-50'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${done ? 'border-[#7A9C6E] bg-[#7A9C6E]' : 'border-stone-300'}`}>
                        {done && <Check size={11} className="text-white" />}
                      </div>
                      <span className={`text-sm ${done ? 'line-through text-stone-400' : 'text-stone-700'}`}>{item}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
