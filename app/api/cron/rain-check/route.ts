import { getDb, initSchema, toObjects } from '@/lib/db'
import { addDays, HEAVY_SKIP_DAYS, jerusalemToday, plantGetsCredit, rainTier } from '@/lib/rain'
import { NextRequest } from 'next/server'

const LATITUDE = 31.2372
const LONGITUDE = 34.3572

// Runs every morning: looks at YESTERDAY's total rain (a full day, so the total is final)
// and adjusts the manual watering plan by logging the rain as a watering.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=precipitation_sum&past_days=1&forecast_days=1&timezone=Asia%2FJerusalem`
  const weatherRes = await fetch(url)
  if (!weatherRes.ok) {
    return Response.json({ error: 'Weather fetch failed' }, { status: 502 })
  }
  const weather = await weatherRes.json()

  // daily arrays are [yesterday, today]
  const rainDate: string = weather.daily.time[0]
  const rainMm: number = Number(weather.daily.precipitation_sum[0] ?? 0)
  const tier = rainTier(rainMm)

  if (!tier) {
    return Response.json({ triggered: false, rainDate, rainMm })
  }

  await initSchema()
  const db = getDb()

  const today = jerusalemToday()
  const skipUntil = tier === 'heavy' ? addDays(today, HEAVY_SKIP_DAYS) : null

  try {
    await db.execute({
      sql: `INSERT INTO rain_events (rain_date, rain_mm, tier, skip_until) VALUES (?, ?, ?, ?)`,
      args: [rainDate, rainMm, tier, skipUntil],
    })
  } catch {
    return Response.json({ triggered: false, rainDate, rainMm, reason: 'already processed for this date' })
  }

  const candidates = toObjects(await db.execute(
    `SELECT id, name, water_frequency_days FROM plants WHERE auto_watered = 0 AND rain_exposed = 1`
  )) as Array<{ id: number; name: string; water_frequency_days: number }>

  const credited = candidates.filter(p => plantGetsCredit(tier, Number(p.water_frequency_days)))
  const note = `🌧️ Rain ${rainMm} mm on ${rainDate} (auto)`
  const now = new Date().toISOString()

  for (const p of credited) {
    await db.execute({
      sql: 'INSERT INTO watering_logs (plant_id, watered_at, notes) VALUES (?, ?, ?)',
      args: [p.id, now, note],
    })
    if (skipUntil) {
      await db.execute({
        sql: `UPDATE plants SET rain_skip_until = ? WHERE id = ? AND (rain_skip_until IS NULL OR rain_skip_until < ?)`,
        args: [skipUntil, p.id, skipUntil],
      })
    }
  }

  const names = credited.map(p => p.name)
  await db.execute({
    sql: `UPDATE rain_events SET plants_credited = ? WHERE rain_date = ?`,
    args: [names.join(', '), rainDate],
  })

  return Response.json({ triggered: true, rainDate, rainMm, tier, skipUntil, credited: names })
}
