/**
 * Footer Component
 * Responsive footer with logo, quick links, API guide, and user profile
 * Displayed on all public pages below the main content
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import FooterApiGuideModal from './FooterApiGuideModal'
import SearchDrawer from './SearchDrawer'
import { useAuth } from '../context/AuthContext'

/**
 * Footer Component
 * Main footer with 4 columns and copyright row
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the footer
 */
const Footer = () => {
  const { isAuthenticated, user } = useAuth()
  const [isApiGuideOpen, setIsApiGuideOpen] = useState(false)
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false)

  /** Open/close API Guide modal - @author Thang Truong @date 2025-11-26 */
  const handleOpenApiGuide = useCallback(async (): Promise<void> => { setIsApiGuideOpen(true) }, [])
  const handleCloseApiGuide = useCallback(async (): Promise<void> => { setIsApiGuideOpen(false) }, [])

  /** Open/close Search drawer (same as Navbar) - @author Thang Truong @date 2025-11-26 */
  const handleOpenSearchDrawer = useCallback(async (): Promise<void> => { setIsSearchDrawerOpen(true) }, [])
  const handleCloseSearchDrawer = useCallback(async (): Promise<void> => { setIsSearchDrawerOpen(false) }, [])

  /** Get user initials - @author Thang Truong @date 2025-11-26 */
  const getUserInitials = (): string => {
    if (!user) return 'G'
    const initials = (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')
    return initials.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'
  }

  /** Get full name - @author Thang Truong @date 2025-11-26 */
  const getFullName = (): string => {
    if (!user) return 'Guest User'
    return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'User'
  }

  return (
    /* Footer container */
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Row 1: 4 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo, Bio, and Social Media */}
          <div className="space-y-4">
            <Logo size="medium" showText={true} />
            <p className="text-sm text-gray-600 leading-relaxed">
              Manage projects, tasks, and team collaboration in real-time. Built for modern teams.
            </p>
            {/* Social Media Links - Official Brand Colors */}
            <div className="flex items-center gap-3 pt-2">
              {/* LinkedIn - Official Blue #0A66C2 */}
              <a
                href="https://www.linkedin.com/in/thang-truong-00b245200/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* GitHub - Official Black #181717 */}
              <a
                href="https://github.com/thangtruong1808"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#181717] hover:bg-black text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              {/* Facebook - Official Blue #1877F2 */}
              <a
                href="https://www.facebook.com/profile.php?id=100051753410222"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#1877F2] hover:bg-[#0d65d9] text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  About
                </Link>
              </li>
              <li>
                {/* Search button - opens SearchDrawer like Navbar */}
                <button
                  onClick={handleOpenSearchDrawer}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Search
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: API Guide */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Developer
            </h3>
            <button
              onClick={handleOpenApiGuide}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              API Guide Testing
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </button>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Learn how to use Postman to test our GraphQL API endpoints.
            </p>
          </div>

          {/* Column 4: User Profile */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Your Profile
            </h3>
            {isAuthenticated && user ? (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {getUserInitials()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{getFullName()}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                    {user.role || 'Member'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Sign in to access your dashboard and manage projects.</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Copyright and Deployment Status */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 flex flex-wrap items-center justify-center gap-1">
            <span>Project Tracker Version 1.0. Built with ❤️ by Thang Truong</span>
            <span className="mx-1">-</span>
            <span className="inline-flex items-center gap-1.5">
              Deployed on
              {/* Vercel Logo */}
              {/* <svg className="w-4 h-4" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" /></svg> */}
              <span className="font-medium text-gray-700">Vercel</span> as
              {/* Live indicator with pulse animation */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* API Guide Modal */}
      <FooterApiGuideModal isOpen={isApiGuideOpen} onClose={handleCloseApiGuide} />

      {/* Search Drawer - same behavior as Navbar */}
      <SearchDrawer isOpen={isSearchDrawerOpen} onClose={handleCloseSearchDrawer} />
    </footer>
  )
}

export default Footer
