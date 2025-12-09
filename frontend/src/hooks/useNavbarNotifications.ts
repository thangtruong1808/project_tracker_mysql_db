/**
 * useNavbarNotifications Custom Hook
 * Handles notification fetching and real-time updates for navbar via Pusher
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useMemo, useEffect, useRef, useCallback } from 'react'
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

type PusherData = { data?: { notificationCreated?: { id?: string; userId?: string } } }

/**
 * Custom hook for managing navbar notifications with Pusher real-time updates
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
  const { data, loading, refetch } = useQuery<{ notifications: NotificationRecord[] }>(
    NOTIFICATIONS_QUERY,
    { skip: !isAuthenticated, fetchPolicy: 'network-only' }
  )

  const handleNotification = useCallback(async (eventData: unknown): Promise<void> => {
    if (!userId) return
    const pusherData = eventData as PusherData
    const notification = pusherData?.data?.notificationCreated
    if (!notification) return
    const notifUserId = String(notification.userId || '')
    if (notifUserId !== String(userId)) return
    const notifId = String(notification.id || '')
    if (!notifId || processedIds.current.has(notifId)) return
    processedIds.current.add(notifId)
    await refetch()
  }, [userId, refetch])

  /** Subscribe to Pusher for real-time notification updates @author Thang Truong @date 2025-12-09 */
  useEffect(() => {
    if (!userId) return
    const channel = 'project-tracker'
    const unsubscribe = subscribeToPusherEvent(channel, 'notification_created', handleNotification)
    return () => { unsubscribe() }
  }, [userId, handleNotification])

  /** Memoized filtered notifications for current user @author Thang Truong @date 2025-12-09 */
  const userNotifications = useMemo(() => {
    if (!userId) return []
    return (data?.notifications || []).filter((n) => String(n.userId) === String(userId))
  }, [data?.notifications, userId])

  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  return { notificationsLoading: loading, userNotifications, unreadCount, refetchNotifications: refetch }
}

