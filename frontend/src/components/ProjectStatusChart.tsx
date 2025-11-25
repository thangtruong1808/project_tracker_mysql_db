/**
 * ProjectStatusChart Component
 * Displays a visual chart showing project status distribution
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

interface Project {
  id: string
  status: string
}

interface ProjectStatusChartProps {
  projects: Project[]
  isLoading: boolean
}

/**
 * ProjectStatusChart Component
 * Renders a visual representation of project status distribution
 * 
 * @param projects - Array of project objects
 * @param isLoading - Loading state indicator
 * @returns JSX element containing project status chart
 */
const ProjectStatusChart = ({ projects, isLoading }: ProjectStatusChartProps) => {
  /**
   * Calculate project status distribution
   * Counts projects by status and calculates percentages
   * 
   * @returns Object containing status counts and percentages
   */
  const getStatusDistribution = () => {
    const total = projects.length
    if (total === 0) {
      return {
        planning: { count: 0, percentage: 0 },
        inProgress: { count: 0, percentage: 0 },
        completed: { count: 0, percentage: 0 },
      }
    }

    const planning = projects.filter((p) => p.status === 'PLANNING').length
    const inProgress = projects.filter((p) => p.status === 'IN_PROGRESS').length
    const completed = projects.filter((p) => p.status === 'COMPLETED').length

    return {
      planning: { count: planning, percentage: Math.round((planning / total) * 100) },
      inProgress: { count: inProgress, percentage: Math.round((inProgress / total) * 100) },
      completed: { count: completed, percentage: Math.round((completed / total) * 100) },
    }
  }

  const distribution = getStatusDistribution()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Status</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Status</h2>
        <p className="text-gray-600 text-center py-8">No projects to display</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Status</h2>
      <div className="space-y-4">
        {/* Planning Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Planning</span>
            </div>
            <span className="text-sm text-gray-600">
              {distribution.planning.count} ({distribution.planning.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${distribution.planning.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* In Progress Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">In Progress</span>
            </div>
            <span className="text-sm text-gray-600">
              {distribution.inProgress.count} ({distribution.inProgress.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${distribution.inProgress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Completed Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Completed</span>
            </div>
            <span className="text-sm text-gray-600">
              {distribution.completed.count} ({distribution.completed.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${distribution.completed.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectStatusChart

