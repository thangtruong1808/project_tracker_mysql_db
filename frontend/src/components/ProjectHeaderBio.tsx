/**
 * ProjectHeaderBio Component
 * Displays a short bio/description for the Project Tracker application
 * Used in the sidebar header and navbar logo section to provide context about the project
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

interface ProjectHeaderBioProps {
  isOpen: boolean
  variant?: 'sidebar' | 'navbar'
}

/**
 * ProjectHeaderBio Component
 * Renders project bio text in the sidebar header or navbar logo section
 * 
 * @param isOpen - Whether to show bio text
 * @param variant - Display variant: 'sidebar' or 'navbar' (default: 'sidebar')
 * @returns JSX element containing project bio
 */
const ProjectHeaderBio = ({ isOpen, variant = 'sidebar' }: ProjectHeaderBioProps) => {
  if (!isOpen) return null

  /**
   * Get styling classes based on variant
   * Sidebar variant has padding and border, navbar variant is centered below logo
   */
  const getContainerClasses = () => {
    if (variant === 'navbar') {
      return 'text-center mt-1'
    }
    return 'px-4 pb-4 border-b border-gray-200'
  }

  /**
   * Get text size classes based on variant
   */
  const getTextClasses = () => {
    if (variant === 'navbar') {
      return 'text-xs text-gray-500 hidden lg:block'
    }
    return 'text-xs text-gray-600 leading-relaxed'
  }

  return (
    <div className={getContainerClasses()}>
      <p className={getTextClasses()}>
        Manage projects, tasks, and team collaboration in real-time.
      </p>
    </div>
  )
}

export default ProjectHeaderBio

