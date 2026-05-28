'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react'

type Category = 'setup' | 'watering' | 'fertilizing' | 'planting' | 'general'

interface Task {
  id: number
  title: string
  notes: string | null
  category: Category
  month: string
  week: number | null
  done: number
}

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'setup',       label: 'Setup',        color: 'bg-purple-100 text-purple-700' },
  { value: 'watering',    label: 'Watering',      color: 'bg-blue-100 text-blue-700' },
  { value: 'fertilizing', label: 'Fertilizing',   color: 'bg-yellow-100 text-yellow-700' },
  { value: 'planting',    label: 'Planting',      color: 'bg-green-100 text-green-700' },
  { value: 'general',     label: 'General',       color: 'bg-stone-100 text-stone-600' },
]

const WEEKS = [1, 2, 3, 4]

const categoryColor = (c: string) =>
  CATEGORIES.find(x => x.value === c)?.color ?? 'bg-stone-100 text-stone-600'

function monthLabel(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function addMonths(ym: string, n: number) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function PlanPage() {
  const [month, setMonth] = useState(currentMonth)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', notes: '', category: 'general' as Category, week: '' })

  async function load(m: string) {
    const res = await fetch(`/api/tasks?month=${m}`)
    setTasks(await res.json())
  }

  useEffect(() => { load(month) }, [month])

  async function toggle(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    })
    load(month)
  }

  async function remove(id: number) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    load(month)
  }

  async function save() {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        notes: form.notes || null,
        category: form.category,
        month,
        week: form.week ? parseInt(form.week) : null,
      }),
    })
    setShowForm(false)
    setForm({ title: '', notes: '', category: 'general', week: '' })
    load(month)
  }

  const done = tasks.filter(t => t.done).length
  const total = tasks.length

  // Group by week
  const byWeek: Record<string, Task[]> = { '0': [] }
  WEEKS.forEach(w => { byWeek[String(w)] = [] })
  tasks.forEach(t => {
    const key = t.week ? String(t.week) : '0'
    byWeek[key] = [...(byWeek[key] ?? []), t]
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth(m => addMonths(m, -1))} className="p-1.5 rounded-lg hover:bg-stone-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-green-900">{monthLabel(month)}</h1>
          <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-stone-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
          <Plus className="w-4 h-4" /> Add task
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
          <div className="flex justify-between text-sm text-stone-600 mb-2">
            <span className="font-medium">{done} of {total} tasks done</span>
            <span>{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Add task modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Add task</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Task *</label>
                <input className="input w-full" placeholder="What needs to be done?"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Category</label>
                  <select className="input w-full" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Week (optional)</label>
                  <select className="input w-full" value={form.week}
                    onChange={e => setForm(f => ({ ...f, week: e.target.value }))}>
                    <option value="">Any time</option>
                    {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Notes</label>
                <textarea className="input w-full h-16 resize-none" placeholder="Optional details…"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-stone-300 hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={!form.title}
                className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      {total === 0
        ? (
          <div className="text-center py-20 text-stone-400">
            <p className="text-lg mb-1">No tasks for {monthLabel(month)}</p>
            <p className="text-sm">Add your first task for this month.</p>
          </div>
        )
        : (
          <div className="flex flex-col gap-6">
            {[...WEEKS, 0].map(week => {
              const weekTasks = byWeek[String(week)]
              if (!weekTasks || weekTasks.length === 0) return null
              return (
                <div key={week} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                    <h2 className="font-semibold text-stone-700 text-sm">
                      {week === 0 ? 'Anytime this month' : `Week ${week}`}
                    </h2>
                  </div>
                  <ul className="divide-y divide-stone-100">
                    {weekTasks.map(task => (
                      <li key={task.id} className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50">
                        <button onClick={() => toggle(task)} className="mt-0.5 shrink-0">
                          {task.done
                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                            : <Circle className="w-5 h-5 text-stone-300" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.done ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {task.title}
                          </p>
                          {task.notes && <p className="text-xs text-stone-500 mt-0.5">{task.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(task.category)}`}>
                            {CATEGORIES.find(c => c.value === task.category)?.label ?? task.category}
                          </span>
                          <button onClick={() => remove(task.id)} className="text-stone-300 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
