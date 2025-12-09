/**
 * useNavbarNotifications Custom Hook
 * Handles notification fetching and real-time updates for navbar via Pusher
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import { subscribeToPusherEvent } from '../lib/pusher'

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

/**
 * Custom hook for managing navbar notifications with Pusher real-time updates
 *
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
  const processedIds = useRef<Set<string>>(new Set())
  const {
    data: notificationsData,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<{ notifications: NotificationRecord[] }>(NOTIFICATIONS_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  })

  /**
   * Subscribe to Pusher for real-time notification updates
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    if (!userId) return
    const channel = 'project-tracker'
    const unsubscribe = subscribeToPusherEvent(channel, 'notification_created', async (data: unknown) => {
      const eventData = data as { data?: { notificationCreated?: { id: string; userId: string } } }
      const notification = eventData?.data?.notificationCreated
      if (notification && notification.userId === userId) {
        if (!notification.id || processedIds.current.has(notification.id)) return
        processedIds.current.add(notification.id)
        await refetchNotifications()
      }
    })
    return () => { unsubscribe() }
  }, [userId, refetchNotifications])

  /**
   * Memoized filtered notifications for current user
   * @author Thang Truong
   * @date 2025-12-09
   */
  const userNotifications = useMemo(() => {
    if (!userId) return []
    return (notificationsData?.notifications || []).filter((n) => n.userId === userId)
  }, [notificationsData?.notifications, userId])

  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  return { notificationsLoading, userNotifications, unreadCount, refetchNotifications }
}

