/**
 * DashboardRecentActivity Component
 * Displays recent activity log in 2 columns (projects and tasks) with scrollable lists
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'

interface Activity {
  id: string
  action: string
  type: string
  projectId: string | null
  taskId: string | null
  createdAt: string
}

interface DashboardRecentActivityProps {
  activities: Activity[]
  isLoading: boolean
}

/**
 * DashboardRecentActivity - Shows project and task activities in 2-column layout
 * @author Thang Truong
 * @date 2025-11-27
 */
const DashboardRecentActivity = ({ activities, isLoading }: DashboardRecentActivityProps) => {
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

  /** Check if activity is project-related - @author Thang Truong @date 2025-11-27 */
  const isProjectActivity = (activity: Activity): boolean => {
    const type = activity.type.toUpperCase()
    return type.startsWith('PROJECT') || (activity.projectId !== null && !type.startsWith('TASK'))
  }

  /** Check if activity is task-related - @author Thang Truong @date 2025-11-27 */
  const isTaskActivity = (activity: Activity): boolean => {
    const type = activity.type.toUpperCase()
    return type.startsWith('TASK') || activity.taskId !== null
  }

  /** Get 10 most recent project activities - @author Thang Truong @date 2025-11-27 */
  const projectActivities = useMemo(() =>
    [...activities]
      .filter(isProjectActivity)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
    [activities]
  )

  /** Get 10 most recent task activities - @author Thang Truong @date 2025-11-27 */
  const taskActivities = useMemo(() =>
    [...activities]
      .filter(isTaskActivity)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
    [activities]
  )

  if (isLoading) {
    return (
      /* Loading skeleton for 2-column layout */
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(col => (
            <div key={col}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-2 animate-pulse">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /** Render activity item - @author Thang Truong @date 2025-11-27 */
  const renderActivityItem = (activity: Activity, iconColor: string, icon: JSX.Element) => (
    <div key={activity.id} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 line-clamp-1">{activity.action}</p>
        <p className="text-[10px] text-gray-400">{formatRelativeTime(activity.createdAt)}</p>
      </div>
    </div>
  )

  const projectIcon = <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  const taskIcon = <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>

  return (
    /* Recent activity card with 2-column layout and scrollable lists */
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link to="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All →
        </Link>
      </div>

      {/* 2-column layout: Projects and Tasks */}
      <div className="grid grid-cols-2 gap-4">
        {/* Project Activities Column */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
            <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">{projectIcon}</span>
            Projects ({projectActivities.length})
          </h3>
          {projectActivities.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No project activity</p>
          ) : (
            <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {projectActivities.map(activity => renderActivityItem(activity, 'bg-blue-100 text-blue-600', projectIcon))}
            </div>
          )}
        </div>

        {/* Task Activities Column */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
            <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">{taskIcon}</span>
            Tasks ({taskActivities.length})
          </h3>
          {taskActivities.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No task activity</p>
          ) : (
            <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {taskActivities.map(activity => renderActivityItem(activity, 'bg-emerald-100 text-emerald-600', taskIcon))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardRecentActivity
