/**
 * NavbarDesktopMenu Component
 * Desktop navigation menu with links and action buttons
 * Displays nav items horizontally for desktop viewport
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

interface NavbarDesktopMenuProps {
  navItems: NavItem[]
  isActive: (href: string) => boolean
  renderNavIcon: (item: NavItem) => React.ReactNode
}

/**
 * NavbarDesktopMenu Component
 * Renders horizontal navigation for desktop screens
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param navItems - Array of navigation items
 * @param isActive - Function to check if nav item is active
 * @param renderNavIcon - Function to render nav item icon
 * @returns JSX element containing the desktop navigation menu
 */
const NavbarDesktopMenu = ({ navItems, isActive, renderNavIcon }: NavbarDesktopMenuProps) => {
  return (
    /* Desktop navigation menu container */
    <div className="hidden md:flex md:items-center md:space-x-8">
      {navItems.map((item) => {
        const active = isActive(item.href ?? '')
        return item.onClick ? (
          /* Navigation button for drawer actions */
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            {renderNavIcon(item)}
            <span>{item.label}</span>
          </button>
        ) : (
          /* Navigation link for page routes */
          <Link
            key={item.href ?? item.label}
            to={item.href ?? '/'}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              active ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            {renderNavIcon(item)}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default NavbarDesktopMenu

