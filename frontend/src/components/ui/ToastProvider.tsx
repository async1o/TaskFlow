import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Toast } from './Toast'

interface ToastData {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useGlobalToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [nextId, setNextId] = useState(1)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = nextId
    setNextId((prev) => prev + 1)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [nextId])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}