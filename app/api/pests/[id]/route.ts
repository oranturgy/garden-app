import { getDb, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/pests/[id]'>) {
  const { id } = await ctx.params
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({
    pest_or_disease: body.pest_or_disease ?? null,
    treatment: body.treatment ?? null,
    notes: body.notes ?? null,
  })

  await db.execute({
    sql: `UPDATE pest_logs SET
            pest_or_disease = COALESCE(?, pest_or_disease),
            severity        = COALESCE(?, severity),
            treatment       = COALESCE(?, treatment),
            resolved        = COALESCE(?, resolved),
            notes           = COALESCE(?, notes)
          WHERE id = ?`,
    args: [
      t.pest_or_disease,
      body.severity ?? null,
      t.treatment,
      body.resolved !== undefined ? (body.resolved ? 1 : 0) : null,
      t.notes,
      id,
    ],
  })

  const log = await db.execute({
    sql: `SELECT pl.*, p.name AS plant_name FROM pest_logs pl
          JOIN plants p ON p.id = pl.plant_id WHERE pl.id = ?`,
    args: [id],
  })
  return Response.json(toObject(log))
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/pests/[id]'>) {
  const { id } = await ctx.params
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM pest_logs WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
