'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Sprout, CheckCircle, Clock, Hammer } from 'lucide-react'

type Status = 'planned' | 'in-progress' | 'complete'

interface Area {
  id: number
  name: string
  description: string | null
  location: string | null
  status: Status
  target_date: string | null
  plants: string | null
  notes: string | null
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  'planned':     { label: 'Planned',     color: 'bg-stone-100 text-stone-600',   icon: <Clock className="w-4 h-4" /> },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700',     icon: <Hammer className="w-4 h-4" /> },
  'complete':    { label: 'Complete',    color: 'bg-green-100 text-green-700',   icon: <CheckCircle className="w-4 h-4" /> },
}

const emptyForm = {
  name: '', description: '', location: '', status: 'planned' as Status,
  target_date: '', plants: '', notes: '',
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const res = await fetch('/api/areas')
    setAreas(await res.json())
  }

  useEffect(() => { load() }, [])

  async function save() {
    await fetch('/api/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        location: form.location || null,
        status: form.status,
        target_date: form.target_date || null,
        plants: form.plants || null,
        notes: form.notes || null,
      }),
    })
    setShowForm(false)
    setForm(emptyForm)
    load()
  }

  async function setStatus(area: Area, status: Status) {
    await fetch(`/api/areas/${area.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this area?')) return
    await fetch(`/api/areas/${id}`, { method: 'DELETE' })
    load()
  }

  const complete = areas.filter(a => a.status === 'complete').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Garden Areas</h1>
          <p className="text-sm text-stone-500 mt-0.5">{complete} of {areas.length} concept areas complete</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
          <Plus className="w-4 h-4" /> New area
        </button>
      </div>

      {/* Progress */}
      {areas.length > 0 && (
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(complete / areas.length) * 100}%` }} />
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="font-bold text-lg mb-4">New concept area</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Area name *</label>
                <input className="input w-full" placeholder="e.g. Herb Garden"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Description</label>
                <textarea className="input w-full h-16 resize-none"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Location in garden</label>
                  <input className="input w-full" placeholder="e.g. South side"
                    value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Target completion</label>
                  <input type="month" className="input w-full"
                    value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Plants / what goes here</label>
                <input className="input w-full" placeholder="e.g. Za'atar, rosemary, sage, mint, parsley"
                  value={form.plants} onChange={e => setForm(f => ({ ...f, plants: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Notes</label>
                <textarea className="input w-full h-14 resize-none"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-stone-300 hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={!form.name}
                className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {areas.length === 0
        ? (
          <div className="text-center py-20 text-stone-400">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">No concept areas yet</p>
            <p className="text-sm">Create your first garden zone.</p>
          </div>
        )
        : (
          <div className="grid sm:grid-cols-2 gap-4">
            {areas.map(area => {
              const cfg = STATUS_CONFIG[area.status] ?? STATUS_CONFIG['planned']
              return (
                <div key={area.id} className={`bg-white rounded-xl border p-5 flex flex-col gap-3
                  ${area.status === 'complete' ? 'border-green-200' : 'border-stone-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-stone-900">{area.name}</h3>
                    <button onClick={() => remove(area.id)} className="text-stone-300 hover:text-red-500 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {area.description && <p className="text-sm text-stone-600">{area.description}</p>}

                  <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                    {area.location && <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">📍 {area.location}</span>}
                    {area.target_date && <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">🎯 {area.target_date}</span>}
                  </div>

                  {area.plants && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">Plants</p>
                      <p className="text-sm text-stone-700">{area.plants}</p>
                    </div>
                  )}

                  {area.notes && <p className="text-xs text-stone-400 italic">{area.notes}</p>}

                  {/* Status stepper */}
                  <div className="flex gap-1 mt-auto pt-2 border-t border-stone-100">
                    {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([s, c]) => (
                      <button key={s} onClick={() => setStatus(area, s)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${area.status === s ? c.color : 'text-stone-300 hover:bg-stone-50'}`}>
                        {c.icon}
                        <span className="hidden sm:inline">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
