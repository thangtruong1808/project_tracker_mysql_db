/**
 * NavbarIcons Component Collection
 * SVG icon components used in the main navigation bar
 * Extracted from Navbar to maintain component size under 250 lines
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

/**
 * Home icon SVG component
 * Displays house/home iconography for navigation
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the home icon SVG
 */
export const HomeIcon = () => (
  /* Home navigation icon */
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

/**
 * Dashboard icon SVG component
 * Displays grid/dashboard layout iconography
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the dashboard icon SVG
 */
export const DashboardIcon = () => (
  /* Dashboard navigation icon */
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

/**
 * Projects icon SVG component
 * Displays folder iconography for projects navigation
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the projects icon SVG
 */
export const ProjectsIcon = () => (
  /* Projects navigation icon */
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)

/**
 * Notifications icon SVG component
 * Displays bell iconography for notifications
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the notifications icon SVG
 */
export const NotificationsIcon = () => (
  /* Notifications navigation icon */
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a2 2 0 10-4 0v1.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m8 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

/**
 * About icon SVG component
 * Displays info circle iconography for about page
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the about icon SVG
 */
export const AboutIcon = () => (
  /* About navigation icon */
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

/**
 * Search icon SVG component
 * Displays magnifying glass iconography for search functionality
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the search icon SVG
 */
export const SearchIcon = () => (
  /* Search navigation icon */
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

/**
 * Menu icon SVG component
 * Displays hamburger menu iconography for mobile navigation
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the menu icon SVG
 */
export const MenuIcon = () => (
  /* Hamburger menu icon for mobile */
  <path d="M4 6h16M4 12h16M4 18h16" />
)

/**
 * Close icon SVG component
 * Displays X iconography for closing mobile menu
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the close icon SVG
 */
export const CloseIcon = () => (
  /* Close menu icon for mobile */
  <path d="M6 18L18 6M6 6l12 12" />
)

