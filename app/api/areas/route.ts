import { getDb, toObjects, toObject } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET() {
  const db = getDb()
  const result = await db.execute('SELECT * FROM garden_areas ORDER BY created_at ASC')
  return Response.json(toObjects(result))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const db = getDb()
  const result = await db.execute({
    sql: `INSERT INTO garden_areas (name, description, location, status, target_date, plants, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      body.name, body.description ?? null, body.location ?? null,
      body.status ?? 'planned', body.target_date ?? null,
      body.plants ?? null, body.notes ?? null,
    ],
  })
  const area = await db.execute({ sql: 'SELECT * FROM garden_areas WHERE id = ?', args: [Number(result.lastInsertRowid)] })
  return Response.json(toObject(area), { status: 201 })
}
