'use client'

import { useState, useEffect } from 'react'
import { Plant, PestLog, Severity } from '@/lib/types'
import { Plus, Trash2, CheckCircle } from 'lucide-react'

const SEVERITIES: Severity[] = ['low', 'medium', 'high']

const emptyForm = {
  plant_id: '', observed_at: '', pest_or_disease: '',
  severity: 'low' as Severity, treatment: '', resolved: false, notes: '',
}

export default function PestsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [logs, setLogs] = useState<PestLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open')
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function load() {
    try {
      const [p, l] = await Promise.all([
        fetch('/api/plants').then(r => r.json()),
        fetch('/api/pests').then(r => r.json()),
      ])
      setPlants(Array.isArray(p) ? p : [])
      setLogs(Array.isArray(l) ? l : [])
      if (Array.isArray(p) && p.length > 0 && !form.plant_id) setForm(f => ({ ...f, plant_id: String(p[0].id) }))
    } catch (e) {
      setSaveMsg({ ok: false, text: `Failed to load: ${e}` })
    }
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaveMsg(null)
    try {
      const res = await fetch('/api/pests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant_id: parseInt(form.plant_id),
          observed_at: form.observed_at ? new Date(form.observed_at).toISOString() : new Date().toISOString(),
          pest_or_disease: form.pest_or_disease,
          severity: form.severity,
          treatment: form.treatment || null,
          resolved: form.resolved,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        setSaveMsg({ ok: false, text: `Error ${res.status}: ${body}` })
        return
      }
      setShowForm(false)
      setForm({ ...emptyForm, plant_id: String(plants[0]?.id ?? '') })
      setSaveMsg({ ok: true, text: 'Saved!' })
      load()
    } catch (e) {
      setSaveMsg({ ok: false, text: `Network error: ${e}` })
    }
  }

  async function resolve(id: number) {
    await fetch(`/api/pests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true }),
    })
    load()
  }

  async function remove(id: number) {
    await fetch(`/api/pests/${id}`, { method: 'DELETE' })
    load()
  }

  const displayed = logs.filter(l =>
    filter === 'all' ? true :
    filter === 'open' ? !l.resolved :
    !!l.resolved
  )

  const severityColor = (s: string) =>
    s === 'high' ? 'bg-red-100 text-red-700' :
    s === 'medium' ? 'bg-amber-100 text-amber-700' :
    'bg-yellow-50 text-yellow-700'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Pests & Disease</h1>
        <button onClick={() => setShowForm(true)} disabled={plants.length === 0}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-40">
          <Plus className="w-4 h-4" /> Log issue
        </button>
      </div>

      {saveMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMsg.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {saveMsg.text}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(['open', 'resolved', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}>{f}</button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Log pest / disease issue</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Plant *</label>
                <select className="input w-full" value={form.plant_id} onChange={e => setForm(f => ({ ...f, plant_id: e.target.value }))}>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Pest or disease *</label>
                <input className="input w-full" placeholder="e.g. Aphids, powdery mildew…" value={form.pest_or_disease}
                  onChange={e => setForm(f => ({ ...f, pest_or_disease: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Severity</label>
                  <select className="input w-full" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as Severity }))}>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Observed</label>
                  <input type="datetime-local" className="input w-full" value={form.observed_at}
                    onChange={e => setForm(f => ({ ...f, observed_at: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Treatment applied</label>
                <input className="input w-full" placeholder="e.g. Neem oil spray" value={form.treatment}
                  onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Notes</label>
                <textarea className="input w-full h-16 resize-none" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.resolved} onChange={e => setForm(f => ({ ...f, resolved: e.target.checked }))} />
                Already resolved
              </label>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-stone-300 hover:bg-stone-50">Cancel</button>
              <button onClick={save} disabled={!form.plant_id || !form.pest_or_disease}
                className="px-4 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayed.length === 0
          ? <p className="text-stone-400 text-center py-16">No issues found.</p>
          : displayed.map(l => (
            <div key={l.id} className={`bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${l.resolved ? 'border-stone-200 opacity-70' : 'border-amber-200'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{l.plant_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(l.severity)}`}>{l.severity}</span>
                  {l.resolved ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">resolved</span> : null}
                </div>
                <p className="text-sm font-semibold mt-0.5">{l.pest_or_disease}</p>
                {l.treatment && <p className="text-xs text-stone-500 mt-0.5">Treatment: {l.treatment}</p>}
                {l.notes && <p className="text-xs text-stone-400 mt-0.5">{l.notes}</p>}
                <p className="text-xs text-stone-400 mt-1">{new Date(l.observed_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                {!l.resolved && (
                  <button onClick={() => resolve(l.id)} className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-300 px-2 py-1 rounded-lg">
                    <CheckCircle className="w-3 h-3" /> Resolve
                  </button>
                )}
                <button onClick={() => remove(l.id)} className="text-stone-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
