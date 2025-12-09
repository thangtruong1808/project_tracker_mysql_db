/**
 * usePusherNotificationRealtime Hook
 * Handles Pusher subscriptions for notification real-time updates
 * Replaces GraphQL subscriptions with Pusher for better compatibility
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect, useRef } from 'react'
import { subscribeToPusherEvent } from '../lib/pusher'

type ToastVariant = 'success' | 'info' | 'error'

interface UsePusherNotificationRealtimeParams {
  userId: string | undefined
  onRefetch: () => Promise<void>
  showToast: (message: string, variant: ToastVariant, duration?: number) => Promise<void> | void
}

/**
 * Subscribe to Pusher events for real-time notification updates
 * Listens for new notifications for the specified user
 *
 * @author Thang Truong
 * @date 2025-12-09
 * @param params - Hook parameters
 */
export const usePusherNotificationRealtime = ({
  userId,
  onRefetch,
  showToast,
}: UsePusherNotificationRealtimeParams): void => {
  const processedNotificationIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) {
      return
    }

    const channel = 'project-tracker'

    /**
     * Handle notification created event
     *
     * @author Thang Truong
     * @date 2025-12-09
     */
    const unsubscribe = subscribeToPusherEvent(
      channel,
      'notification_created',
      async (data: any) => {
        if (data?.data?.notificationCreated) {
          const newNotification = data.data.notificationCreated
          // Check if notification is for this user
          if (newNotification.userId === userId) {
            const notificationId = newNotification.id
            if (!notificationId || processedNotificationIds.current.has(notificationId)) {
              return
            }
            processedNotificationIds.current.add(notificationId)
            await showToast('New notification received.', 'info', 7000)
            await onRefetch()
          }
        }
      }
    )

    // Cleanup subscription on unmount or when userId changes
    return () => {
      unsubscribe()
    }
  }, [userId, onRefetch, showToast])
}

