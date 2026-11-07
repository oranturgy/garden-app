import { getDb, initSchema, toObject, toObjects } from '@/lib/db'
import { addDays, HEAVY_SKIP_DAYS, jerusalemToday, plantGetsCredit, rainTier, tierRank, type RainTier } from '@/lib/rain'
import { NextRequest } from 'next/server'

const LATITUDE = 31.2372
const LONGITUDE = 34.3572

function getJerusalemHour(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', hour: 'numeric', hourCycle: 'h23' })
  return parseInt(formatter.format(date), 10)
}

// Runs twice a day:
//  - evening (~18:00 Israel): TODAY's rain so far, so the plan is right before the evening watering
//  - morning (~06:00 Israel): YESTERDAY's final total. If the evening run already handled that date,
//    it only upgrades (e.g. light → moderate after more rain overnight) — the same rain is never counted twice.
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
  const run = getJerusalemHour(new Date()) >= 12 ? 'evening' : 'morning'
  const dayIndex = run === 'evening' ? 1 : 0
  const rainDate: string = weather.daily.time[dayIndex]
  const rainMm: number = Number(weather.daily.precipitation_sum[dayIndex] ?? 0)
  const tier = rainTier(rainMm)

  if (!tier) {
    return Response.json({ triggered: false, run, rainDate, rainMm })
  }

  await initSchema()
  const db = getDb()

  const existing = toObject(await db.execute({
    sql: 'SELECT * FROM rain_events WHERE rain_date = ?',
    args: [rainDate],
  })) as { tier: RainTier; rain_mm: number; skip_until: string | null; plants_credited: string | null } | null

  const previousTier: RainTier | null = existing ? existing.tier : null
  if (existing && tierRank(tier) <= tierRank(existing.tier)) {
    if (rainMm > Number(existing.rain_mm)) {
      await db.execute({ sql: 'UPDATE rain_events SET rain_mm = ? WHERE rain_date = ?', args: [rainMm, rainDate] })
    }
    return Response.json({ triggered: false, run, rainDate, rainMm, tier, reason: 'already handled for this date' })
  }

  const today = jerusalemToday()
  const skipUntil = tier === 'heavy' ? addDays(today, HEAVY_SKIP_DAYS) : null

  const candidates = toObjects(await db.execute(
    `SELECT id, name, water_frequency_days FROM plants WHERE auto_watered = 0 AND rain_exposed = 1`
  )) as Array<{ id: number; name: string; water_frequency_days: number }>

  const qualifying = candidates.filter(p => plantGetsCredit(tier, Number(p.water_frequency_days)))
  // On an upgrade, plants already credited for this date don't get a second watering log
  const newlyCredited = qualifying.filter(p =>
    !previousTier || !plantGetsCredit(previousTier, Number(p.water_frequency_days))
  )

  const note = `🌧️ Rain ${rainMm} mm on ${rainDate} (auto)`
  const now = new Date().toISOString()
  for (const p of newlyCredited) {
    await db.execute({
      sql: 'INSERT INTO watering_logs (plant_id, watered_at, notes) VALUES (?, ?, ?)',
      args: [p.id, now, note],
    })
  }
  if (skipUntil) {
    for (const p of qualifying) {
      await db.execute({
        sql: `UPDATE plants SET rain_skip_until = ? WHERE id = ? AND (rain_skip_until IS NULL OR rain_skip_until < ?)`,
        args: [skipUntil, p.id, skipUntil],
      })
    }
  }

  const names = qualifying.map(p => p.name).join(', ')
  if (existing) {
    await db.execute({
      sql: 'UPDATE rain_events SET rain_mm = ?, tier = ?, skip_until = ?, plants_credited = ? WHERE rain_date = ?',
      args: [rainMm, tier, skipUntil, names, rainDate],
    })
  } else {
    await db.execute({
      sql: 'INSERT INTO rain_events (rain_date, rain_mm, tier, skip_until, plants_credited) VALUES (?, ?, ?, ?, ?)',
      args: [rainDate, rainMm, tier, skipUntil, names],
    })
  }

  return Response.json({
    triggered: true, run, rainDate, rainMm, tier, previousTier, skipUntil,
    credited: newlyCredited.map(p => p.name),
  })
}
