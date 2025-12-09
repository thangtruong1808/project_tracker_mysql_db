/**
 * usePusherNotificationRealtime Hook
 * Handles Pusher subscriptions for notification real-time updates
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect, useRef, useCallback } from 'react'
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

  const handleNotification = useCallback(async (eventData: unknown): Promise<void> => {
    if (!userId) return
    const data = eventData as PusherData
    const notification = data?.data?.notificationCreated
    if (!notification) return
    const notifUserId = String(notification.userId || '')
    if (notifUserId !== String(userId)) return
    const notifId = String(notification.id || '')
    if (!notifId || processedIds.current.has(notifId)) return
    processedIds.current.add(notifId)
    await showToast('New notification received.', 'info', 7000)
    await onRefetch()
  }, [userId, onRefetch, showToast])

  useEffect(() => {
    if (!userId) return
    const channel = 'project-tracker'
    const unsubscribe = subscribeToPusherEvent(channel, 'notification_created', handleNotification)
    return () => { unsubscribe() }
  }, [userId, handleNotification])
}

