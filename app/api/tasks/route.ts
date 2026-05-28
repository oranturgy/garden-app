import { getDb, toObjects, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get('month')
  const db = getDb()
  const result = await db.execute({
    sql: `SELECT * FROM tasks WHERE month = ? ORDER BY week ASC, done ASC, id ASC`,
    args: [month ?? new Date().toISOString().slice(0, 7)],
  })
  return Response.json(toObjects(result))
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({
    title: body.title,
    notes: body.notes ?? null,
  })

  const result = await db.execute({
    sql: `INSERT INTO tasks (title, notes, category, month, week, done) VALUES (?, ?, ?, ?, ?, 0)`,
    args: [t.title, t.notes, body.category ?? 'general', body.month, body.week ?? null],
  })

  const task = await db.execute({ sql: 'SELECT * FROM tasks WHERE id = ?', args: [Number(result.lastInsertRowid)] })
  return Response.json(toObject(task), { status: 201 })
}
