/**
 * Logo Component
 * Reusable logo component that displays the Project Tracker logo image
 * Supports different sizes for various use cases (navbar, forms, etc.)
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import logoImage from '../assets/logos/PT-log.png'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
}

const Logo = ({ size = 'medium', showText = false, className = '' }: LogoProps) => {
  /**
   * Get size classes based on the size prop
   * @returns Tailwind CSS classes for the logo container
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8'
      case 'medium':
        return 'w-10 h-10'
      case 'large':
        return 'w-16 h-16'
      default:
        return 'w-10 h-10'
    }
  }

  /**
   * Get text size classes based on the size prop
   * @returns Tailwind CSS classes for the text
   */
  const getTextSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm'
      case 'medium':
        return 'text-xl'
      case 'large':
        return 'text-2xl'
      default:
        return 'text-xl'
    }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`${getSizeClasses()} bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0`}
      >
        <img
          src={logoImage}
          alt="Project Tracker Logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      {showText && (
        <span
          className={`ml-2 font-semibold text-gray-900 hidden sm:block ${getTextSizeClasses()}`}
        >
          Project Tracker
        </span>
      )}
    </div>
  )
}

export default Logo

