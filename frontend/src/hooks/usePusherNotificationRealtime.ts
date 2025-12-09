/**
 * usePusherNotificationRealtime Hook
 * Handles Pusher subscriptions for notification real-time updates
 * Uses refs to prevent re-subscription loops
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect, useRef } from 'react'
import { subscribeToPusherEvent } from '../lib/pusher'

type ToastVariant = 'success' | 'info' | 'error'
type PusherData = { data?: { notificationCreated?: { id?: string; userId?: string } } }

interface UsePusherNotificationRealtimeParams {
  userId: string | undefined
  onRefetch: () => Promise<void>
  showToast: (message: string, variant: ToastVariant, duration?: number) => Promise<void> | void
}

/**
 * Subscribe to Pusher events for real-time notification updates
 * Subscribes only once per userId change to prevent loops
 * @author Thang Truong
 * @date 2025-12-09
 * @param params - Hook parameters
 */
export const usePusherNotificationRealtime = ({
  userId,
  onRefetch,
  showToast,
}: UsePusherNotificationRealtimeParams): void => {
  const processedIds = useRef<Set<string>>(new Set())
  /** Store callbacks in refs to prevent re-subscription on callback changes */
  const onRefetchRef = useRef(onRefetch)
  const showToastRef = useRef(showToast)
  const userIdRef = useRef(userId)

  /** Update refs when props change without triggering re-subscription */
  useEffect(() => {
    onRefetchRef.current = onRefetch
    showToastRef.current = showToast
    userIdRef.current = userId
  }, [onRefetch, showToast, userId])

  /**
   * Subscribe to Pusher events - only re-subscribes when userId changes
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    if (!userId) return

    /**
     * Handle incoming Pusher notification events
     * @author Thang Truong
     * @date 2025-12-09
     */
    const handleNotification = async (eventData: unknown): Promise<void> => {
      if (!userIdRef.current) return
      const data = eventData as PusherData
      const notification = data?.data?.notificationCreated
      if (!notification) return
      const notifUserId = String(notification.userId || '')
      if (notifUserId !== String(userIdRef.current)) return
      const notifId = String(notification.id || '')
      if (!notifId || processedIds.current.has(notifId)) return
      processedIds.current.add(notifId)
      await showToastRef.current('New notification received.', 'info', 7000)
      await onRefetchRef.current()
    }

    const channel = 'project-tracker'
    const unsubscribe = subscribeToPusherEvent(channel, 'notification_created', handleNotification)
    return () => {
      unsubscribe()
    }
  }, [userId]) // Only re-subscribe when userId changes
}
