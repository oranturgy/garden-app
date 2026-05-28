import { getDb, toObject } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  const { id } = await ctx.params
  const body = await request.json()
  const db = getDb()

  await db.execute({
    sql: `UPDATE tasks SET done = COALESCE(?, done), title = COALESCE(?, title) WHERE id = ?`,
    args: [body.done !== undefined ? (body.done ? 1 : 0) : null, body.title ?? null, id],
  })

  const task = await db.execute({ sql: 'SELECT * FROM tasks WHERE id = ?', args: [id] })
  return Response.json(toObject(task))
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  const { id } = await ctx.params
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM tasks WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
