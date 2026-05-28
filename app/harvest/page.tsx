'use client'

import { useState, useEffect } from 'react'
import { Plant, HarvestLog } from '@/lib/types'
import { Plus, Trash2, Apple } from 'lucide-react'

export default function HarvestPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [logs, setLogs] = useState<HarvestLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plant_id: '', harvested_at: '', quantity: '', notes: '' })

  async function load() {
    const [p, l] = await Promise.all([
      fetch('/api/plants').then(r => r.json()),
      fetch('/api/harvest').then(r => r.json()),
    ])
    setPlants(p)
    setLogs(l)
    if (p.length > 0 && !form.plant_id) setForm(f => ({ ...f, plant_id: String(p[0].id) }))
  }

  useEffect(() => { load() }, [])

  async function save() {
    await fetch('/api/harvest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plant_id: parseInt(form.plant_id),
        harvested_at: form.harvested_at ? new Date(form.harvested_at).toISOString() : new Date().toISOString(),
        quantity: form.quantity || null,
        notes: form.notes || null,
      }),
    })
    setShowForm(false)
    setForm({ plant_id: String(plants[0]?.id ?? ''), harvested_at: '', quantity: '', notes: '' })
    load()
  }

  async function remove(id: number) {
    await fetch(`/api/harvest/${id}`, { method: 'DELETE' })
    load()
  }

  const byPlant = logs.reduce<Record<string, HarvestLog[]>>((acc, l) => {
    const key = l.plant_name ?? 'Unknown'
    acc[key] = [...(acc[key] ?? []), l]
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Harvest</h1>
        <button onClick={() => setShowForm(true)} disabled={plants.length === 0}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-40">
          <Plus className="w-4 h-4" /> Log harvest
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Apple className="w-5 h-5 text-emerald-600" /> Log harvest</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Plant *</label>
                <select className="input w-full" value={form.plant_id} onChange={e => setForm(f => ({ ...f, plant_id: e.target.value }))}>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Date (leave blank for today)</label>
                <input type="datetime-local" className="input w-full" value={form.harvested_at}
                  onChange={e => setForm(f => ({ ...f, harvested_at: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Quantity / weight</label>
                <input className="input w-full" placeholder="e.g. 500g, 3 tomatoes, 1 basket" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Notes</label>
                <textarea className="input w-full h-16 resize-none" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-stone-300 hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={!form.plant_id}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(byPlant).length === 0
        ? <p className="text-stone-400 text-center py-20">No harvests logged yet.</p>
        : (
          <div className="flex flex-col gap-6">
            {Object.entries(byPlant).map(([plantName, entries]) => (
              <div key={plantName} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 border-b border-stone-200 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">{plantName}</span>
                  <span className="ml-auto text-xs text-stone-500">{entries.length} harvest{entries.length !== 1 ? 's' : ''}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-stone-500 font-medium text-xs">Date</th>
                      <th className="text-left px-4 py-2 text-stone-500 font-medium text-xs">Quantity</th>
                      <th className="text-left px-4 py-2 text-stone-500 font-medium text-xs">Notes</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {entries.map(l => (
                      <tr key={l.id} className="hover:bg-stone-50">
                        <td className="px-4 py-2 text-stone-500">{new Date(l.harvested_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2 font-medium">{l.quantity ?? '—'}</td>
                        <td className="px-4 py-2 text-stone-500">{l.notes ?? '—'}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => remove(l.id)} className="text-stone-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
