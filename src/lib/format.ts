// src/lib/format.ts

export function normalizePrice(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0

  const num = typeof value === 'string' ? Number(value) : value

  return Number.isFinite(num) ? num : 0
}

export function formatCurrency(value: string | number | null | undefined) {
  const num = normalizePrice(value)

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(num)
}