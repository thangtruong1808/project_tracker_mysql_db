/**
 * QuickActions Component
 * Displays quick action buttons for common dashboard tasks
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { Link } from 'react-router-dom'

/**
 * QuickActions Component
 * Renders quick action buttons for dashboard
 * 
 * @returns JSX element containing quick action buttons
 */
const QuickActions = () => {
  /**
   * Handle create project action
   * Navigates to projects page (create functionality can be added later)
   */
  const handleCreateProject = async () => {
    // Navigate to projects page where user can create new project
    window.location.href = '/projects'
  }

  /**
   * Handle view all projects action
   * Navigates to projects page
   */
  const handleViewProjects = async () => {
    window.location.href = '/projects'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCreateProject}
          className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-gray-700 group-hover:text-blue-600 font-medium">
            Create Project
          </span>
        </button>
        <Link
          to="/projects"
          onClick={handleViewProjects}
          className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-gray-700 group-hover:text-blue-600 font-medium">
            View All Projects
          </span>
        </Link>
      </div>
    </div>
  )
}

export default QuickActions

