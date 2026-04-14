'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import PromptModal from '@/components/PromptModal'

export default function AdminCommissionsPage() {
  const qc = useQueryClient()

  const [editRates, setEditRates] = useState<Record<string, string>>({})
  const [vendorRateModal, setVendorRateModal] = useState<{
    id: string
    vendorId: string
    currentRate: string
  } | null>(null)

  const { data: rules } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => api.get('/admin/commissions').then((r) => r.data.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      api.get('/storefront/categories?limit=20').then((r) => r.data.data),
  })

  const saveRule = useMutation({
    mutationFn: (data: any) =>
      data.id
        ? api.put('/admin/commissions', data)
        : api.post('/admin/commissions', data),
    onSuccess: () => {
      toast.success('Commission rule saved')
      qc.invalidateQueries({ queryKey: ['admin-commissions'] })
      setVendorRateModal(null)
    },
  })

  const globalRule = rules?.find((r: any) => r.type === 'global')
  const categoryRules = rules?.filter((r: any) => r.type === 'category') || []
  const vendorRules = rules?.filter((r: any) => r.type === 'vendor') || []

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold mb-6">
          Commission Rules
        </h1>

        {/* GLOBAL */}
        <div className="bg-white border rounded-2xl p-6 mb-5">
          <h2 className="font-bold mb-3">🌐 Global Rate</h2>

          <div className="flex gap-3 items-center">
            <input
              type="number"
              defaultValue={globalRule?.rate ?? 10}
              onChange={(e) =>
                setEditRates((p) => ({
                  ...p,
                  global: e.target.value,
                }))
              }
              className="w-24 border rounded px-3 py-2 text-center"
            />

            <button
              onClick={() => {
                const rate = parseFloat(
                  editRates.global || String(globalRule?.rate ?? 10)
                )

                saveRule.mutate({
                  id: globalRule?.id,
                  type: 'global',
                  rate,
                })
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="bg-white border rounded-2xl p-6 mb-5">
          <h2 className="font-bold mb-3">🗂️ Category Rates</h2>

          {(categories || []).map((cat: any) => {
            const key = `cat_${cat.id}`
            const existing = categoryRules.find(
              (r: any) => r.categoryId === cat.id
            )

            return (
              <div key={cat.id} className="flex gap-3 mb-3 items-center">
                <span className="flex-1">{cat.name}</span>

                <input
                  type="number"
                  defaultValue={
                    existing?.rate ?? globalRule?.rate ?? 10
                  }
                  onChange={(e) =>
                    setEditRates((p) => ({
                      ...p,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-20 border rounded px-2 py-1 text-center"
                />

                <button
                  onClick={() => {
                    const rate = parseFloat(
                      editRates[key] ||
                        String(existing?.rate ?? globalRule?.rate ?? 10)
                    )

                    saveRule.mutate({
                      id: existing?.id,
                      type: 'category',
                      categoryId: cat.id,
                      rate,
                    })
                  }}
                  className="px-3 py-1 bg-orange-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            )
          })}
        </div>

        {/* VENDOR */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="font-bold mb-3">🏪 Vendor Rates</h2>

          {vendorRules.map((r: any) => (
            <div key={r.id} className="flex justify-between mb-3">
              <span>Vendor: {r.vendorId}</span>

              <div className="flex gap-2 items-center">
                <span>{r.rate}%</span>

                <button
                  onClick={() =>
                    setVendorRateModal({
                      id: r.id,
                      vendorId: r.vendorId,
                      currentRate: String(r.rate),
                    })
                  }
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL (FIXED PROPS) */}
      <PromptModal
        open={!!vendorRateModal}
        title="Edit Vendor Commission"
        label={`Vendor ID: ${vendorRateModal?.vendorId || ''}`}
        placeholder="Enter rate e.g 15"
        defaultValue={vendorRateModal?.currentRate || ''}
        onClose={() => setVendorRateModal(null)}
        onSubmit={(value: string) => {
          if (!vendorRateModal) return

          const rate = parseFloat(value)
          if (isNaN(rate)) {
            toast.error('Invalid rate')
            return
          }

          saveRule.mutate({
            id: vendorRateModal.id,
            type: 'vendor',
            rate,
            vendorId: vendorRateModal.vendorId,
          })

          setVendorRateModal(null)
        }}
      />
    </>
  )
}