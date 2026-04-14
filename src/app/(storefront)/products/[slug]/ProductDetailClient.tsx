'use client'
import { formatCurrency } from '@/lib/format'
import type { Product, ProductVariant } from '@/types'
import { useState } from 'react'
import Link from 'next/link'
import { useCart, useWishlist } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/apiClient'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

/* ---------------- REVIEW FORM ---------------- */
function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = useMutation({
    mutationFn: () => api.post('/reviews', { productId, rating, title, body }),
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Review submitted! It will appear after moderation.')
    },
  })

  if (!user) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-gray-50 text-center">
        <p className="text-sm text-gray-600">
          <a href="/login" className="text-orange-500 font-semibold hover:underline">
            Sign in
          </a>{' '}
          to write a review
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-green-50 text-center">
        <p className="text-sm text-green-700 font-semibold">
          ✅ Thanks! Your review has been submitted for moderation.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h4 className="font-bold text-sm text-gray-800 mb-4">Write a Review</h4>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            className="text-2xl"
          >
            <span className={star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}>
              ★
            </span>
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full px-3 py-2 border rounded-xl mb-3"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write review..."
        rows={3}
        className="w-full px-3 py-2 border rounded-xl mb-3"
      />

      <button
        onClick={() => {
          if (rating === 0) return toast.error('Select rating')
          submit.mutate()
        }}
        disabled={submit.isPending || rating === 0}
        className="px-5 py-2 rounded-xl text-white font-bold"
        style={{ background: '#f68b1f' }}
      >
        {submit.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  )
}

/* ---------------- TABS ---------------- */
function ProductTabs({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')

  return (
    <div className="mt-12 bg-white rounded-2xl border">
      <div className="flex gap-6 border-b px-6">
        {['description', 'specs', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-4 text-sm font-bold ${
              activeTab === tab ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'description' && <p>{product.description}</p>}

        {activeTab === 'specs' && (
          <div>
            {product.specifications &&
              Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-2">
                  <span className="font-semibold">{k}</span>
                  <span>{String(v)}</span>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {product.reviews?.map((r: any) => (
              <div key={r.id} className="border-b py-3">
                <p className="font-bold text-sm">{r.title}</p>
                <p className="text-sm text-gray-600">{r.body}</p>
              </div>
            ))}

            <ReviewForm productId={product.id} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function ProductDetailClient({
  product,
  related = [],
}: {
  product: Product
  related?: Product[]
}) {
  const { addItem } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  // ✅ Normalize price safely
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price

  const wished = isWishlisted(product.id)

  const addToCart = () => {
    if (qty < 1) return

    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price,
        image: product.images?.[0]?.url || '',
        slug: product.slug,
        variant: selectedVariant || undefined,
      })
    }

    toast.success('Added to cart')
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">{product.name}</h1>

        {/* PRICE */}
        <p className="text-xl font-bold text-orange-600 mt-2">
          {formatCurrency(price)}
        </p>

        {/* QUANTITY */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
          <span>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)}>+</button>
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={addToCart}
            className="px-5 py-2 bg-orange-500 text-white rounded-xl"
          >
            Add to Cart
          </button>

          <button
            onClick={() => {
              toggleWishlist(product.id)
              toast.success('Updated wishlist')
            }}
            className="px-4 py-2 border rounded-xl"
          >
            {wished ? '♥' : '♡'}
          </button>
        </div>

        <ProductTabs product={product} />
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <h2 className="text-lg font-bold mb-4">Related Products</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="border rounded-xl p-3">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-orange-600 font-bold">
                  {formatCurrency(p.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}