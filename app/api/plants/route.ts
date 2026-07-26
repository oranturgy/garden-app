import { getDb, toObjects, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function GET() {
  const db = getDb()
  const result = await db.execute(`
    SELECT p.*,
      (SELECT watered_at FROM watering_logs WHERE plant_id = p.id ORDER BY watered_at DESC LIMIT 1) AS last_watered,
      CAST(ROUND((julianday('now') - julianday(
        (SELECT watered_at FROM watering_logs WHERE plant_id = p.id ORDER BY watered_at DESC LIMIT 1)
      ))) AS INTEGER) AS days_since_watered
    FROM plants p
    ORDER BY p.name ASC
  `)
  return Response.json(toObjects(result))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({
    name: body.name,
    variety: body.variety ?? null,
    location: body.location ?? null,
    notes: body.notes ?? null,
  })

  const result = await db.execute({
    sql: `INSERT INTO plants (name, type, variety, location, planted_date, sun_requirement, water_frequency_days, water_amount_liters, auto_watered, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      t.name, body.type ?? 'other', t.variety, t.location,
      body.planted_date ?? null, body.sun_requirement ?? 'full sun',
      body.water_frequency_days ?? 3, body.water_amount_liters ?? null,
      body.auto_watered ? 1 : 0, t.notes,
    ],
  })

  const plant = await db.execute({ sql: 'SELECT * FROM plants WHERE id = ?', args: [Number(result.lastInsertRowid)] })
  return Response.json(toObject(plant), { status: 201 })
}
