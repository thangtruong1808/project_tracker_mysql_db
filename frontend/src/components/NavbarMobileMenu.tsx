/**
 * NavbarMobileMenu Component
 * Mobile navigation menu with collapsible navigation items
 * Displays nav items vertically for mobile viewport
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { Link } from 'react-router-dom'

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

interface NavbarMobileMenuProps {
  isOpen: boolean
  navItems: NavItem[]
  isActive: (href: string) => boolean
  renderNavIcon: (item: NavItem) => React.ReactNode
  isAuthenticated: boolean
  onMenuClose: () => void
}

/**
 * NavbarMobileMenu Component
 * Renders vertical collapsible navigation for mobile screens
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param isOpen - Whether the mobile menu is open
 * @param navItems - Array of navigation items
 * @param isActive - Function to check if nav item is active
 * @param renderNavIcon - Function to render nav item icon
 * @param isAuthenticated - Whether user is authenticated
 * @param onMenuClose - Callback to close the menu
 * @returns JSX element containing the mobile navigation menu
 */
const NavbarMobileMenu = ({
  isOpen,
  navItems,
  isActive,
  renderNavIcon,
  isAuthenticated,
  onMenuClose,
}: NavbarMobileMenuProps) => {
  if (!isOpen) {
    return null
  }

  /**
   * Handle navigation item click
   * Triggers item onClick and closes menu
   *
   * @author Thang Truong
   * @date 2025-11-26
   * @param item - Navigation item clicked
   */
  const handleItemClick = async (item: NavItem) => {
    await Promise.resolve()
    item.onClick?.()
    onMenuClose()
  }

  /**
   * Handle link click
   * Closes the mobile menu after navigation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleLinkClick = async () => {
    await Promise.resolve()
    onMenuClose()
  }

  return (
    /* Mobile menu container */
    <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
      {/* Mobile navigation items list */}
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.href ?? '')
          return item.onClick ? (
            /* Mobile navigation button for drawer actions */
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors text-left"
            >
              {renderNavIcon(item)}
              <span>{item.label}</span>
            </button>
          ) : (
            /* Mobile navigation link for page routes */
            <Link
              key={item.href ?? item.label}
              to={item.href ?? '/'}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              onClick={handleLinkClick}
            >
              {renderNavIcon(item)}
              <span>{item.label}</span>
            </Link>
          )
        })}
        {/* Login link for unauthenticated users */}
        {!isAuthenticated && (
          <Link
            to="/login"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
            onClick={handleLinkClick}
          >
            Login
          </Link>
        )}
      </div>
    </div>
  )
}

export default NavbarMobileMenu

