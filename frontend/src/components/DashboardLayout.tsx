/**
 * DashboardLayout Component
 * Layout wrapper for dashboard pages with sidebar and header
 * Provides consistent layout structure for all dashboard routes
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

/**
 * DashboardLayout Component
 * Main layout component for dashboard pages
 * 
 * @returns JSX element containing dashboard layout with sidebar
 */
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  /**
   * Toggle sidebar open/closed state
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  /**
   * Get the current page title based on the route
   * @returns The title of the current dashboard page
   */
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/dashboard/users')) return 'Users'
    if (path.startsWith('/dashboard/projects')) return 'Projects'
    if (path.startsWith('/dashboard/tasks')) return 'Tasks'
    if (path.startsWith('/dashboard/comments')) return 'Comments'
    if (path.startsWith('/dashboard/team')) return 'Team Members'
    if (path.startsWith('/dashboard/tags')) return 'Tags'
    if (path.startsWith('/dashboard/activity')) return 'Activity Logs'
    if (path.startsWith('/dashboard/notifications')) return 'Notifications'
    return 'Dashboard' // Default title
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}


      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

