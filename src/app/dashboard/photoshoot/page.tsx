'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Check } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, Toggle, PageHeader } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface Shot { id: string; group: string; desc: string; mustHave: boolean; done: boolean }

const GROUPS = ['Couples','Ceremony','Family — Bride','Family — Groom','Wedding party','Details','Getting ready','Reception']

export default function PhotoshootPage() {
  const [shots, setShots]     = useState<Shot[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ group: 'Couples', desc: '', mustHave: false })

  useEffect(() => { $get('photoshoot').then(d => { setShots(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const add = async () => {
    if (!form.desc.trim()) return
    const res = await $post('photoshoot-shot', { ...form, order: shots.length })
    setShots(p => [...p, res]); setShowAdd(false)
    setForm({ group: 'Couples', desc: '', mustHave: false })
  }

  const toggle = async (shot: Shot) => {
    setShots(p => p.map(s => s.id === shot.id ? { ...s, done: !shot.done } : s))
    await $patch('photoshoot-shot', { id: shot.id, done: !shot.done })
  }

  const del = async (id: string) => {
    await $del('photoshoot-shot', id); setShots(p => p.filter(s => s.id !== id))
  }

  const grouped = GROUPS.map(g => ({ g, shots: shots.filter(s => s.group === g) })).filter(x => x.shots.length > 0)
  const done    = shots.filter(s => s.done).length

  return (
    <div>
      <PageHeader
        title="Photoshoot"
        sub={`${done}/${shots.length} shots done`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add shot</Btn>}
      />

      {loading
        ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="space-y-4">
            {grouped.length === 0
              ? <div className="text-center py-16 text-[var(--body)]">No shots yet — add must-have moments for your photographer</div>
              : grouped.map(({ g, shots: gs }) => (
                <div key={g} className="rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] overflow-hidden">
                  <div className="flex justify-between px-6 py-3 border-b border-[#202e1f]">
                    <p className="text-sm font-medium text-[var(--title)]">{g}</p>
                    <span className="text-xs text-[var(--body)]">{gs.filter(s => s.done).length}/{gs.length}</span>
                  </div>
                  <div className="p-2">
                    {gs.map(shot => (
                      <div key={shot.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl group hover:bg-black/10 ${shot.done ? 'opacity-60' : ''}`}>
                        <button
                          onClick={() => toggle(shot)}
                          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${shot.done ? 'border-[var(--sage)] bg-[var(--accent)]' : 'border-[#5a7057]'}`}
                        >
                          {shot.done && <Check size={11} className="text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${shot.done ? 'line-through text-[#5a7057]' : 'text-[#e8f0e6]'}`}>{shot.desc}</span>
                        {shot.mustHave && <span className="text-xs px-2 py-0.5 bg-[#1e3a1e] text-[var(--sage)] rounded-full shrink-0">Must have</span>}
                        <button onClick={() => del(shot.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add shot"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={add} disabled={!form.desc.trim()}><Plus size={17} />Add</Btn></>}
        >
          <Field label="Group"><Select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>{GROUPS.map(g => <option key={g}>{g}</option>)}</Select></Field>
          <Field label="Description *"><Input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Describe the shot" autoFocus /></Field>
          <div className="flex items-center justify-between py-1">
            <p className="text-sm text-[var(--title)]">Must-have</p>
            <Toggle value={form.mustHave} onChange={v => setForm(f => ({ ...f, mustHave: v }))} />
          </div>
        </Modal>
      )}
    </div>
  )
}
