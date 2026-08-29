import { getDb, toObject } from '@/lib/db'
import { NextRequest } from 'next/server'

const HEAT_THRESHOLD_C = 37
const LATITUDE = 31.2372
const LONGITUDE = 34.3572

const WATERING_NOTES = `On any day the temperature exceeds 37C, your trees lose water much faster than normal through their leaves. The morning after a very hot day, give every tree an extra watering — double the usual amount. Banana: 40-50L. Papaya: 30-40L. Citrus trees: 25-30L. Mango: 20-25L. Apricot and Loquat: 15-20L. Signs a tree is heat-stressed: leaves curl inward like a taco, leaf tips turn brown and dry, new leaves look limp even in the morning. If you see these signs, water immediately regardless of schedule. A stressed tree is much more vulnerable to pests and disease.`

function monthWeekFor(date: Date): { month: string; week: number } {
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const week = Math.min(4, Math.ceil(date.getDate() / 7))
  return { month, week }
}

function getJerusalemHour(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: 'numeric',
    hourCycle: 'h23',
  })
  return parseInt(formatter.format(date), 10)
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=temperature_2m_max&past_days=1&forecast_days=1&timezone=Asia%2FJerusalem`
  const weatherRes = await fetch(url)
  if (!weatherRes.ok) {
    return Response.json({ error: 'Weather fetch failed' }, { status: 502 })
  }
  const weather = await weatherRes.json()

  // With past_days=1&forecast_days=1, daily arrays are [previous date, current date].
  // 18:00-23:59 Jerusalem time: today's max is already known, so check the current date.
  // 00:00-18:00: today's max isn't final yet, so check the previous date instead.
  const jerusalemHour = getJerusalemHour(new Date())
  const useCurrentDate = jerusalemHour >= 18
  const dayIndex = useCurrentDate ? 1 : 0

  const alertDate: string = weather.daily.time[dayIndex]
  const maxTemp: number = weather.daily.temperature_2m_max[dayIndex]

  if (maxTemp < HEAT_THRESHOLD_C) {
    return Response.json({ triggered: false, alertDate, maxTemp })
  }

  const db = getDb()

  try {
    await db.execute({
      sql: `INSERT INTO heat_alerts (alert_date, max_temp_c) VALUES (?, ?)`,
      args: [alertDate, maxTemp],
    })
  } catch {
    return Response.json({ triggered: false, alertDate, maxTemp, reason: 'already alerted for this date' })
  }

  const now = new Date()
  const { month, week } = monthWeekFor(now)

  const taskResult = await db.execute({
    sql: `INSERT INTO tasks (title, notes, category, month, week, done) VALUES (?, ?, ?, ?, ?, 0)`,
    args: [
      `🌡️ Hit ${maxTemp}°C ${useCurrentDate ? 'today' : 'yesterday'} — water extra deeply`,
      WATERING_NOTES,
      'watering',
      month,
      week,
    ],
  })

  const taskId = Number(taskResult.lastInsertRowid)
  await db.execute({ sql: `UPDATE heat_alerts SET task_id = ? WHERE alert_date = ?`, args: [taskId, alertDate] })

  const alert = await db.execute({ sql: 'SELECT * FROM heat_alerts WHERE alert_date = ?', args: [alertDate] })
  return Response.json({ triggered: true, alertDate, maxTemp, taskId, alert: toObject(alert) })
}
