'use client'

import type { Product, Category } from '@/types'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

const CATEGORY_ICONS: Record<string, string> = {
  'phones-tablets': '📱',
  'computing': '💻',
  'electronics': '📺',
  'fashion': '👗',
  'home-kitchen': '🏠',
  'beauty-health': '💄',
  'baby-products': '👶',
  'sports-outdoors': '⚽',
  'groceries': '🛒',
  'automotive': '🚗',
  'gaming': '🎮',
  'books-education': '📚',
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])

  const q = sp.get('q') || ''
  const category = sp.get('category') || ''
  const sort = sp.get('sort') || 'newest'
  const flashSale = sp.get('flashSale') === 'true'
  const featured = sp.get('featured') === 'true'
  const bestSeller = sp.get('bestSeller') === 'true'
  const minPrice = sp.get('minPrice') || ''
  const maxPrice = sp.get('maxPrice') || ''

  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updatePrice = (key: 'minPrice' | 'maxPrice', val: string) => {
    if (key === 'minPrice') setLocalMin(val)
    else setLocalMax(val)

    if (priceTimer.current) clearTimeout(priceTimer.current)

    priceTimer.current = setTimeout(() => {
      updateParam(key, val)
    }, 600)
  }

  const limit = 24

  useEffect(() => {
    const params = new URLSearchParams()

    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (sort !== 'newest') params.set('sort', sort)
    if (flashSale) params.set('flashSale', 'true')
    if (featured) params.set('featured', 'true')
    if (bestSeller) params.set('bestSeller', 'true')
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)

    params.set('page', String(page))
    params.set('limit', String(limit))

    setLoading(true)

    fetch(`/api/storefront/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.data || [])
        setTotal(d.pagination?.total || 0)
      })
      .finally(() => setLoading(false))
  }, [q, category, sort, flashSale, featured, bestSeller, minPrice, maxPrice, page])

  useEffect(() => {
    setLocalMin(minPrice)
    setLocalMax(maxPrice)
  }, [minPrice, maxPrice])

  useEffect(() => {
    fetch('/api/storefront/categories?limit=20')
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
  }, [])

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString())

    if (value) p.set(key, value)
    else p.delete(key)

    p.delete('page')
    router.push(`/search?${p}`)
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  const heading =
    q
      ? `Search results for "${q}"`
      : flashSale
      ? '⚡ Flash Sales'
      : featured
      ? '⭐ Featured Products'
      : bestSeller
      ? '🏆 Best Sellers'
      : category
      ? categories.find(c => c.slug === category)?.name || 'Products'
      : 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      {/* Sidebar */}
      <aside className="hidden lg:block w-56">
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="font-bold text-sm mb-3">Categories</h3>

          <button onClick={() => updateParam('category', '')}>All</button>

          {categories.map(cat => (
            <button key={cat.id} onClick={() => updateParam('category', cat.slug)}>
              {CATEGORY_ICONS[cat.slug]} {cat.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Products */}
      <div className="flex-1">
        <h1 className="text-xl font-bold mb-4">{heading}</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => {
              const rawPrice =
                p.isFlashSale && p.flashSalePrice
                  ? p.flashSalePrice
                  : p.price

              const price =
                typeof rawPrice === 'string'
                  ? Number(rawPrice)
                  : rawPrice ?? 0

              const compare =
                p.comparePrice
                  ? typeof p.comparePrice === 'string'
                    ? Number(p.comparePrice)
                    : p.comparePrice
                  : null

              const discount =
                compare ? Math.round((1 - price / compare) * 100) : null

              return (
                <div key={p.id} className="border p-3 rounded-xl">
                  <Link href={`/products/${p.slug}`}>
                    <div className="h-40 bg-gray-100 relative">
                      {p.images?.[0]?.url ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>
                          {p.category?.slug &&
                          CATEGORY_ICONS[p.category.slug]
                            ? CATEGORY_ICONS[p.category.slug]
                            : '📦'}
                        </span>
                      )}
                    </div>
                  </Link>

                  <p>{p.name}</p>

                  <p>₦{Number(price).toLocaleString()}</p>

                  {discount && <span>-{discount}%</span>}

                  <button
                    onClick={() => {
                      addItem({
                        id: p.id,
                        name: p.name,
                        price,
                        image: p.images?.[0]?.url || '',
                        slug: p.slug,
                      })
                      toast.success('Added to cart')
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SearchContent />
    </Suspense>
  )
}