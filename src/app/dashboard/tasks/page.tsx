'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Check } from 'lucide-react'
import { Modal, Field, Input, Select, Btn, Tag, PageHeader, Card } from '@/components/ui'
import { $get, $post, $patch, $del } from '@/lib/utils'

interface Task { id: string; title: string; category: string; dueDate: string | null; priority: string; completed: boolean; assignedTo: string }

const PRIORITY_COLOR: Record<string, string> = { low: '#78716c', medium: '#d97706', high: '#dc2626' }

export default function TasksPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter]   = useState<'pending' | 'all' | 'done'>('pending')
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ title: '', category: 'General', dueDate: '', priority: 'medium', assignedTo: 'Both' })

  useEffect(() => { $get('tasks').then(d => { setTasks(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const toggle = async (t: Task) => {
    setTasks(p => p.map(tk => tk.id === t.id ? { ...tk, completed: !t.completed } : tk))
    await $patch('task', { id: t.id, completed: !t.completed })
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const res = await $post('task', { ...form, dueDate: form.dueDate || null })
    setTasks(p => [res, ...p]); setShowAdd(false); setSaving(false)
    setForm({ title: '', category: 'General', dueDate: '', priority: 'medium', assignedTo: 'Both' })
  }

  const del = async (id: string) => {
    await $del('task', id); setTasks(p => p.filter(t => t.id !== id))
  }

  const done  = tasks.filter(t => t.completed).length
  const shown = tasks.filter(t => filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed)

  return (
    <div>
      <PageHeader
        title="Tasks"
        sub={`${done} of ${tasks.length} complete`}
        action={<Btn onClick={() => setShowAdd(true)}><Plus size={17} />Add task</Btn>}
      />

      <Card style={{ marginBottom: 24 }}>
        <div className="flex justify-between text-xs font-bold text-[var(--subheader)] mb-1.5">
          <span>Progress</span>
          <span className="font-normal text-[var(--body)]">{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-[#1f2b1e] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${tasks.length ? done / tasks.length * 100 : 0}%` }} />
        </div>
      </Card>

      <div className="flex gap-2 mb-6">
        {(['pending', 'all', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-[var(--accent)] text-white' : 'bg-[#1f2b1e] text-[#7a9878] hover:bg-[#243022]'}`}>
            {f === 'pending' ? `To do (${tasks.filter(t => !t.completed).length})` : f === 'done' ? `Done (${done})` : `All (${tasks.length})`}
          </button>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[var(--body)]" size={26} /></div>
        : (
          <div className="space-y-2">
            {shown.length === 0
              ? <div className="text-center py-12 text-[var(--body)]">{filter === 'done' ? 'No completed tasks' : 'All caught up! 🎉'}</div>
              : shown.map(t => (
                <div key={t.id} className={`rounded-2xl border border-[#2a3829] bg-[var(--bg3,#1a2419)] p-3.5 flex items-center gap-4 group transition-colors hover:border-[var(--sage)] ${t.completed ? 'opacity-60' : ''}`}>
                  <button
                    onClick={() => toggle(t)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.completed ? 'border-[var(--sage)] bg-[var(--accent)]' : 'border-[#5a7057] hover:border-[var(--sage)]'}`}
                  >
                    {t.completed && <Check size={11} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.completed ? 'line-through text-[#5a7057]' : 'text-[#e8f0e6]'}`}>{t.title}</p>
                    <p className="text-xs text-[var(--body)]">
                      {t.category}
                      {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                      {t.assignedTo ? ` · ${t.assignedTo}` : ''}
                    </p>
                  </div>
                  <Tag color={PRIORITY_COLOR[t.priority] || '#78716c'}>{t.priority}</Tag>
                  <button onClick={() => del(t.id)} className="text-[#2a3828] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
          </div>
        )}

      {showAdd && (
        <Modal
          title="Add task"
          onClose={() => setShowAdd(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn><Btn onClick={save} disabled={saving || !form.title.trim()}>{saving ? <><Loader2 size={17} className="animate-spin" />Saving…</> : <><Plus size={17} />Add</>}</Btn></>}
        >
          <Field label="Task *">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Book venue walkthrough" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['General','Venue','Catering','Photography','Florals','Music','Attire','Legal','Honeymoon','Day-of'].map(c => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['low', 'medium', 'high'].map(p => <option key={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Due date"><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></Field>
            <Field label="Assigned to">
              <Select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                {['Both', 'Bride', 'Groom', 'Planner'].map(a => <option key={a}>{a}</option>)}
              </Select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
