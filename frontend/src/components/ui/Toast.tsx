import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

const icons = {
  success: (
    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const bgStyles = {
  success: 'bg-white border-emerald-200 shadow-emerald-200/30',
  error: 'bg-white border-rose-200 shadow-rose-200/30',
  info: 'bg-white border-sky-200 shadow-sky-200/30',
}

const iconBg = {
  success: 'bg-emerald-50',
  error: 'bg-rose-50',
  info: 'bg-sky-50',
}

export function Toast({ message, type = 'info', duration = 3500, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(onClose, 250)
  }

  useEffect(() => {
    const timer = setTimeout(handleClose, duration)
    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-250 z-50 max-w-sm ${
        bgStyles[type]
      } ${
        isLeaving
          ? 'opacity-0 translate-x-4 scale-95'
          : isVisible
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-4 scale-95'
      }`}
    >
      <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${iconBg[type]}`}>
        {icons[type]}
      </span>
      <p className="text-sm text-zinc-700 flex-1">{message}</p>
      <button
        onClick={handleClose}
        className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors p-0.5"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}
