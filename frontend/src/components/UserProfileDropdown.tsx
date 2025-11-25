/**
 * UserProfileDropdown Component
 * Dropdown menu component for user profile with name, role, and logout option
 * Displays user initials instead of SVG icon when user is logged in
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

interface UserProfileDropdownProps {
  className?: string
}

const UserProfileDropdown = ({ className = '' }: UserProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  /**
   * Closes dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  /**
   * Handles user logout
   * Displays success toast, clears auth state, and redirects to home
   */
  const handleLogout = async () => {
    setIsOpen(false)
    await showToast('Logged out successfully. See you again!', 'info', 7000)
    await logout()
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  if (!user) return null

  /**
   * Check if component is in sidebar (full width context)
   * Determined by className prop containing 'w-full'
   */
  const isInSidebar = className.includes('w-full')

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Profile Button with Initials */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isInSidebar ? 'w-full justify-between' : 'space-x-2'} ${isInSidebar ? 'p-0' : 'px-3 py-2'} rounded-lg hover:bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2">
          {/* User Initials */}
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white text-sm font-medium">
            {user.initials}
          </div>
          {isInSidebar && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          )}
        </div>
        {/* Dropdown Arrow */}
        {isInSidebar && (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {!isInSidebar && (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${isInSidebar ? 'left-0 bottom-full mb-2' : 'right-0 mt-2'} w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fade-in`}>
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.initials}
                </div>
              </div>
              {/* User Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.role && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {/* Logout Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileDropdown
