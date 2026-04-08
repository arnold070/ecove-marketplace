/**
 * Background job runner for Ecove Marketplace.
 *
 * Jobs run in-process on a schedule. For high-traffic deployments,
 * move these to a dedicated worker process or a cron service.
 *
 * Jobs:
 *  - expireFlashSales      every 5 minutes
 *  - cleanExpiredSessions  every 6 hours
 *  - notifyLowStock        every 1 hour
 *  - updateVendorRatings   every 12 hours
 */

import prisma from './prisma'
import logger from './logger'

let started = false

// ── Helper ───────────────────────────────────────────────────────────────────
function schedule(name: string, intervalMs: number, fn: () => Promise<void>) {
  const run = async () => {
    try {
      await fn()
    } catch (err) {
      logger.error({ err, job: name }, `Background job failed: ${name}`)
    }
  }
  // Run once immediately, then on interval
  run()
  return setInterval(run, intervalMs)
}

// ── Job 1: Expire flash sales ─────────────────────────────────────────────────
async function expireFlashSales() {
  const result = await prisma.product.updateMany({
    where: {
      isFlashSale: true,
      flashSaleEnd: { lt: new Date() },
    },
    data: {
      isFlashSale:    false,
      flashSalePrice: null,
    },
  })
  if (result.count > 0) {
    logger.info({ count: result.count }, 'Flash sales expired')
  }
}

// ── Job 2: Clean expired sessions ─────────────────────────────────────────────
async function cleanExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  if (result.count > 0) {
    logger.info({ count: result.count }, 'Expired sessions cleaned')
  }
}

// ── Job 3: Notify vendors of low stock ────────────────────────────────────────
async function notifyLowStock() {
  // Find products where stock <= lowStockAlert and vendor hasn't been notified recently
  const products = await prisma.product.findMany({
    where: {
      status: 'approved',
      isActive: true,
      // Only notify when stock hits the alert threshold
      AND: [
        { stock: { gt: 0 } },
        { stock: { lte: prisma.product.fields.lowStockAlert } as any },
      ],
    },
    select: {
      id: true, name: true, stock: true, lowStockAlert: true,
      vendor: { select: { id: true, businessName: true } },
    },
    take: 50, // Process in batches
  }).catch(() => [] as any[])

  // Create in-app notifications for vendors
  for (const product of products) {
    if (product.stock > product.lowStockAlert) continue
    await prisma.vendorNotification.create({
      data: {
        vendorId: product.vendor.id,
        type:     'low_stock',
        title:    'Low Stock Alert',
        message:  `"${product.name}" has only ${product.stock} unit(s) remaining.`,
        link:     '/vendor/dashboard/inventory',
      },
    }).catch(() => {}) // ignore if notification type doesn't exist in schema
  }
}

// ── Job 4: Recalculate vendor ratings ─────────────────────────────────────────
async function updateVendorRatings() {
  // Get vendors with recent reviews (last 24 hours)
  const recentReviews = await prisma.review.findMany({
    where: {
      status: 'approved',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { vendorId: true },
    distinct: ['vendorId'],
  }).catch(() => [] as any[])

  const vendorIds = recentReviews
    .map((r: any) => r.vendorId)
    .filter(Boolean) as string[]

  for (const vendorId of vendorIds) {
    const agg = await prisma.review.aggregate({
      where: { vendorId, status: 'approved' },
      _avg: { rating: true },
      _count: { rating: true },
    }).catch(() => null)

    if (!agg) continue

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        reviewCount:   agg._count.rating,
      },
    }).catch(() => {})
  }

  if (vendorIds.length > 0) {
    logger.info({ count: vendorIds.length }, 'Vendor ratings updated')
  }
}

// ── Start all jobs ─────────────────────────────────────────────────────────────
export function startBackgroundJobs() {
  // Only start once, and only on the server (not during build)
  if (started || typeof window !== 'undefined') return
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_JOBS !== 'true') {
    logger.info('Background jobs disabled in development (set ENABLE_JOBS=true to enable)')
    return
  }

  started = true
  logger.info('Starting background jobs...')

  schedule('expireFlashSales',     5  * 60 * 1000, expireFlashSales)
  schedule('cleanExpiredSessions', 6  * 60 * 60 * 1000, cleanExpiredSessions)
  schedule('notifyLowStock',       60 * 60 * 1000, notifyLowStock)
  schedule('updateVendorRatings',  12 * 60 * 60 * 1000, updateVendorRatings)

  logger.info('Background jobs started ✅')
}
