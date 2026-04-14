'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

/* =========================
   ZOD SCHEMA (FIXED)
========================= */
const schema = z.object({
  name: z.string().min(2).max(255).optional(),
  shortDescription: z.string().max(160).optional(),
  description: z.string().optional(),

  price: z
    .number()
    .positive()
    .optional()
    .or(z.nan())
    .transform(v => (isNaN(v) ? undefined : v)),

  comparePrice: z
    .number()
    .positive()
    .optional()
    .or(z.nan())
    .transform(v => (isNaN(v) ? undefined : v)),

  stock: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(z.nan())
    .transform(v => (isNaN(v) ? undefined : v)),

  lowStockAlert: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(z.nan())
    .transform(v => (isNaN(v) ? undefined : v)),

  categoryId: z.string().optional(),
  brand: z.string().optional(),
  tags: z.string().optional(),
  resubmit: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

/* =========================
   COMPONENT
========================= */
export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const qc = useQueryClient()

  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  /* =========================
     FETCH PRODUCT
  ========================= */
  const { data: product, isLoading } = useQuery({
    queryKey: ['vendor-product', params.id],
    queryFn: () => api.get(`/vendor/products/${params.id}`).then(r => r.data.data),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/storefront/categories?limit=20').then(r => r.data.data),
  })

  /* =========================
     FORM
  ========================= */
  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  /* =========================
     LOAD DATA INTO FORM
  ========================= */
  useEffect(() => {
    if (!product) return

    reset({
      name: product.name,
      shortDescription: product.shortDescription || '',
      description: product.description || '',

      price:
        typeof product.price === 'string'
          ? parseFloat(product.price)
          : product.price,

      comparePrice:
        product.comparePrice !== null && product.comparePrice !== undefined
          ? typeof product.comparePrice === 'string'
            ? parseFloat(product.comparePrice)
            : product.comparePrice
          : undefined,

      stock: product.stock,
      lowStockAlert: product.lowStockAlert,
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      tags: product.tags?.join(', ') || '',
    })

    setImageUrls(product.images?.map((i: any) => i.url) || [])
  }, [product, reset])

  /* =========================
     UPDATE PRODUCT
  ========================= */
  const save = useMutation({
    mutationFn: (data: FormData & { resubmit?: boolean }) => {
      const tags = data.tags
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined

      const images = imageUrls.map((url, i) => ({
        url,
        isPrimary: i === 0,
      }))

      return api.put(`/vendor/products/${params.id}`, {
        ...data,
        tags,
        images,
      })
    },

    onSuccess: () => {
      toast.success('Product updated!')
      qc.invalidateQueries({ queryKey: ['vendor-products'] })
      router.push('/vendor/dashboard/products')
    },
  })

  /* =========================
     IMAGE UPLOAD
  ========================= */
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'products')

      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setImageUrls(prev => [...prev, res.data.data.url])
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  /* =========================
     LOADING STATE
  ========================= */
  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    )

  const isRejected = product?.status === 'rejected'
  const isApproved = product?.status === 'approved'

  /* =========================
     UI
  ========================= */
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vendor/dashboard/products" className="text-sm text-gray-400 hover:text-gray-600">
          ← My Products
        </Link>

        <h1 className="text-xl font-extrabold text-gray-900">Edit Product</h1>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ml-auto ${
            product?.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : product?.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {product?.status}
        </span>
      </div>

      {/* Messages */}
      {isRejected && product?.adminNote && (
        <div className="mb-5 p-4 rounded-xl text-sm flex gap-3 bg-red-50 border-l-4 border-red-500">
          <span>❌</span>
          <div>
            <strong>Admin note:</strong> {product.adminNote}
          </div>
        </div>
      )}

      {isApproved && (
        <div className="mb-5 p-4 rounded-xl text-sm flex gap-3 bg-green-50 border-l-4 border-green-500">
          <span>✅</span>
          <span>This product is <strong>live</strong>.</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit(data => save.mutate(data))}>
        <div className="space-y-5">

          {/* DETAILS */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold text-sm">Product Details</h2>

            <input {...register('name')} placeholder="Name" className="input" />
            <input {...register('shortDescription')} placeholder="Short Description" className="input" />
            <textarea {...register('description')} placeholder="Description" className="input" />

            <input {...register('brand')} placeholder="Brand" className="input" />
            <input {...register('tags')} placeholder="Tags" className="input" />
          </div>

          {/* PRICING */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold text-sm">Pricing & Stock</h2>

            <input type="number" {...register('price', { valueAsNumber: true })} placeholder="Price" className="input" />
            <input type="number" {...register('comparePrice', { valueAsNumber: true })} placeholder="Compare Price" className="input" />
            <input type="number" {...register('stock', { valueAsNumber: true })} placeholder="Stock" className="input" />
          </div>

          {/* IMAGES */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold text-sm">Images</h2>

            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="w-full h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setImageUrls(p => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {imageUrls.length < 8 && (
                <label className="border rounded flex items-center justify-center cursor-pointer">
                  <input type="file" hidden onChange={uploadImage} />
                  {uploading ? '...' : '+'}
                </label>
              )}
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={save.isPending}
            className="w-full py-3 rounded-xl text-white font-bold"
            style={{ background: '#f68b1f' }}
          >
            {save.isPending ? 'Saving…' : 'Save Product'}
          </button>

        </div>
      </form>
    </div>
  )
}