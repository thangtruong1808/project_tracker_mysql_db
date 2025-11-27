/**
 * DashboardRecentProjects Component
 * Displays recent projects with status badges, percentages and real-time data
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface DashboardRecentProjectsProps {
  projects: Project[]
  isLoading: boolean
}

/**
 * DashboardRecentProjects - Shows recent projects with status distribution percentages
 * @author Thang Truong
 * @date 2025-11-27
 */
const DashboardRecentProjects = ({ projects, isLoading }: DashboardRecentProjectsProps) => {
  /** Get status badge styling - @author Thang Truong @date 2025-11-27 */
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      planning: 'bg-yellow-100 text-yellow-800', active: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800', cancelled: 'bg-red-100 text-red-800',
    }
    return styles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  /** Format status label - @author Thang Truong @date 2025-11-27 */
  const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  /** Calculate status distribution with percentages */
  const statusStats = useMemo(() => {
    const total = projects.length
    if (total === 0) return { planning: 0, inProgress: 0, completed: 0, planningPct: 0, inProgressPct: 0, completedPct: 0 }
    const planning = projects.filter(p => ['planning', 'PLANNING'].includes(p.status)).length
    const inProgress = projects.filter(p => ['active', 'in_progress', 'IN_PROGRESS', 'ACTIVE'].includes(p.status)).length
    const completed = projects.filter(p => ['completed', 'COMPLETED'].includes(p.status)).length
    return {
      planning, inProgress, completed,
      planningPct: Math.round((planning / total) * 100),
      inProgressPct: Math.round((inProgress / total) * 100),
      completedPct: Math.round((completed / total) * 100),
    }
  }, [projects])

  /** Get 10 most recent projects sorted by updatedAt - @author Thang Truong @date 2025-11-27 */
  const recentProjects = useMemo(() =>
    [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10),
    [projects]
  )

  /** Format relative time - @author Thang Truong @date 2025-11-27 */
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      /* Loading skeleton */
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-3 border border-gray-100 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statusBars = [
    { label: 'Completed', pct: statusStats.completedPct, count: statusStats.completed, color: 'bg-emerald-500' },
    { label: 'In Progress', pct: statusStats.inProgressPct, count: statusStats.inProgress, color: 'bg-blue-500' },
    { label: 'Planning', pct: statusStats.planningPct, count: statusStats.planning, color: 'bg-yellow-500' },
  ]

  return (
    /* Recent projects card with status distribution and percentages */
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
        <Link to="/dashboard/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</Link>
      </div>

      {/* Status distribution mini bars */}
      <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        {statusBars.map((bar, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className={`w-2 h-2 rounded-full ${bar.color}`}></span>
              <span className="text-xs text-gray-500">{bar.label}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{bar.count} <span className="text-xs text-gray-400">({bar.pct}%)</span></p>
          </div>
        ))}
      </div>

      {recentProjects.length === 0 ? (
        <div className="text-center py-6">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 text-sm">No projects yet</p>
        </div>
      ) : (
        <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="space-y-2">
            {recentProjects.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{project.name}</h3>
                  <p className="text-xs text-gray-400">{formatRelativeTime(project.updatedAt)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardRecentProjects
