/**
 * Sidebar Component
 * Collapsible sidebar navigation with menu items based on database relationships
 * Displays navigation items for Projects, Tasks, Team Members, Tags, Activity, and Notifications
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import ProjectHeaderBio from './ProjectHeaderBio'
import SidebarUserProfile from './SidebarUserProfile'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

/**
 * Sidebar Component
 * Renders collapsible sidebar with navigation menu
 * 
 * @param isOpen - Whether sidebar is open or collapsed
 * @param onToggle - Function to toggle sidebar state
 * @returns JSX element containing sidebar navigation
 */
const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation()

  /**
   * Check if a route is currently active
   * Only one item should be active at a time
   * Exact match for dashboard, prefix match for others
   * 
   * @param path - Route path to check
   * @param isDashboard - Whether this is the dashboard route
   * @returns true if route is active, false otherwise
   */
  const isActive = (path: string, isDashboard: boolean = false) => {
    if (isDashboard) {
      // Dashboard should only be active on exact match
      return location.pathname === path
    }
    // Other routes use prefix matching but exclude dashboard
    // This ensures only one item is active at a time
    if (location.pathname === '/dashboard') {
      return false
    }
    return location.pathname.startsWith(path + '/') || location.pathname === path
  }

  /**
   * Menu items based on database relationships
   * Organized by main entities: Users, Projects, Tasks, Team, Tags, Activity, Notifications
   */
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Users',
      path: '/dashboard/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      path: '/dashboard/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      path: '/dashboard/tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'team',
      label: 'Team Members',
      path: '/dashboard/team',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'tags',
      label: 'Tags',
      path: '/dashboard/tags',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'activity',
      label: 'Activity Logs',
      path: '/dashboard/activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      path: '/dashboard/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ]

  return (
    <aside
      className={`bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'w-64' : 'w-20'
        } ${isOpen ? 'block' : 'hidden lg:block'}`}
    >
      {/* Sidebar Header - Fixed at top */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-4">
          {isOpen && (
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              aria-label="Navigate to home"
            >
              <Logo size="small" />
              <span className="font-semibold text-gray-900">Project Tracker</span>
            </Link>
          )}
          {!isOpen && (
            <Link
              to="/"
              className="mx-auto hover:opacity-80 transition-opacity"
              aria-label="Navigate to home"
            >
              <Logo size="small" />
            </Link>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
        <ProjectHeaderBio isOpen={isOpen} />
      </div>

      {/* Content Area - Flex container for navigation and footer */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Navigation Menu - Scrollable - Takes remaining space */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isDashboard = item.id === 'dashboard'
              const active = isActive(item.path, isDashboard)
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-6 rounded-lg transition-colors ${active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <span className={active ? 'text-blue-600' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                    {isOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile Footer - Fixed at absolute bottom of sidebar */}
        <div className="border-t border-gray-200 pt-2 pb-2 flex-shrink-0 bg-white">
          <ul className="space-y-1 px-2">
            <SidebarUserProfile isOpen={isOpen} />
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

