/**
 * useNavbarNotifications Custom Hook
 * Handles notification fetching and real-time updates for navbar
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useMemo } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import { NOTIFICATION_CREATED_SUBSCRIPTION } from '../graphql/subscriptions'

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
 * Custom hook for managing navbar notifications
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param isAuthenticated - Whether user is authenticated
 * @param userId - Current user ID
 * @returns Object containing notification data and handlers
 */
export const useNavbarNotifications = (
  isAuthenticated: boolean,
  userId: string | undefined
): UseNavbarNotificationsResult => {
  const {
    data: notificationsData,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<{ notifications: NotificationRecord[] }>(NOTIFICATIONS_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  })

  /**
   * Subscribe to new notifications for real-time updates
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useSubscription(NOTIFICATION_CREATED_SUBSCRIPTION, {
    variables: { userId },
    skip: !userId,
    onData: async () => {
      await refetchNotifications()
    },
  })

  /**
   * Memoized filtered notifications for current user
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const userNotifications = useMemo(() => {
    if (!userId) return []
    return (notificationsData?.notifications || []).filter(
      (notification) => notification.userId === userId
    )
  }, [notificationsData?.notifications, userId])

  const unreadCount = userNotifications.filter((notification) => !notification.isRead).length

  return {
    notificationsLoading,
    userNotifications,
    unreadCount,
    refetchNotifications,
  }
}

