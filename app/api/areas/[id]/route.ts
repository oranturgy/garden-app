import { getDb, toObject } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/areas/[id]'>) {
  const { id } = await ctx.params
  const body = await request.json()
  const db = getDb()
  await db.execute({
    sql: `UPDATE garden_areas SET
            name        = COALESCE(?, name),
            description = COALESCE(?, description),
            location    = COALESCE(?, location),
            status      = COALESCE(?, status),
            target_date = COALESCE(?, target_date),
            plants      = COALESCE(?, plants),
            notes       = COALESCE(?, notes)
          WHERE id = ?`,
    args: [
      body.name ?? null, body.description ?? null, body.location ?? null,
      body.status ?? null, body.target_date ?? null,
      body.plants ?? null, body.notes ?? null, id,
    ],
  })
  const area = await db.execute({ sql: 'SELECT * FROM garden_areas WHERE id = ?', args: [id] })
  return Response.json(toObject(area))
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/areas/[id]'>) {
  const { id } = await ctx.params
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM garden_areas WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
