'use client'

import { useState, useEffect } from 'react'
import { Plant, WateringLog } from '@/lib/types'
import { Plus, Trash2, Droplets } from 'lucide-react'

export default function WateringPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [logs, setLogs] = useState<WateringLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plant_id: '', watered_at: '', notes: '' })

  async function load() {
    const [p, l] = await Promise.all([
      fetch('/api/plants').then(r => r.json()),
      fetch('/api/watering').then(r => r.json()),
    ])
    setPlants(p)
    setLogs(l)
    if (p.length > 0 && !form.plant_id) setForm(f => ({ ...f, plant_id: String(p[0].id) }))
  }

  useEffect(() => { load() }, [])

  async function save() {
    await fetch('/api/watering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plant_id: parseInt(form.plant_id),
        watered_at: form.watered_at ? new Date(form.watered_at).toISOString() : new Date().toISOString(),
        notes: form.notes || null,
      }),
    })
    setShowForm(false)
    setForm({ plant_id: String(plants[0]?.id ?? ''), watered_at: '', notes: '' })
    load()
  }

  async function remove(id: number) {
    await fetch(`/api/watering/${id}`, { method: 'DELETE' })
    load()
  }

  const needsWater = plants.filter(p =>
    p.days_since_watered === null || p.days_since_watered === undefined ||
    p.days_since_watered >= p.water_frequency_days
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Watering</h1>
        <button onClick={() => setShowForm(true)} disabled={plants.length === 0}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">
          <Plus className="w-4 h-4" /> Log watering
        </button>
      </div>

      {needsWater.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
            <Droplets className="w-4 h-4" /> Plants that need water
          </p>
          <div className="flex flex-wrap gap-2">
            {needsWater.map(p => (
              <button key={p.id} onClick={() => {
                setForm({ plant_id: String(p.id), watered_at: '', notes: '' })
                setShowForm(true)
              }} className="text-xs bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">
                {p.name} {p.days_since_watered !== null && p.days_since_watered !== undefined ? `(${p.days_since_watered}d ago)` : '(never)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Log watering</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Plant *</label>
                <select className="input w-full" value={form.plant_id} onChange={e => setForm(f => ({ ...f, plant_id: e.target.value }))}>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Date & time (leave blank for now)</label>
                <input type="datetime-local" className="input w-full" value={form.watered_at}
                  onChange={e => setForm(f => ({ ...f, watered_at: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Notes</label>
                <input className="input w-full" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-stone-300 hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={!form.plant_id} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Plant</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-stone-600 font-medium">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {logs.length === 0
              ? <tr><td colSpan={4} className="text-center py-12 text-stone-400">No watering logs yet.</td></tr>
              : logs.map(l => (
                  <tr key={l.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium">{l.plant_name}</td>
                    <td className="px-4 py-3 text-stone-500">{new Date(l.watered_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-stone-500">{l.notes ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(l.id)} className="text-stone-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
