import { getDb, toObjects, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function GET() {
  const db = getDb()
  const result = await db.execute(`
    SELECT hl.*, p.name AS plant_name
    FROM harvest_logs hl
    JOIN plants p ON p.id = hl.plant_id
    ORDER BY hl.harvested_at DESC
  `)
  return Response.json(toObjects(result))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({
    quantity: body.quantity ?? null,
    notes: body.notes ?? null,
  })

  const result = await db.execute({
    sql: 'INSERT INTO harvest_logs (plant_id, harvested_at, quantity, notes) VALUES (?, ?, ?, ?)',
    args: [body.plant_id, body.harvested_at ?? new Date().toISOString(), t.quantity, t.notes],
  })

  const log = await db.execute({
    sql: `SELECT hl.*, p.name AS plant_name FROM harvest_logs hl
          JOIN plants p ON p.id = hl.plant_id WHERE hl.id = ?`,
    args: [Number(result.lastInsertRowid)],
  })
  return Response.json(toObject(log), { status: 201 })
}
