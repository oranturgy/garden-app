import { getDb, toObjects, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function GET() {
  const db = getDb()
  const result = await db.execute(`
    SELECT w.*, p.name AS plant_name
    FROM watering_logs w
    JOIN plants p ON p.id = w.plant_id
    ORDER BY w.watered_at DESC
    LIMIT 100
  `)
  return Response.json(toObjects(result))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({ notes: body.notes ?? null })

  const result = await db.execute({
    sql: 'INSERT INTO watering_logs (plant_id, watered_at, notes) VALUES (?, ?, ?)',
    args: [body.plant_id, body.watered_at ?? new Date().toISOString(), t.notes],
  })

  const log = await db.execute({
    sql: `SELECT w.*, p.name AS plant_name FROM watering_logs w
          JOIN plants p ON p.id = w.plant_id WHERE w.id = ?`,
    args: [Number(result.lastInsertRowid)],
  })
  return Response.json(toObject(log), { status: 201 })
}
