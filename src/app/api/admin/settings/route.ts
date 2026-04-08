import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ['admin', 'super_admin'])
    const settings = await prisma.siteSetting.findMany()
    const map = Object.fromEntries(settings.map(s => [s.key, s.value]))
    return ok(map)
  } catch (err) { return handleError(err) }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['admin', 'super_admin'])
    const body = z.record(z.string()).parse(await req.json())

    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where:  { key },
          update: { value },
          create: { key, value },
        })
      )
    )

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'settings_update', entityType: 'site_settings', entityId: 'global', meta: body },
    })

    return ok({ message: 'Settings saved.' })
  } catch (err) { return handleError(err) }
}
