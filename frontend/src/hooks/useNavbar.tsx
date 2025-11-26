/**
 * useNavbar Custom Hook
 * Handles navigation bar state management, notifications, and nav item generation
 * Extracted from Navbar component for better separation of concerns
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import { NOTIFICATION_CREATED_SUBSCRIPTION } from '../graphql/subscriptions'

interface NotificationRecord {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
}

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

interface UseNavbarResult {
  isMenuOpen: boolean
  isSearchDrawerOpen: boolean
  isNotificationDrawerOpen: boolean
  isAuthenticated: boolean
  user: ReturnType<typeof useAuth>['user']
  notificationsLoading: boolean
  userNotifications: NotificationRecord[]
  unreadCount: number
  openSearchDrawer: () => Promise<void>
  closeSearchDrawer: () => Promise<void>
  openNotificationsDrawer: () => Promise<void>
  closeNotificationsDrawer: () => Promise<void>
  toggleMenu: () => Promise<void>
  handleMenuClose: () => Promise<void>
  isActive: (href: string) => boolean
  hasDashboardAccess: () => boolean
  getNavItems: (icons: {
    HomeIcon: React.FC
    ProjectsIcon: React.FC
    AboutIcon: React.FC
    SearchIcon: React.FC
    DashboardIcon: React.FC
    NotificationsIcon: React.FC
  }) => NavItem[]
  renderNavIcon: (item: NavItem) => React.ReactNode
}

/**
 * Custom hook for navbar state and logic management
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns Object containing navbar state and handler functions
 */
export const useNavbar = (): UseNavbarResult => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false)
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  const {
    data: notificationsData,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<{ notifications: NotificationRecord[] }>(NOTIFICATIONS_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  })

  useSubscription(NOTIFICATION_CREATED_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
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
    if (!user?.id) {
      return []
    }
    return (notificationsData?.notifications || []).filter((notification) => notification.userId === user.id)
  }, [notificationsData?.notifications, user?.id])

  const unreadCount = userNotifications.filter((notification) => !notification.isRead).length

  /**
   * Determine if current user has privileged dashboard access
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const hasDashboardAccess = useCallback(() => {
    if (!isAuthenticated || !user?.role) {
      return false
    }
    const normalizedRole = user.role.toLowerCase()
    return normalizedRole === 'admin' || normalizedRole === 'project manager'
  }, [isAuthenticated, user?.role])

  /**
   * Open the search drawer
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const openSearchDrawer = useCallback(async () => {
    await Promise.resolve()
    setIsSearchDrawerOpen(true)
  }, [])

  /**
   * Close the search drawer
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const closeSearchDrawer = useCallback(async () => {
    await Promise.resolve()
    setIsSearchDrawerOpen(false)
  }, [])

  /**
   * Open notifications drawer with fresh data
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const openNotificationsDrawer = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }
    await refetchNotifications()
    setIsNotificationDrawerOpen(true)
  }, [isAuthenticated, refetchNotifications])

  /**
   * Close notifications drawer
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const closeNotificationsDrawer = useCallback(async () => {
    await Promise.resolve()
    setIsNotificationDrawerOpen(false)
  }, [])

  /**
   * Toggle mobile menu visibility
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const toggleMenu = useCallback(async () => {
    await Promise.resolve()
    setIsMenuOpen((prev) => !prev)
  }, [])

  /**
   * Handle mobile menu close
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleMenuClose = useCallback(async () => {
    await Promise.resolve()
    setIsMenuOpen(false)
  }, [])

  /**
   * Check if nav item is currently active
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const isActive = useCallback(
    (href: string) => {
      if (!href) {
        return false
      }
      if (href === '/') {
        return location.pathname === '/'
      }
      return location.pathname.startsWith(href)
    },
    [location.pathname]
  )

  /**
   * Generate navigation items based on auth status and role
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const getNavItems = useCallback(
    (icons: {
      HomeIcon: React.FC
      ProjectsIcon: React.FC
      AboutIcon: React.FC
      SearchIcon: React.FC
      DashboardIcon: React.FC
      NotificationsIcon: React.FC
    }): NavItem[] => {
      const items: NavItem[] = [
        { label: 'Home', href: '/', icon: <icons.HomeIcon /> },
        { label: 'Projects', href: '/projects', icon: <icons.ProjectsIcon /> },
        { label: 'About', href: '/about', icon: <icons.AboutIcon /> },
        { label: 'Search', onClick: openSearchDrawer, icon: <icons.SearchIcon /> },
      ]

      if (hasDashboardAccess()) {
        items.push({ label: 'Dashboard', href: '/dashboard', icon: <icons.DashboardIcon /> })
      }

      if (isAuthenticated) {
        items.push({ label: 'Notifications', onClick: openNotificationsDrawer, icon: <icons.NotificationsIcon /> })
      }

      return items
    },
    [hasDashboardAccess, isAuthenticated, openSearchDrawer, openNotificationsDrawer]
  )

  /**
   * Render nav icon with optional notification badge
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const renderNavIcon = useCallback(
    (item: NavItem): React.ReactNode => {
      if (item.label !== 'Notifications' || unreadCount === 0) {
        return item.icon
      }
      const badgeLabel = unreadCount > 99 ? '99+' : unreadCount.toString()
      return (
        /* Navigation icon with notification badge */
        <span className="relative inline-flex">
          {item.icon}
          <span className="absolute -top-2 -right-2 min-w-[1.1rem] h-[1.1rem] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center px-1">
            {badgeLabel}
          </span>
        </span>
      )
    },
    [unreadCount]
  )

  return {
    isMenuOpen,
    isSearchDrawerOpen,
    isNotificationDrawerOpen,
    isAuthenticated,
    user,
    notificationsLoading,
    userNotifications,
    unreadCount,
    openSearchDrawer,
    closeSearchDrawer,
    openNotificationsDrawer,
    closeNotificationsDrawer,
    toggleMenu,
    handleMenuClose,
    isActive,
    hasDashboardAccess,
    getNavItems,
    renderNavIcon,
  }
}

