import { getDb, toObjects, initSchema } from '@/lib/db'
import Link from 'next/link'
import { Sprout, Droplets, Bug, Apple, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await initSchema()
  const db = getDb()

  const [plantsResult, wateringResult, pestsResult, needsWaterResult] = await Promise.all([
    db.execute('SELECT COUNT(*) AS n FROM plants'),
    db.execute(`
      SELECT w.*, p.name AS plant_name FROM watering_logs w
      JOIN plants p ON p.id = w.plant_id
      ORDER BY w.watered_at DESC LIMIT 5
    `),
    db.execute(`
      SELECT pl.*, p.name AS plant_name FROM pest_logs pl
      JOIN plants p ON p.id = pl.plant_id
      WHERE pl.resolved = 0
      ORDER BY pl.observed_at DESC
    `),
    db.execute(`
      SELECT name, water_frequency_days, days_since FROM (
        SELECT p.name, p.water_frequency_days,
          CAST(ROUND((julianday('now') - julianday(
            (SELECT watered_at FROM watering_logs WHERE plant_id = p.id ORDER BY watered_at DESC LIMIT 1)
          ))) AS INTEGER) AS days_since
        FROM plants p
        WHERE p.auto_watered = 0
      )
      WHERE days_since >= water_frequency_days OR days_since IS NULL
      ORDER BY days_since DESC
      LIMIT 9
    `),
  ])

  const plantCount = Number((plantsResult.rows[0] as unknown as Record<string, unknown>)['n'] ?? 0)
  const recentWatering = toObjects(wateringResult) as Array<{ id: number; plant_name: string; watered_at: string }>
  const openPests = toObjects(pestsResult) as Array<{ id: number; plant_name: string; pest_or_disease: string; severity: string }>
  const needsWater = toObjects(needsWaterResult) as Array<{ name: string; water_frequency_days: number; days_since: number | null }>

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-6">Garden Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Sprout className="w-6 h-6 text-green-600" />} label="Plants" value={plantCount} href="/plants" />
        <StatCard icon={<Bug className="w-6 h-6 text-amber-600" />} label="Open pest issues" value={openPests.length} href="/pests" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" /> Needs watering
          </h2>
          {needsWater.length === 0
            ? <p className="text-sm text-stone-400">All plants are watered.</p>
            : <ul className="space-y-2">
                {needsWater.map(p => (
                  <li key={p.name} className="flex justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-stone-500">
                      {p.days_since === null ? 'Never watered' : `${p.days_since}d ago (every ${p.water_frequency_days}d)`}
                    </span>
                  </li>
                ))}
              </ul>
          }
          <Link href="/watering" className="mt-3 inline-block text-xs text-green-700 hover:underline">Log watering →</Link>
        </section>

        <section className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Open pest issues
          </h2>
          {openPests.length === 0
            ? <p className="text-sm text-stone-400">No active pest issues.</p>
            : <ul className="space-y-2">
                {openPests.map(p => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="font-medium">{p.plant_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.severity === 'high' ? 'bg-red-100 text-red-700' :
                      p.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>{p.pest_or_disease}</span>
                  </li>
                ))}
              </ul>
          }
          <Link href="/pests" className="mt-3 inline-block text-xs text-green-700 hover:underline">Manage pests →</Link>
        </section>

        <section className="bg-white rounded-xl border border-stone-200 p-5 sm:col-span-2">
          <h2 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <Apple className="w-4 h-4 text-emerald-500" /> Recent watering
          </h2>
          {recentWatering.length === 0
            ? <p className="text-sm text-stone-400">No watering logs yet.</p>
            : <ul className="divide-y divide-stone-100">
                {recentWatering.map(w => (
                  <li key={w.id} className="py-2 flex justify-between text-sm">
                    <span className="font-medium">{w.plant_name}</span>
                    <span className="text-stone-500">{new Date(w.watered_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
          }
        </section>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3 hover:border-green-400 transition-colors">
      {icon}
      <div>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
        <p className="text-xs text-stone-500">{label}</p>
      </div>
    </Link>
  )
}
