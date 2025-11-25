/**
 * RecentProjects Component
 * Displays a list of recent projects with status badges and quick actions
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { Link } from 'react-router-dom'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface RecentProjectsProps {
  projects: Project[]
  isLoading: boolean
}

/**
 * RecentProjects Component
 * Renders a list of recent projects with status information
 * 
 * @param projects - Array of project objects
 * @param isLoading - Loading state indicator
 * @returns JSX element containing recent projects list
 */
const RecentProjects = ({ projects, isLoading }: RecentProjectsProps) => {
  /**
   * Get status badge styling based on project status
   * 
   * @param status - Project status string
   * @returns CSS classes for status badge
   */
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PLANNING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
    }
    return statusStyles[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Get status label for display
   * 
   * @param status - Project status string
   * @returns Human-readable status label
   */
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      PLANNING: 'Planning',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    }
    return statusLabels[status] || status
  }

  /**
   * Format date for display
   * 
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  /**
   * Get recent projects (last 5)
   * Sorted by updated date, most recent first
   * Creates a copy of the array before sorting to avoid mutating read-only props
   */
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recentProjects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
          <p className="text-gray-600 mb-4">No projects yet</p>
          <Link
            to="/projects"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Create Your First Project
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
        <Link
          to="/projects"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {recentProjects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}
              >
                {getStatusLabel(project.status)}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {project.description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Updated {formatDate(project.updatedAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentProjects

