/**
 * DashboardEngagement Component
 * Shows likes and comments statistics for projects and tasks
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'

interface Project { id: string; name: string; likesCount: number; commentsCount: number }
interface Task { id: string; title: string; likesCount: number; commentsCount: number; projectId: string }

interface DashboardEngagementProps {
  projects: Project[]
  tasks: Task[]
  isLoading: boolean
}

/**
 * DashboardEngagement - Shows most liked/commented projects and tasks in 2-column layout
 * @author Thang Truong
 * @date 2025-11-27
 */
const DashboardEngagement = ({ projects, tasks, isLoading }: DashboardEngagementProps) => {
  /** Calculate total engagement stats - @author Thang Truong @date 2025-11-27 */
  const stats = useMemo(() => {
    const totalProjectLikes = projects.reduce((sum, p) => sum + (p.likesCount || 0), 0)
    const totalProjectComments = projects.reduce((sum, p) => sum + (p.commentsCount || 0), 0)
    const totalTaskLikes = tasks.reduce((sum, t) => sum + (t.likesCount || 0), 0)
    const totalTaskComments = tasks.reduce((sum, t) => sum + (t.commentsCount || 0), 0)
    const topProjects = [...projects].sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount)).slice(0, 3)
    const topTasks = [...tasks].sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount)).slice(0, 3)
    return { totalProjectLikes, totalProjectComments, totalTaskLikes, totalTaskComments, topProjects, topTasks }
  }, [projects, tasks])

  if (isLoading) {
    return (
      /* Loading skeleton for slow network */
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3 mb-4 animate-pulse">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const totalLikes = stats.totalProjectLikes + stats.totalTaskLikes
  const totalComments = stats.totalProjectComments + stats.totalTaskComments

  return (
    /* Engagement statistics card with 2-column layout for top items */
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h2>

      {/* Total counts with like (thumbs up) icon */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-xl font-bold text-blue-600">{totalLikes}</span>
          </div>
          <p className="text-xs text-blue-600">Total Likes</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-xl font-bold text-emerald-600">{totalComments}</span>
          </div>
          <p className="text-xs text-emerald-600">Total Comments</p>
        </div>
      </div>

      {/* Top Projects and Top Tasks in 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Projects column */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Top Projects</h3>
          {stats.topProjects.length === 0 ? (
            <p className="text-xs text-gray-400">No engagement yet</p>
          ) : (
            <div className="space-y-1.5">
              {stats.topProjects.map((project, i) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-4 h-4 bg-gray-100 rounded-full text-[10px] flex items-center justify-center font-medium text-gray-500 flex-shrink-0">{i + 1}</span>
                    <span className="text-xs text-gray-700 truncate">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 flex-shrink-0">
                    <span>👍{project.likesCount}</span>
                    <span>💬{project.commentsCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Tasks column */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Top Tasks</h3>
          {stats.topTasks.length === 0 ? (
            <p className="text-xs text-gray-400">No engagement yet</p>
          ) : (
            <div className="space-y-1.5">
              {stats.topTasks.map((task, i) => (
                <div key={task.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-4 h-4 bg-gray-100 rounded-full text-[10px] flex items-center justify-center font-medium text-gray-500 flex-shrink-0">{i + 1}</span>
                    <span className="text-xs text-gray-700 truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 flex-shrink-0">
                    <span>👍{task.likesCount}</span>
                    <span>💬{task.commentsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardEngagement
