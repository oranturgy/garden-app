'use client'

import { useState, useEffect } from 'react'
import { Plant, PestLog, GardenArea } from '@/lib/types'
import { getCatalogForPlant, getCatalogForArea, InspectionItem } from '@/lib/inspectionCatalog'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, ClipboardCheck } from 'lucide-react'

export default function InspectPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [areas, setAreas] = useState<GardenArea[]>([])
  const [logs, setLogs] = useState<PestLog[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [busyKey, setBusyKey] = useState<string | null>(null)

  async function load() {
    const [p, a, l] = await Promise.all([
      fetch('/api/plants').then(r => r.json()),
      fetch('/api/areas').then(r => r.json()),
      fetch('/api/pests').then(r => r.json()),
    ])
    setPlants(Array.isArray(p) ? p : [])
    setAreas(Array.isArray(a) ? a : [])
    setLogs(Array.isArray(l) ? l : [])
  }

  useEffect(() => { load() }, [])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openFindingFor(plantId: number, key: string): PestLog | undefined {
    return logs.find(l => l.plant_id === plantId && l.catalog_key === key && !l.resolved)
  }

  function openCountFor(plantId: number): number {
    return logs.filter(l => l.plant_id === plantId && l.catalog_key && !l.resolved).length
  }

  async function markFound(plant: Plant, item: InspectionItem) {
    setBusyKey(`${plant.id}-${item.key}`)
    await fetch('/api/pests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plant_id: plant.id,
        pest_or_disease: item.title,
        severity: 'low',
        treatment: item.treatment,
        resolved: false,
        catalog_key: item.key,
      }),
    })
    await load()
    setBusyKey(null)
  }

  async function resolveFinding(logId: number) {
    setBusyKey(`resolve-${logId}`)
    await fetch(`/api/pests/${logId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true }),
    })
    await load()
    setBusyKey(null)
  }

  const totalOpen = logs.filter(l => l.catalog_key && !l.resolved).length
  const areasToShow = areas.filter(a => !plants.some(p => p.name.toLowerCase() === a.name.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Inspect</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {totalOpen === 0 ? 'No issues currently flagged' : `${totalOpen} issue${totalOpen === 1 ? '' : 's'} currently flagged`}
          </p>
        </div>
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Plants</h2>
      <div className="flex flex-col gap-3 mb-8">
        {plants.map(plant => {
          const id = `plant-${plant.id}`
          const isOpen = expanded.has(id)
          const catalog = getCatalogForPlant(plant)
          const openCount = openCountFor(plant.id)
          return (
            <div key={id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <button onClick={() => toggle(id)}
                className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-stone-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{plant.name}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full capitalize">{plant.type}</span>
                  {openCount > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> {openCount} flagged
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-stone-100 flex flex-col divide-y divide-stone-100">
                  {catalog.map(item => {
                    const finding = openFindingFor(plant.id, item.key)
                    const busy = busyKey === `${plant.id}-${item.key}` || (finding && busyKey === `resolve-${finding.id}`)
                    return (
                      <div key={item.key} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{item.symptoms}</p>
                          <p className="text-xs text-stone-600 mt-1"><span className="font-medium">Treatment:</span> {item.treatment}</p>
                        </div>
                        <div className="shrink-0">
                          {finding ? (
                            <button disabled={busy} onClick={() => resolveFinding(finding.id)}
                              className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-300 px-2 py-1 rounded-lg disabled:opacity-40 whitespace-nowrap">
                              <CheckCircle className="w-3 h-3" /> Found — Resolve
                            </button>
                          ) : (
                            <button disabled={busy} onClick={() => markFound(plant, item)}
                              className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 border border-amber-300 px-2 py-1 rounded-lg disabled:opacity-40 whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3" /> Mark found
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {plants.length === 0 && <p className="text-stone-400 text-center py-10">No plants yet.</p>}
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Garden Areas</h2>
      <div className="flex flex-col gap-3">
        {areasToShow.map(area => {
          const id = `area-${area.id}`
          const isOpen = expanded.has(id)
          const catalog = getCatalogForArea(area)
          return (
            <div key={id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <button onClick={() => toggle(id)}
                className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-stone-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{area.name}</span>
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full capitalize">{area.status}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-stone-100 p-4">
                  {area.status !== 'complete' ? (
                    <p className="text-sm text-stone-400 italic">Not planted yet — nothing to inspect.</p>
                  ) : catalog.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">No specific checks catalogued for this area yet.</p>
                  ) : (
                    <div className="flex flex-col divide-y divide-stone-100 -mx-4">
                      {catalog.map(item => (
                        <div key={item.key} className="px-4 py-3">
                          <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{item.symptoms}</p>
                          <p className="text-xs text-stone-600 mt-1"><span className="font-medium">Treatment:</span> {item.treatment}</p>
                          <p className="text-xs text-stone-400 mt-1 italic">Reference only — no matching plant record to attach a finding to yet.</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {areasToShow.length === 0 && (
          <div className="text-center py-10 text-stone-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No standalone areas to inspect.</p>
          </div>
        )}
      </div>
    </div>
  )
}
