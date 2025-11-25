/**
 * Toast Component
 * Displays notification messages at the bottom left of the screen
 * Auto-closes after specified duration with visual progress indicator
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

const Toast = ({ message, type = 'success', duration = 7000, onClose }: ToastProps) => {
  const [progress, setProgress] = useState(100)

  /**
   * Auto-close toast after specified duration
   * Updates progress indicator as time passes
   */
  useEffect(() => {
    const startTime = Date.now()
    const interval = 50 // Update every 50ms for smooth animation

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100

      setProgress(progressPercent)

      if (remaining <= 0) {
        onClose()
      }
    }

    // Update progress at regular intervals
    const progressInterval = setInterval(updateProgress, interval)

    // Auto-close timer
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [duration, onClose])

  /**
   * Get icon and color based on toast type
   * @returns Object containing colors and icon for the toast type
   */
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          progressColor: 'bg-green-500',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        }
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          progressColor: 'bg-red-500',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        }
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          progressColor: 'bg-blue-500',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        }
    }
  }

  const styles = getToastStyles()

  return (
    <div
      className={`relative flex items-center gap-3 rounded-lg border ${styles.bgColor} ${styles.borderColor} p-4 shadow-lg animate-slide-in-left max-w-sm overflow-hidden`}
      role="alert"
    >
      {/* Progress Bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${styles.progressColor} transition-all duration-75 ease-linear`}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {/* Toast Content */}
      <div className="flex items-center gap-3 w-full relative z-10">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>{styles.icon}</div>
        <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close toast"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toast
