/**
 * useToast Hook
 * Custom hook for managing toast notifications with global context
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Generates a unique ID for toast messages
 * Uses timestamp and random number to ensure uniqueness
 * @returns Unique string ID
 */
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * useToast Hook
 * Provides toast notification functionality to components
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

/**
 * ToastProvider Component
 * Provides global toast notification context to the application
 */
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  /**
   * Adds a new toast message to the state
   * @param message - The toast message text
   * @param type - The type of toast (success, error, info)
   * @param duration - Optional duration in milliseconds (default: 7000)
   */
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 7000) => {
      const id = generateToastId()
      setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])
    },
    []
  )

  /**
   * Removes a toast message from the state by its ID
   * @param id - The ID of the toast to remove
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}
