'use client'

import React, { useState, useEffect, Suspense } from 'react'
import type { Order } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/apiClient'
import Link from 'next/link'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#ede9fe', color: '#5b21b6' },
  delivered: { bg: '#dcfce7', color: '#15803d' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

function AccountContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlTab = searchParams.get('tab')

  const validTabs = ['orders', 'profile', 'wishlist', 'addresses'] as const
  type TabType = typeof validTabs[number]

  const initialTab: TabType =
    urlTab && validTabs.includes(urlTab as TabType)
      ? (urlTab as TabType)
      : 'orders'

  const [tab, setTab] = useState<TabType>(initialTab)

  useEffect(() => {
    if (!user) {
      router.replace('/login?next=/account')
    }
  }, [user, router])

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/storefront/orders').then(r => r.data.data),
    enabled: !!user,
  })

  if (!user) return null

  const orders = ordersData || []

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-white text-xl"
            style={{ background: '#f68b1f' }}
          >
            {initials}
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-sm text-red-400 hover:text-red-600 font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {validTabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-orange-400 text-orange-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {t === 'orders'
              ? '📦 My Orders'
              : t === 'profile'
              ? '👤 Profile'
              : t === 'addresses'
              ? '📍 Addresses'
              : '♡ Wishlist'}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-20 animate-pulse border border-gray-100"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📦</div>
              <p className="font-semibold text-gray-600">No orders yet</p>
              <Link
                href="/search"
                className="mt-4 inline-block text-sm text-orange-500 font-semibold hover:underline"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: Order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.orderNumber}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm text-orange-600">
                        {order.orderNumber} →
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold">
                        ₦{Number(order.total).toLocaleString()}
                      </span>

                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background:
                            STATUS_STYLE[order.status]?.bg || '#f3f4f6',
                          color:
                            STATUS_STYLE[order.status]?.color || '#374151',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {order.items?.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
                          {item.productName}
                        </span>
                        <span className="text-xs text-gray-400">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}

                    {order.items?.length > 3 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-4xl animate-pulse">👤</div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  )
}