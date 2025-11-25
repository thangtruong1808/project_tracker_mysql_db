/**
 * Navbar Component
 * Main navigation bar with logo, nav items, and user profile dropdown
 * Highlights active page and includes icons for each nav item
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import UserProfileDropdown from './UserProfileDropdown'
import ProjectHeaderBio from './ProjectHeaderBio'
import SearchDrawer from './SearchDrawer'

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  /**
   * Home icon SVG component
   */
  const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )

  /**
   * Dashboard icon SVG component
   */
  const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )

  /**
   * Projects icon SVG component
   */
  const ProjectsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )

  /**
   * About icon SVG component
   */
  const AboutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  /**
   * Search icon SVG component
   * Provides magnifying glass iconography for the search nav item.
   *
   * @author Thang Truong
   * @date 2025-11-24
   */
  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )

  /**
   * Determine if current user has privileged dashboard access (admin or project manager).
   *
   * @author Thang Truong
   * @date 2025-11-24
   */
  const hasDashboardAccess = () => {
    if (!isAuthenticated || !user?.role) {
      return false
    }
    const normalizedRole = user.role.toLowerCase()
    return normalizedRole === 'admin' || normalizedRole === 'project manager'
  }

  /**
   * Open the search drawer
   */
  const openSearchDrawer = () => {
    setIsSearchDrawerOpen(true)
  }

  /**
   * Close the search drawer
   */
  const closeSearchDrawer = () => {
    setIsSearchDrawerOpen(false)
  }

  /**
   * Get navigation items based on authentication status and role.
   * Dashboard appears only for users with privileged roles.
   *
   * @author Thang Truong
   * @date 2025-11-24
   * @returns Array of nav items filtered by authentication status
   */
  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { label: 'Home', href: '/', icon: <HomeIcon /> },
      { label: 'Projects', href: '/projects', icon: <ProjectsIcon /> },
      { label: 'About', href: '/about', icon: <AboutIcon /> },
      { label: 'Search', onClick: openSearchDrawer, icon: <SearchIcon /> },

    ]

    if (hasDashboardAccess()) {
      items.splice(3, 0, { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> })
    }

    return items
  }

  const navItems = getNavItems()

  /**
   * Checks if a nav item is currently active based on location pathname
   * @param href - The href path of the nav item
   * @returns true if the nav item is active, false otherwise
   */
  const isActive = (href: string) => {
    if (!href) {
      return false
    }
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  /**
   * Toggle mobile menu visibility
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo Section with Bio */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <Link to="/" className="flex justify-center">
              <Logo size="medium" showText={true} />
            </Link>
            <ProjectHeaderBio isOpen={true} variant="navbar" />
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => {
              const active = isActive(item.href ?? '')
              return item.onClick ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.href ?? item.label}
                  to={item.href ?? '/'}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Profile Section */}
          <div className="hidden md:flex md:items-center">
            {isAuthenticated && user ? (
              <UserProfileDropdown />
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && user && <UserProfileDropdown className="mr-3" />}
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href ?? '')
                return item.onClick ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.onClick?.()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors text-left"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link
                    key={item.href ?? item.label}
                    to={item.href ?? '/'}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <SearchDrawer isOpen={isSearchDrawerOpen} onClose={closeSearchDrawer} />
    </nav>
  )
}

export default Navbar
