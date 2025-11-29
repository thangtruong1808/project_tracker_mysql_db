/**
 * useNavbar Custom Hook
 * Handles navigation bar state management and nav item generation
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavbarNotifications } from './useNavbarNotifications'

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
  userNotifications: Array<{ id: string; userId: string; message: string; isRead: boolean; createdAt: string }>
  unreadCount: number
  openSearchDrawer: () => Promise<void>
  closeSearchDrawer: () => Promise<void>
  openNotificationsDrawer: () => Promise<void>
  closeNotificationsDrawer: () => Promise<void>
  toggleMenu: () => Promise<void>
  handleMenuClose: () => Promise<void>
  isActive: (href: string) => boolean
  hasDashboardAccess: () => boolean
  getNavItems: (icons: { HomeIcon: React.FC; ProjectsIcon: React.FC; AboutIcon: React.FC; SearchIcon: React.FC; DashboardIcon: React.FC; NotificationsIcon: React.FC }) => NavItem[]
  renderNavIcon: (item: NavItem) => React.ReactNode
}

/**
 * Custom hook for navbar state and logic management
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Object containing navbar state and handler functions
 */
export const useNavbar = (): UseNavbarResult => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false)
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  const { notificationsLoading, userNotifications, unreadCount, refetchNotifications } =
    useNavbarNotifications(isAuthenticated, user?.id)

  /**
   * Determine if current user has privileged dashboard access
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @returns True if user has admin or project manager role
   */
  const hasDashboardAccess = useCallback((): boolean => {
    if (!isAuthenticated || !user?.role) return false
    const normalizedRole = user.role.toLowerCase()
    return normalizedRole === 'admin' || normalizedRole === 'project manager'
  }, [isAuthenticated, user?.role])

  /**
   * Open the search drawer
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const openSearchDrawer = useCallback(async (): Promise<void> => {
    await Promise.resolve()
    setIsSearchDrawerOpen(true)
  }, [])

  /**
   * Close the search drawer
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const closeSearchDrawer = useCallback(async (): Promise<void> => {
    await Promise.resolve()
    setIsSearchDrawerOpen(false)
  }, [])

  /**
   * Open notifications drawer with fresh data
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const openNotificationsDrawer = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return
    await refetchNotifications()
    setIsNotificationDrawerOpen(true)
  }, [isAuthenticated, refetchNotifications])

  /**
   * Close notifications drawer
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const closeNotificationsDrawer = useCallback(async (): Promise<void> => {
    await Promise.resolve()
    setIsNotificationDrawerOpen(false)
  }, [])

  /**
   * Toggle mobile menu visibility
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const toggleMenu = useCallback(async (): Promise<void> => {
    await Promise.resolve()
    setIsMenuOpen((prev) => !prev)
  }, [])

  /**
   * Handle mobile menu close
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleMenuClose = useCallback(async (): Promise<void> => {
    await Promise.resolve()
    setIsMenuOpen(false)
  }, [])

  /**
   * Check if nav item is currently active
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param href - Navigation href to check
   * @returns True if the href matches current location
   */
  const isActive = useCallback((href: string): boolean => {
    if (!href) return false
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }, [location.pathname])

  /**
   * Generate navigation items based on auth status and role
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param icons - Object containing icon components
   * @returns Array of navigation items
   */
  const getNavItems = useCallback((icons: { HomeIcon: React.FC; ProjectsIcon: React.FC; AboutIcon: React.FC; SearchIcon: React.FC; DashboardIcon: React.FC; NotificationsIcon: React.FC }): NavItem[] => {
    const items: NavItem[] = [
      { label: 'Home', href: '/', icon: <icons.HomeIcon /> },
      { label: 'Projects', href: '/projects', icon: <icons.ProjectsIcon /> },
      { label: 'About', href: '/about', icon: <icons.AboutIcon /> },
      { label: 'Search', onClick: openSearchDrawer, icon: <icons.SearchIcon /> },
    ]
    if (hasDashboardAccess()) items.push({ label: 'Dashboard', href: '/dashboard', icon: <icons.DashboardIcon /> })
    if (isAuthenticated) items.push({ label: 'Notifications', onClick: openNotificationsDrawer, icon: <icons.NotificationsIcon /> })
    return items
  }, [hasDashboardAccess, isAuthenticated, openSearchDrawer, openNotificationsDrawer])

  /**
   * Render nav icon with optional notification badge
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param item - Navigation item to render icon for
   * @returns React node containing icon with optional badge
   */
  const renderNavIcon = useCallback((item: NavItem): React.ReactNode => {
    if (item.label !== 'Notifications' || unreadCount === 0) return item.icon
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
  }, [unreadCount])

  return {
    isMenuOpen, isSearchDrawerOpen, isNotificationDrawerOpen, isAuthenticated, user,
    notificationsLoading, userNotifications, unreadCount, openSearchDrawer, closeSearchDrawer,
    openNotificationsDrawer, closeNotificationsDrawer, toggleMenu, handleMenuClose,
    isActive, hasDashboardAccess, getNavItems, renderNavIcon,
  }
}
