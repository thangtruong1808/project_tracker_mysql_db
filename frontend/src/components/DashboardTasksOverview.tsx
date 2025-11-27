/**
 * DashboardTasksOverview Component
 * Displays task status and priority distribution with visual progress bars
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useMemo } from 'react'

interface Task { id: string; title: string; status: string; priority: string }

interface DashboardTasksOverviewProps {
  tasks: Task[]
  isLoading: boolean
}

/**
 * DashboardTasksOverview - Visual task distribution with status and priority bars
 * @author Thang Truong
 * @date 2025-11-27
 */
const DashboardTasksOverview = ({ tasks, isLoading }: DashboardTasksOverviewProps) => {
  /** Calculate task status distribution with percentages from database */
  const statusDist = useMemo(() => {
    const total = tasks.length
    if (total === 0) return { pending: 0, inProgress: 0, completed: 0, pendingPct: 0, inProgressPct: 0, completedPct: 0 }
    const pending = tasks.filter(t => ['pending', 'PENDING', 'todo', 'TODO'].includes(t.status)).length
    const inProgress = tasks.filter(t => ['in_progress', 'IN_PROGRESS'].includes(t.status)).length
    const completed = tasks.filter(t => ['completed', 'COMPLETED', 'done', 'DONE'].includes(t.status)).length
    return {
      pending, inProgress, completed,
      pendingPct: Math.round((pending / total) * 100),
      inProgressPct: Math.round((inProgress / total) * 100),
      completedPct: Math.round((completed / total) * 100),
    }
  }, [tasks])

  /** Calculate priority distribution with percentages from database */
  const priorityDist = useMemo(() => {
    const total = tasks.length
    const high = tasks.filter(t => ['high', 'HIGH', 'urgent', 'URGENT'].includes(t.priority || '')).length
    const medium = tasks.filter(t => ['medium', 'MEDIUM', 'normal', 'NORMAL'].includes(t.priority || '')).length
    const low = tasks.filter(t => ['low', 'LOW'].includes(t.priority || '')).length
    return {
      high, medium, low,
      highPct: total > 0 ? Math.round((high / total) * 100) : 0,
      mediumPct: total > 0 ? Math.round((medium / total) * 100) : 0,
      lowPct: total > 0 ? Math.round((low / total) * 100) : 0,
    }
  }, [tasks])

  if (isLoading) {
    return (
      /* Loading skeleton for slow network */
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-1.5">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20 mb-3 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-1.5">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-14"></div>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statusBars = [
    { label: 'Completed', count: statusDist.completed, pct: statusDist.completedPct, color: 'bg-emerald-500', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
    { label: 'In Progress', count: statusDist.inProgress, pct: statusDist.inProgressPct, color: 'bg-blue-500', bg: 'bg-blue-100', dot: 'bg-blue-500' },
    { label: 'Pending', count: statusDist.pending, pct: statusDist.pendingPct, color: 'bg-amber-500', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  ]

  const priorityBars = [
    { label: 'High', count: priorityDist.high, pct: priorityDist.highPct, color: 'bg-red-500', bg: 'bg-red-100', dot: 'bg-red-500' },
    { label: 'Medium', count: priorityDist.medium, pct: priorityDist.mediumPct, color: 'bg-yellow-500', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
    { label: 'Low', count: priorityDist.low, pct: priorityDist.lowPct, color: 'bg-gray-400', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  ]

  /** Render distribution bar - @author Thang Truong @date 2025-11-27 */
  const renderBar = (bar: typeof statusBars[0], index: number) => (
    <div key={index}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${bar.dot}`}></span>
          <span className="text-sm font-medium text-gray-700">{bar.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{bar.count}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{bar.pct}%</span>
        </div>
      </div>
      <div className={`w-full h-2 rounded-full ${bar.bg}`}>
        <div className={`h-2 rounded-full ${bar.color} transition-all duration-500`} style={{ width: `${bar.pct}%` }}></div>
      </div>
    </div>
  )

  return (
    /* Tasks overview card with status and priority distribution bars */
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Tasks Overview</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tasks.length} total</span>
      </div>

      {tasks.length === 0 ? (
        /* Empty state */
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-gray-500 text-sm">No tasks yet</p>
        </div>
      ) : (
        <>
          {/* Status distribution bars with percentages */}
          <div className="space-y-3 mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">By Status</p>
            {statusBars.map(renderBar)}
          </div>

          {/* Priority distribution bars with percentages */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">By Priority</p>
            {priorityBars.map(renderBar)}
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardTasksOverview
