'use client'

import { useState, useEffect } from 'react'
import { Plant, PlantType, SunRequirement } from '@/lib/types'
import { Plus, Trash2, Edit2, Droplets, Sun, MapPin } from 'lucide-react'

const PLANT_TYPES: PlantType[] = ['vegetable', 'herb', 'fruit', 'flower', 'tree', 'other']
const SUN_OPTIONS: SunRequirement[] = ['full sun', 'partial shade', 'full shade']

const emptyForm = {
  name: '', type: 'vegetable' as PlantType, variety: '', location: '',
  planted_date: '', sun_requirement: 'full sun' as SunRequirement,
  water_frequency_days: 3, water_amount_liters: '', notes: '',
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Plant | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const res = await fetch('/api/plants')
    setPlants(await res.json())
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(emptyForm); setEditing(null); setShowForm(true) }
  function openEdit(p: Plant) {
    setForm({
      name: p.name, type: p.type, variety: p.variety ?? '',
      location: p.location ?? '', planted_date: p.planted_date ?? '',
      sun_requirement: p.sun_requirement, water_frequency_days: p.water_frequency_days,
      water_amount_liters: p.water_amount_liters != null ? String(p.water_amount_liters) : '',
      notes: p.notes ?? '',
    })
    setEditing(p)
    setShowForm(true)
  }

  async function save() {
    const payload = {
      ...form,
      variety: form.variety || null,
      location: form.location || null,
      planted_date: form.planted_date || null,
      water_amount_liters: form.water_amount_liters ? parseFloat(form.water_amount_liters) : null,
      notes: form.notes || null,
    }
    if (editing) {
      await fetch(`/api/plants/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/plants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setShowForm(false)
    load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this plant and all its logs?')) return
    await fetch(`/api/plants/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Plants</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
          <Plus className="w-4 h-4" /> Add plant
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="font-bold text-lg mb-4">{editing ? 'Edit plant' : 'Add plant'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-stone-500 mb-1">Name *</label>
                <input className="input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Type</label>
                <select className="input w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PlantType }))}>
                  {PLANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Variety</label>
                <input className="input w-full" value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Location in garden</label>
                <input className="input w-full" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Planted date</label>
                <input type="date" className="input w-full" value={form.planted_date} onChange={e => setForm(f => ({ ...f, planted_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Sun requirement</label>
                <select className="input w-full" value={form.sun_requirement} onChange={e => setForm(f => ({ ...f, sun_requirement: e.target.value as SunRequirement }))}>
                  {SUN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Water every (days)</label>
                <input type="number" min={1} className="input w-full" value={form.water_frequency_days}
                  onChange={e => setForm(f => ({ ...f, water_frequency_days: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Water amount (liters)</label>
                <input type="number" min={0} step={0.5} className="input w-full" value={form.water_amount_liters}
                  placeholder="e.g. 5"
                  onChange={e => setForm(f => ({ ...f, water_amount_liters: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-stone-500 mb-1">Notes</label>
                <textarea className="input w-full h-20 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-stone-300 hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={!form.name} className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {plants.length === 0
        ? <p className="text-stone-400 text-center py-20">No plants yet — add your first one!</p>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    {p.variety && <p className="text-xs text-stone-500">{p.variety}</p>}
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full capitalize">{p.type}</span>
                </div>
                <div className="text-xs text-stone-500 flex flex-col gap-1">
                  {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3" />{p.sun_requirement}</span>
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />Every {p.water_frequency_days}d
                    {p.water_amount_liters != null ? ` · ${p.water_amount_liters}L` : ''}
                    {p.days_since_watered !== null && p.days_since_watered !== undefined
                      ? ` · Last: ${p.days_since_watered}d ago`
                      : ' · Never watered'}
                  </span>
                </div>
                {p.notes && <p className="text-xs text-stone-600 line-clamp-2">{p.notes}</p>}
                <div className="flex gap-2 mt-auto pt-2">
                  <button onClick={() => openEdit(p)} className="flex items-center gap-1 text-xs text-stone-500 hover:text-green-700">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => remove(p.id)} className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 ml-auto">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
