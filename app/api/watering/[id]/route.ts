import { getDb } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/watering/[id]'>) {
  const { id } = await ctx.params
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM watering_logs WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
