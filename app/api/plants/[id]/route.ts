import { getDb, toObject } from '@/lib/db'
import { translateFields } from '@/lib/translate'
import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/plants/[id]'>) {
  const { id } = await ctx.params
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT * FROM plants WHERE id = ?', args: [id] })
  const plant = toObject(result)
  if (!plant) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(plant)
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/plants/[id]'>) {
  const { id } = await ctx.params
  const body = await request.json()
  const db = getDb()

  const t = await translateFields({
    name: body.name,
    variety: body.variety ?? null,
    location: body.location ?? null,
    notes: body.notes ?? null,
  })

  await db.execute({
    sql: `UPDATE plants SET name=?, type=?, variety=?, location=?, planted_date=?,
          sun_requirement=?, water_frequency_days=?, water_amount_liters=?, auto_watered=?, notes=? WHERE id=?`,
    args: [
      t.name, body.type, t.variety, t.location,
      body.planted_date ?? null, body.sun_requirement,
      body.water_frequency_days, body.water_amount_liters ?? null,
      body.auto_watered ? 1 : 0, t.notes, id,
    ],
  })

  const result = await db.execute({ sql: 'SELECT * FROM plants WHERE id = ?', args: [id] })
  return Response.json(toObject(result))
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/plants/[id]'>) {
  const { id } = await ctx.params
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM plants WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
