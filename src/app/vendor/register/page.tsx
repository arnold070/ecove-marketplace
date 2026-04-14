'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7),
  businessName: z.string().min(2),
  description: z.string().min(50, 'Min 50 characters'),
  city: z.string().min(2),
  state: z.string().min(2),
  address: z.string().min(5),
  bankName: z.string().min(2),
  bankAccountNumber: z.string().length(10, 'Must be 10 digits'),
  bankAccountName: z.string().min(2),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms' }),
  }),
})

type FormData = z.infer<typeof schema>

const STEPS = ['Business Info', 'Bank Details', 'Terms & Submit']

export default function VendorRegisterPage() {
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [idDocUrl, setIdDocUrl] = useState('')
  const [cacUrl, setCacUrl] = useState('')

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreedToTerms: true as any },
  })

  const uploadDoc = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (u: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'id-docs')

      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setter(res.data.data.url)
      toast.success('Document uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const nextStep = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      0: [
        'firstName',
        'lastName',
        'email',
        'password',
        'phone',
        'businessName',
        'description',
        'city',
        'state',
        'address',
      ],
      1: ['bankName', 'bankAccountNumber', 'bankAccountName'],
    }

    const valid = await trigger(fields[step])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setBusy(true)
    try {
      await api.post('/auth/vendor-register', {
        ...data,
        idDocumentUrl: idDocUrl || undefined,
        cacDocumentUrl: cacUrl || undefined,
      })
      setDone(true)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl text-center max-w-lg w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold mb-3">
            Application Submitted!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We’ll review your application within 24–48 hours.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-white font-bold"
            style={{ background: '#f68b1f' }}
          >
            Back Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-extrabold"
            style={{ color: '#f68b1f' }}
          >
            eco<span className="text-gray-800">ve</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white p-8 rounded-2xl border">

            {/* STEP CONTENT REMAINS SAME (your logic is fine) */}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 text-white rounded-xl"
                  style={{ background: '#f68b1f' }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={busy || uploading}
                  className="flex-1 py-3 text-white rounded-xl disabled:opacity-60"
                  style={{ background: '#f68b1f' }}
                >
                  {busy ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}