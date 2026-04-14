'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

/* ---------------- SAFE CURRENCY FORMATTER ---------------- */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)

/* ---------------- TYPES ---------------- */
interface Product {
  id: string
  name: string
  slug: string
  price: number | string
  comparePrice?: number | string
  stock: number
  isFlashSale: boolean
  flashSalePrice?: string
  flashSaleEnd?: string
  images: { url: string }[]
  category?: { name: string; slug: string }
  vendor: { businessName: string; slug: string; averageRating: string }
  _count: { reviews: number }
}

interface Category {
  id: string
  name: string
  slug: string
  imageUrl?: string
}

interface Banner {
  id: string
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  imageUrl?: string
  bgColor?: string
  position: string
  displayOrder: number
}

/* ---------------- ICONS ---------------- */
const CATEGORY_ICONS: Record<string, string> = {
  'phones-tablets': '📱',
  computing: '💻',
  electronics: '📺',
  fashion: '👗',
  'home-kitchen': '🏠',
  'beauty-health': '💄',
  'baby-products': '👶',
  'sports-outdoors': '⚽',
  groceries: '🛒',
  automotive: '🚗',
  gaming: '🎮',
  'books-education': '📚',
}

/* ---------------- FALLBACK SLIDES ---------------- */
const FALLBACK_SLIDES = [
  {
    title: 'The Latest Smartphones',
    subtitle: 'Genuine, sealed & delivered fast',
    ctaText: 'Shop Phones',
    ctaLink: '/categories/phones-tablets',
    bgColor: '#1a1a1a',
    imageUrl: '',
    emoji: '📱',
  },
  {
    title: 'Flash Sale — Up to 50% Off',
    subtitle: 'Limited time deals across categories',
    ctaText: 'Shop Now',
    ctaLink: '/search?flashSale=true',
    bgColor: '#d4720e',
    imageUrl: '',
    emoji: '⚡',
  },
]

const SLIDE_EMOJIS: Record<string, string> = {
  '#1a1a1a': '📱',
  '#d4720e': '⚡',
  '#1e8a44': '👗',
}

/* ---------------- PRODUCT CARD ---------------- */
function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart()

  const price = Number(
    p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price
  )

  const compare = p.comparePrice ? Number(p.comparePrice) : null
  const discount = compare ? Math.round((1 - price / compare) * 100) : null
  const img = p.images?.[0]?.url

  const add = () => {
    addItem({
      id: p.id,
      name: p.name,
      price,
      image: img || '',
      slug: p.slug,
    })
    toast.success('Added to cart')
  }

  return (
    <div className="relative bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all">
      <Link href={`/products/${p.slug}`}>
        <div className="h-48 flex items-center justify-center bg-gray-50">
          {img ? (
            <Image
              src={img}
              alt={p.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-5xl">
              {CATEGORY_ICONS[p.category?.slug || ''] || '📦'}
            </span>
          )}
        </div>
      </Link>

      {discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          -{discount}%
        </span>
      )}

      <div className="p-3">
        <Link href={`/products/${p.slug}`}>
          <p className="text-sm font-medium line-clamp-2">{p.name}</p>
        </Link>

        <div className="flex gap-2 items-center mt-1">
          <span className="text-orange-600 font-bold">
            {formatCurrency(price)}
          </span>

          {compare && (
            <span className="text-xs line-through text-gray-400">
              const compare = p.comparePrice ? Number(p.comparePrice) : null
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            ★ {(Number(p.vendor.averageRating) || 0).toFixed(1)} (
            {p._count.reviews})
          </span>

          <button
            onClick={add}
            className="text-xs bg-orange-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- HERO SLIDER ---------------- */
function HeroSlider({ slides }: { slides: any[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => clearInterval(t)
  }, [slides.length])

  const current = slides[index]

  return (
    <div className="relative h-64 rounded-xl overflow-hidden">
      <div
        className="absolute inset-0 flex flex-col justify-center p-6 text-white"
        style={{ background: current.bgColor }}
      >
        <h2 className="text-2xl font-bold">{current.title}</h2>
        <p className="text-sm opacity-80">{current.subtitle}</p>
      </div>
    </div>
  )
}

/* ---------------- MAIN ---------------- */
export default function HomepageClient({
  featured,
  categories,
  flashSale,
  banners,
  vendorCount = 184,
}: any) {
  const heroSlides =
    banners
      .filter((b: any) => b.position === 'hero_slider')
      .map((b: any) => ({
        title: b.title,
        subtitle: b.subtitle,
        ctaText: b.ctaText,
        ctaLink: b.ctaLink,
        bgColor: b.bgColor,
      })) || FALLBACK_SLIDES

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <HeroSlider slides={heroSlides} />

      <h2 className="mt-6 font-bold">Featured</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {featured.map((p: Product) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  )
}