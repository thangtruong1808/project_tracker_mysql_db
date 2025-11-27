/**
 * TokenExpirationDialog Component
 * Displays a confirmation dialog when refresh token is about to expire
 * Shows countdown and allows user to extend refresh token
 *
 * @author Thang Truong
 * @date 2025-11-27
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

/**
 * TokenExpirationDialog - Shows session expiration warning with countdown
 * @author Thang Truong
 * @date 2025-11-27
 */
const TokenExpirationDialog = ({ onConfirm, onTimeout }: TokenExpirationDialogProps) => {
  const { refreshTokenTimeRemaining } = useAuth()
  const [countdown, setCountdown] = useState(DIALOG_COUNTDOWN_SECONDS)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()
  const timeoutTriggeredRef = useRef(false)
  const onTimeoutRef = useRef(onTimeout)

  /** Keep onTimeout ref updated - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  /** Poll refresh token status for real-time countdown */
  const { data: tokenStatusData } = useQuery(REFRESH_TOKEN_STATUS_QUERY, {
    pollInterval: 500,
    fetchPolicy: 'network-only',
  })

  /**
   * Handles timeout - logs out user when refresh token expires
   * Uses ref to prevent stale closure issues
   * @author Thang Truong
   * @date 2025-11-27
   */
  const executeTimeout = useCallback(async () => {
    if (timeoutTriggeredRef.current) return
    timeoutTriggeredRef.current = true
    setIsProcessing(true)
    try {
      await onTimeoutRef.current()
    } catch {
      await showToast('Session expired. Please log in again.', 'error', 7000)
    }
  }, [showToast])

  /**
   * Initialize countdown based on actual time remaining from backend
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    if (timeoutTriggeredRef.current) return
    const timeRemaining = tokenStatusData?.refreshTokenStatus?.timeRemaining ?? refreshTokenTimeRemaining
    if (timeRemaining !== null && timeRemaining !== undefined) {
      const newCountdown = Math.min(DIALOG_COUNTDOWN_SECONDS, Math.max(0, Math.floor(timeRemaining)))
      setCountdown(prev => Math.abs(prev - newCountdown) > 1 ? newCountdown : prev)
      if (newCountdown <= 0) {
        setCountdown(0)
        executeTimeout()
      }
    }
  }, [tokenStatusData?.refreshTokenStatus?.timeRemaining, refreshTokenTimeRemaining, executeTimeout])

  /**
   * Countdown timer - decrements every second and triggers timeout at zero
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    if (timeoutTriggeredRef.current) return
    const timer = setInterval(() => {
      if (timeoutTriggeredRef.current) {
        clearInterval(timer)
        return
      }
      setCountdown(prev => {
        const newVal = Math.max(0, prev - 1)
        if (newVal === 0) {
          clearInterval(timer)
          executeTimeout()
        }
        return newVal
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [executeTimeout])

  /**
   * Handles user confirmation to extend session
   * @author Thang Truong
   * @date 2025-11-27
   */
  const handleConfirm = async () => {
    if (isProcessing || timeoutTriggeredRef.current) return
    setIsProcessing(true)
    try {
      await onConfirm()
    } catch {
      await showToast('Failed to extend session. Please log in again.', 'error', 7000)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Handles manual logout button click
   * @author Thang Truong
   * @date 2025-11-27
   */
  const handleLogoutClick = async () => {
    if (isProcessing || timeoutTriggeredRef.current) return
    await executeTimeout()
  }

  return (
    /* Session expiration dialog overlay */
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Dialog container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        {/* Warning icon and header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session About to Expire</h2>
          <p className="text-gray-600">Your session is about to expire. Would you like to extend it?</p>
        </div>

        {/* Countdown display */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-1">You will be automatically logged out in:</p>
          <p className="text-3xl font-bold text-yellow-600">{countdown}</p>
          <p className="text-xs text-gray-500 mt-1">seconds</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-yellow-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${(countdown / DIALOG_COUNTDOWN_SECONDS) * 100}%` }} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={isProcessing}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isProcessing ? 'Processing...' : 'Yes, Extend Session'}
          </button>
          <button onClick={handleLogoutClick} disabled={isProcessing}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenExpirationDialog
