/**
 * Navbar Component
 * Main navigation bar with logo, nav items, and user profile dropdown
 * Highlights active page and includes icons for each nav item
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { Link } from 'react-router-dom'
import Logo from './Logo'
import UserProfileDropdown from './UserProfileDropdown'
import ProjectHeaderBio from './ProjectHeaderBio'
import SearchDrawer from './SearchDrawer'
import NotificationDrawer from './NotificationDrawer'
import NavbarDesktopMenu from './NavbarDesktopMenu'
import NavbarMobileMenu from './NavbarMobileMenu'
import { HomeIcon, DashboardIcon, ProjectsIcon, NotificationsIcon, AboutIcon, SearchIcon, MenuIcon, CloseIcon } from './NavbarIcons'
import { useNavbar } from '../hooks/useNavbar'

/**
 * Navbar Component
 * Main navigation bar with responsive design for desktop and mobile
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the navigation bar
 */
const Navbar = () => {
  const {
    isMenuOpen,
    isSearchDrawerOpen,
    isNotificationDrawerOpen,
    isAuthenticated,
    user,
    notificationsLoading,
    userNotifications,
    closeSearchDrawer,
    closeNotificationsDrawer,
    toggleMenu,
    handleMenuClose,
    isActive,
    getNavItems,
    renderNavIcon,
  } = useNavbar()

  const navItems = getNavItems({ HomeIcon, ProjectsIcon, AboutIcon, SearchIcon, DashboardIcon, NotificationsIcon })

  return (
    /* Main navigation bar container */
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

          {/* Desktop Navigation Menu */}
          <NavbarDesktopMenu navItems={navItems} isActive={isActive} renderNavIcon={renderNavIcon} />

          {/* User Profile Section - Desktop */}
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
              {/* Mobile menu toggle icon */}
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <NavbarMobileMenu
          isOpen={isMenuOpen}
          navItems={navItems}
          isActive={isActive}
          renderNavIcon={renderNavIcon}
          isAuthenticated={isAuthenticated}
          onMenuClose={handleMenuClose}
        />
      </div>
      {/* Search Drawer overlay */}
      <SearchDrawer isOpen={isSearchDrawerOpen} onClose={closeSearchDrawer} />
      {/* Notification Drawer overlay */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={closeNotificationsDrawer}
        notifications={userNotifications}
        isLoading={notificationsLoading}
        userId={user?.id}
      />
    </nav>
  )
}

export default Navbar
