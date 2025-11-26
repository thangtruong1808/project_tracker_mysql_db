/**
 * SidebarUserProfile Component
 * User profile menu item for sidebar navigation with expandable sub-items
 * Displays user initials and expands to show name, email, role, and logout as sub-items
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

interface SidebarUserProfileProps {
  isOpen: boolean
}

/**
 * SidebarUserProfile Component
 * Renders user profile as an expandable sidebar menu item with sub-items
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param isOpen - Whether sidebar is open or collapsed
 * @returns JSX element containing user profile menu item with sub-items
 */
const SidebarUserProfile = ({ isOpen }: SidebarUserProfileProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  if (!user) return null

  /**
   * Handle user logout
   * Displays success toast, clears auth state, and redirects to home
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleLogout = async () => {
    await Promise.resolve()
    setIsExpanded(false)
    await showToast('Logged out successfully. See you again!', 'info', 7000)
    await logout()
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  /**
   * Toggle expanded state
   * Expands or collapses the user profile sub-items
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const toggleExpand = async () => {
    await Promise.resolve()
    setIsExpanded(!isExpanded)
  }

  return (
    /* Sidebar user profile list item container */
    <li>
      {/* Main User Profile Item - Expandable button */}
      <button
        onClick={toggleExpand}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="User profile menu"
        aria-expanded={isExpanded}
      >
        {/* User Initials Avatar */}
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white text-sm font-medium flex-shrink-0">
          {user.initials}
        </div>
        {isOpen && (
          <>
            {/* User Name and Role Display */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
            {/* Expand/Collapse Arrow Icon */}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Expanded Sub-items - Email and Logout options */}
      {isOpen && isExpanded && (
        <ul className="mt-1 space-y-2 border-l-2 border-gray-200">
          {/* Email Sub-item Display */}
          <li>
            <div className="flex items-center space-x-3 px-2 py-2 rounded-lg text-gray-700">
              {/* Email Icon SVG */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {/* Email Label and Value */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900 truncate">{user.email}</p>
              </div>
            </div>
          </li>

          {/* Logout Sub-item Button */}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-2 py-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              {/* Logout Icon SVG */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </li>
        </ul>
      )}
    </li>
  )
}

export default SidebarUserProfile
