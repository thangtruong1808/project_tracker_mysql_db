/**
 * useNavbarNotifications Custom Hook
 * Handles notification fetching and real-time updates for navbar via Pusher
 * Waits for channel to be ready before subscribing
 * Uses simplified deduplication to prevent blocking
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import { subscribeToPusherEvent } from '../lib/pusher'
import { usePusher } from '../context/PusherContext'

interface NotificationRecord {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
}

interface UseNavbarNotificationsResult {
  notificationsLoading: boolean
  userNotifications: NotificationRecord[]
  unreadCount: number
  refetchNotifications: () => Promise<unknown>
}

type PusherData = { data?: { notificationCreated?: { id?: string; userId?: string } } }

/**
 * Custom hook for managing navbar notifications with Pusher real-time updates
 * Subscribes only once per userId change to prevent loops
 * @author Thang Truong
 * @date 2025-12-09
 * @param isAuthenticated - Whether user is authenticated
 * @param userId - Current user ID
 * @returns Object containing notification data and handlers
 */
export const useNavbarNotifications = (
  isAuthenticated: boolean,
  userId: string | undefined
): UseNavbarNotificationsResult => {
  /** Track processed notifications with timestamp @author Thang Truong @date 2025-12-09 */
  const processedNotifications = useRef<Map<string, number>>(new Map())
  const { channelReady } = usePusher()
  const { data, loading, refetch } = useQuery<{ notifications: NotificationRecord[] }>(
    NOTIFICATIONS_QUERY,
    { skip: !isAuthenticated, fetchPolicy: 'network-only' }
  )

  /** Store refetch in ref to prevent re-subscription on refetch changes */
  const refetchRef = useRef(refetch)
  const userIdRef = useRef(userId)

  /** Update refs when props change without triggering re-subscription */
  useEffect(() => {
    refetchRef.current = refetch
    userIdRef.current = userId
  }, [refetch, userId])

  /**
   * Clear old processed notifications periodically (older than 5 seconds)
   * Prevents memory issues and allows legitimate duplicate events
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      processedNotifications.current.forEach((timestamp, key) => {
        if (now - timestamp > 5000) {
          processedNotifications.current.delete(key)
        }
      })
    }, 10000) // Clean every 10 seconds
    return () => clearInterval(interval)
  }, [])

  /**
   * Subscribe to Pusher for real-time notification updates
   * Only re-subscribes when userId or channel ready state changes
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    if (!userId || !channelReady) return

    /**
     * Handle incoming Pusher notification events
     * @author Thang Truong
     * @date 2025-12-09
     */
    const handleNotification = async (eventData: unknown): Promise<void> => {
      if (!userIdRef.current) return
      const pusherData = eventData as PusherData
      const notification = pusherData?.data?.notificationCreated
      if (!notification) return
      const notifUserId = String(notification.userId || '')
      if (notifUserId !== String(userIdRef.current)) return
      const notifId = String(notification.id || '')
      if (!notifId) return
      /** Use notification ID with 5 second deduplication window @author Thang Truong @date 2025-12-09 */
      const now = Date.now()
      const lastProcessed = processedNotifications.current.get(notifId)
      if (lastProcessed && now - lastProcessed < 5000) return
      processedNotifications.current.set(notifId, now)
      await refetchRef.current()
    }

    const channel = 'project-tracker'
    const unsubscribe = subscribeToPusherEvent(channel, 'notification_created', handleNotification)
    return () => {
      unsubscribe()
    }
  }, [userId, channelReady]) // Wait for channelReady

  /** Memoized filtered notifications for current user @author Thang Truong @date 2025-12-09 */
  const userNotifications = useMemo(() => {
    if (!userId) return []
    return (data?.notifications || []).filter((n) => String(n.userId) === String(userId))
  }, [data?.notifications, userId])

  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  return { notificationsLoading: loading, userNotifications, unreadCount, refetchNotifications: refetch }
}
