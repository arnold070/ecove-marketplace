import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

const hasDatabaseUrl = !!process.env.DATABASE_URL

const prisma: PrismaClient = hasDatabaseUrl
  ? (globalThis.__prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      }))
  : (new Proxy(
      {},
      {
        get() {
          throw new Error('DATABASE_URL is not set')
        },
      }
    ) as unknown as PrismaClient)

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma

export default prisma
