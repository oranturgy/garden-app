import { getDb, toObjects, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function GET() {
  const db = getDb()
  const result = await db.execute(`
    SELECT pl.*, p.name AS plant_name
    FROM pest_logs pl
    JOIN plants p ON p.id = pl.plant_id
    ORDER BY pl.observed_at DESC
  `)
  return Response.json(toObjects(result))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({
    pest_or_disease: body.pest_or_disease,
    treatment: body.treatment ?? null,
    notes: body.notes ?? null,
  })

  const result = await db.execute({
    sql: `INSERT INTO pest_logs (plant_id, observed_at, pest_or_disease, severity, treatment, resolved, notes, catalog_key)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      body.plant_id, body.observed_at ?? new Date().toISOString(),
      t.pest_or_disease, body.severity ?? 'low',
      t.treatment, body.resolved ? 1 : 0, t.notes, body.catalog_key ?? null,
    ],
  })

  const log = await db.execute({
    sql: `SELECT pl.*, p.name AS plant_name FROM pest_logs pl
          JOIN plants p ON p.id = pl.plant_id WHERE pl.id = ?`,
    args: [Number(result.lastInsertRowid)],
  })
  return Response.json(toObject(log), { status: 201 })
}
