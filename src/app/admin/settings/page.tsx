'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const qc = useQueryClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [changed, setChanged] = useState<Record<string, boolean>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings').then(r => {
      const d = r.data.data; setSettings(d); return d
    }),
  })

  const save = useMutation({
    mutationFn: (data: any) => api.put('/admin/settings', data),
    onSuccess: () => { toast.success('Settings saved'); setChanged({}); qc.invalidateQueries({ queryKey: ['admin-settings'] }) },
  })

  const set = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setChanged(prev => ({ ...prev, [key]: true }))
  }

  const hasChanges = Object.keys(changed).length > 0

  const Field = ({ label, k, type = 'text', hint }: { label: string; k: string; type?: string; hint?: string }) => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-gray-700 mb-1 block">{label}</label>
      <input type={type} value={settings[k] || ''} onChange={e => set(k, e.target.value)}
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors ${changed[k] ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )

  const Toggle = ({ label, k, desc }: { label: string; k: string; desc?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      <button onClick={() => set(k, settings[k] === 'true' ? 'false' : 'true')}
        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
        style={{ background: settings[k] === 'true' ? '#f68b1f' : '#d1d5db' }}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          style={{ left: settings[k] === 'true' ? '22px' : '2px' }} />
      </button>
    </div>
  )

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center"><div className="text-4xl animate-pulse">⚙️</div></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Marketplace Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure global marketplace behaviour</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-sm text-gray-700 mb-4">🏪 Store Information</h2>
          <Field label="Marketplace Name" k="site.name" />
          <Field label="Tagline" k="site.tagline" />
          <Field label="Support Email" k="site.email" type="email" />
          <Field label="Support Phone" k="site.phone" />
          <Field label="Currency Symbol" k="site.currency_symbol" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-sm text-gray-700 mb-4">🏪 Vendor Settings</h2>
          <Toggle label="Allow Vendor Registration" k="vendor.registration.open" desc="Let new vendors apply to sell" />
          <Toggle label="Auto-Approve Vendors" k="vendor.auto_approve" desc="Skip manual vendor review" />
          <Toggle label="Auto-Approve Products" k="product.auto_approve" desc="Skip manual product review" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-sm text-gray-700 mb-4">💸 Payout Settings</h2>
          <Field label="Minimum Payout (₦)" k="payout.min_amount" type="number" hint="Vendors must have at least this amount to request payout" />
          <Field label="Clearing Period (days)" k="payout.clearing_days" type="number" hint="Days after delivery before earnings are released" />
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Payout Schedule</label>
            <select value={settings['payout.schedule'] || 'weekly'} onChange={e => set('payout.schedule', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (Every Monday)</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="manual">Manual (Admin Triggered)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-sm text-gray-700 mb-4">📱 Social & Contact</h2>
          <Field label="WhatsApp Support Number" k="social.whatsapp" />
          <Field label="Instagram Handle" k="social.instagram" />
          <Field label="Facebook Page" k="social.facebook" />
          <Field label="Twitter/X Handle" k="social.twitter" />
        </div>
      </div>

      {hasChanges && (
        <div className="mt-5 p-4 rounded-xl flex items-center justify-between" style={{ background: '#fff4e6', border: '1px solid #f68b1f' }}>
          <p className="text-sm font-semibold text-orange-700">You have unsaved changes</p>
          <div className="flex gap-3">
            <button onClick={() => { setSettings(data || {}); setChanged({}) }} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Discard</button>
            <button onClick={() => {
              const toSave = Object.fromEntries(Object.keys(changed).map(k => [k, settings[k]]))
              save.mutate(toSave)
            }} disabled={save.isPending} className="px-5 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-60" style={{ background: '#f68b1f' }}>
              {save.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
