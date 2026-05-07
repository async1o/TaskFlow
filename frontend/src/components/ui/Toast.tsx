import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

const typeStyles = {
  success: 'bg-green-100 text-green-800 border-green-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  useEffect(() => {
    const timer = setTimeout(handleClose, duration)
    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg transition-all duration-300 ${
        typeStyles[type]
      } ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={handleClose} className="font-bold">✕</button>
      </div>
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