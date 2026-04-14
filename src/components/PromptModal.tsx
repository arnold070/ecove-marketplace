'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  title?: string
  label?: string
  placeholder?: string
  defaultValue?: string

  onSubmit?: (value: string) => void
  onClose?: () => void

  // legacy support
  onConfirm?: (value: string) => void
  onCancel?: () => void

  confirmLabel?: string
  danger?: boolean
}

export default function PromptModal({
  open,
  title = 'Enter value',
  label,
  placeholder = 'Type here...',
  defaultValue = '',
  onSubmit,
  onClose,
  onConfirm,
  onCancel,
  confirmLabel = 'Submit',
  danger = false,
}: Props) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValue(defaultValue)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, defaultValue])

  if (!open) return null

  // ✅ Close handler (backward compatible)
  const handleClose = () => {
    if (onClose) return onClose()
    if (onCancel) return onCancel()
  }

  // ✅ Submit handler (safe + trimmed)
  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return

    if (onSubmit) return onSubmit(trimmed)
    if (onConfirm) return onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className="font-bold mb-3 text-lg">{title}</h3>

        {/* Label */}
        {label && (
          <p className="text-sm text-gray-500 mb-2">
            {label}
          </p>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`px-4 py-2 rounded text-sm text-white transition ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-orange-500 hover:bg-orange-600'
            } ${!value.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}