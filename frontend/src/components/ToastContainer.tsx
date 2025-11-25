/**
 * ToastContainer Component
 * Manages multiple toast notifications with proper stacking
 * Uses global ToastProvider context
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import Toast from './Toast'
import { useToast } from '../hooks/useToast'

export interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastContainer

