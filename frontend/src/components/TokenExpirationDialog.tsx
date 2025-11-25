/**
 * TokenExpirationDialog Component
 * Displays a confirmation dialog when refresh token is about to expire
 * Shows countdown and allows user to extend refresh token
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@apollo/client'
import { REFRESH_TOKEN_STATUS_QUERY } from '../graphql/queries'
import { DIALOG_COUNTDOWN_SECONDS } from '../constants/auth'

interface TokenExpirationDialogProps {
  onConfirm: () => Promise<void>
  onTimeout: () => Promise<void>
}

const TokenExpirationDialog = ({ onConfirm, onTimeout }: TokenExpirationDialogProps) => {
  const { refreshTokenTimeRemaining } = useAuth()
  const [countdown, setCountdown] = useState(DIALOG_COUNTDOWN_SECONDS)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()
  const timeoutTriggeredRef = useRef(false)

  // Poll refresh token status to get real-time time remaining
  const { data: tokenStatusData } = useQuery(REFRESH_TOKEN_STATUS_QUERY, {
    pollInterval: 500, // Poll every 500ms for accurate countdown
    fetchPolicy: 'network-only',
  })

  /**
   * Handles timeout - logs out user when refresh token expires
   * Prevents multiple simultaneous timeout calls
   * 
   * @author Thang Truong
   * @date 2024-12-24
   */
  const handleTimeout = useCallback(async () => {
    // Prevent multiple simultaneous timeout calls
    if (isProcessing || timeoutTriggeredRef.current) return
    timeoutTriggeredRef.current = true
    setIsProcessing(true)
    try {
      // Call parent timeout handler to logout user
      await onTimeout()
    } catch (error) {
      // Show error toast if timeout handler fails
      await showToast('Session expired. Please log in again.', 'error', 7000)
    } finally {
      setIsProcessing(false)
    }
  }, [onTimeout, showToast, isProcessing])

  /**
   * Initialize countdown based on actual time remaining from backend
   * Only sets initial countdown value, interval timer handles decrementing
   * 
   * @author Thang Truong
   * @date 2024-12-24
   */
  useEffect(() => {
    // Don't update if timeout was already triggered
    if (timeoutTriggeredRef.current) return

    const timeRemaining = tokenStatusData?.refreshTokenStatus?.timeRemaining ?? refreshTokenTimeRemaining
    if (timeRemaining !== null && timeRemaining !== undefined) {
      // Cap countdown at DIALOG_COUNTDOWN_SECONDS maximum, allow 0, round down to nearest second
      const newCountdown = Math.min(DIALOG_COUNTDOWN_SECONDS, Math.max(0, Math.floor(timeRemaining)))
      // Only update if significantly different to avoid constant updates
      setCountdown((prev) => {
        if (Math.abs(prev - newCountdown) > 1) {
          return newCountdown
        }
        return prev
      })

      // If time remaining is 0 or less, trigger timeout immediately
      if (newCountdown <= 0 && !timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true
        setCountdown(0)
        handleTimeout()
      }
    }
  }, [tokenStatusData?.refreshTokenStatus?.timeRemaining, refreshTokenTimeRemaining, handleTimeout])

  /**
   * Handles countdown timer
   * Decrements countdown every second, syncing with backend data when available
   * Automatically logs out when countdown reaches zero
   * 
   * @author Thang Truong
   * @date 2024-12-24
   */
  useEffect(() => {
    // Don't start timer if timeout was already triggered
    if (timeoutTriggeredRef.current) return

    // Set up interval to update countdown every second
    const timer = setInterval(() => {
      // Check if timeout was already triggered
      if (timeoutTriggeredRef.current) {
        clearInterval(timer)
        return
      }

      // Always decrement countdown locally by 1 second
      setCountdown((prev) => {
        // Calculate new countdown value (decrement by 1)
        const newCountdown = Math.max(0, prev - 1)

        // When countdown reaches 0, trigger timeout
        if (newCountdown === 0) {
          clearInterval(timer)
          // Don't set timeoutTriggeredRef here - let handleTimeout() set it to avoid early return
          // Trigger timeout after ensuring countdown shows 0
          if (!timeoutTriggeredRef.current) {
            setTimeout(async () => {
              await handleTimeout()
            }, 100)
          }
          return 0
        }

        // Return decremented countdown
        return newCountdown
      })
    }, 1000)

    // Cleanup: clear interval when component unmounts or dependencies change
    return () => clearInterval(timer)
  }, [handleTimeout])

  /**
   * Handles user confirmation to extend refresh token
   * Prevents multiple simultaneous confirm calls
   * 
   * @author Thang Truong
   * @date 2024-12-24
   */
  const handleConfirm = async () => {
    // Prevent multiple simultaneous confirm calls
    if (isProcessing) return
    setIsProcessing(true)
    try {
      // Call parent confirm handler to extend session
      await onConfirm()
    } catch (error) {
      // Show error toast if confirm handler fails
      await showToast('Failed to extend session. Please log in again.', 'error', 7000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session About to Expire</h2>
          <p className="text-gray-600">
            Your session is about to expire. Would you like to extend it?
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-1">
            You will be automatically logged out in:
          </p>
          <p className="text-3xl font-bold text-yellow-600">{countdown}</p>
          <p className="text-xs text-gray-500 mt-1">seconds</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / DIALOG_COUNTDOWN_SECONDS) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Extending...' : 'Yes, Extend Session'}
          </button>
          <button
            onClick={handleTimeout}
            disabled={isProcessing}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenExpirationDialog
