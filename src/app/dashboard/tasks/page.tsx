'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, Check } from 'lucide-react'
import { Task } from '@/types'

const CATS = ['Venue','Catering','Photography','Florals','Music','Attire','Stationery','Legal','Honeymoon','Day-of','General']
const PRIORITY: Record<string, string> = { low: 'bg-stone-100 text-stone-500', medium: 'bg-amber-50 text-amber-600', high: 'bg-red-50 text-red-600' }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'General', due_date: '', priority: 'medium', assigned_to: 'Both' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending')

  useEffect(() => { fetch('/api/tasks').then(r => r.json()).then(d => { setTasks(Array.isArray(d) ? d : []); setLoading(false) }) }, [])

  const toggle = async (t: Task) => {
    const updated = { ...t, completed: !t.completed }
    setTasks(prev => prev.map(tk => tk.id === t.id ? updated : tk))
    await fetch(`/api/tasks/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: updated.completed }) })
  }

  const addTask = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, completed: false, due_date: form.due_date || null }) })
    const newTask = await res.json()
    setTasks(p => [newTask, ...p])
    setForm({ title: '', category: 'General', due_date: '', priority: 'medium', assigned_to: 'Both' })
    setShowAdd(false)
    setSaving(false)
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(p => p.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed)
  const done = tasks.filter(t => t.completed).length

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-stone-800">Task manager</h1>
          <p className="text-sm text-stone-400 mt-0.5">{done} of {tasks.length} complete</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7A9C6E' }}>
          <Plus size={14} /> Add task
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-5">
        <div className="flex justify-between text-xs text-stone-400 mb-1.5">
          <span>Overall progress</span><span>{tasks.length > 0 ? Math.round((done/tasks.length)*100) : 0}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#7A9C6E] rounded-full transition-all" style={{ width: `${tasks.length > 0 ? (done/tasks.length)*100 : 0}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['pending','all','done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter === f ? 'bg-[#7A9C6E] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
            {f === 'pending' ? `To do (${tasks.filter(t => !t.completed).length})` : f === 'done' ? `Done (${done})` : `All (${tasks.length})`}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center h-32 text-stone-400"><Loader2 size={22} className="animate-spin" /></div> : (
        <div className="space-y-2">
          {filtered.length === 0 ? <div className="text-center py-12 text-stone-400 text-sm">{filter === 'done' ? 'No completed tasks yet' : 'All caught up! 🎉'}</div> :
            filtered.map(t => (
              <div key={t.id} className={`bg-white rounded-xl border border-stone-200 p-3.5 flex items-center gap-3 group transition-all ${t.completed ? 'opacity-60' : ''}`}>
                <button onClick={() => toggle(t)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${t.completed ? 'border-[#7A9C6E] bg-[#7A9C6E]' : 'border-stone-300 hover:border-[#7A9C6E]'}`}>
                  {t.completed && <Check size={11} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{t.category}</span>
                    {t.due_date && <span className="text-xs text-stone-400">· Due {new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    {t.assigned_to && <span className="text-xs text-stone-400">· {t.assigned_to}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PRIORITY[t.priority]}`}>{t.priority}</span>
                <button onClick={() => deleteTask(t.id)} className="text-stone-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-medium">Add task</h2>
              <button onClick={() => setShowAdd(false)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              <div><label className="block text-xs font-medium text-stone-500 mb-1">Task *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} onKeyDown={e => e.key === 'Enter' && addTask()} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" placeholder="Book venue walkthrough" autoFocus /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
                    {CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-stone-500 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white capitalize">
                    {['low','medium','high'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-stone-500 mb-1">Due date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#7A9C6E]" /></div>
                <div><label className="block text-xs font-medium text-stone-500 mb-1">Assigned to</label>
                  <select value={form.assigned_to} onChange={e => setForm(f => ({...f, assigned_to: e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white">
                    {['Both','Bride','Groom','Planner'].map(a => <option key={a}>{a}</option>)}</select></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
              <button onClick={addTask} disabled={saving || !form.title.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: '#7A9C6E' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
