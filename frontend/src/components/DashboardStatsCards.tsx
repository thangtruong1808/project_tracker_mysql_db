/**
 * DashboardStatsCards Component
 * Displays statistics cards with real data and percentages from database
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useMemo } from 'react'

interface Project { id: string; status: string }
interface Task { id: string; status: string }
interface User { id: string; role: string }

interface DashboardStatsCardsProps {
  projects: Project[]
  tasks: Task[]
  users: User[]
  isLoading: boolean
}

/**
 * DashboardStatsCards - Real-time statistics with percentages from database
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param projects - Array of project objects
 * @param tasks - Array of task objects
 * @param users - Array of user objects
 * @param isLoading - Loading state flag
 * @returns JSX element containing statistics cards
 */
const DashboardStatsCards = ({ projects, tasks, users, isLoading }: DashboardStatsCardsProps) => {
  /**
   * Calculate statistics with percentages from real database data
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const stats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => ['active', 'in_progress', 'IN_PROGRESS'].includes(p.status)).length
    const completedProjects = projects.filter(p => ['completed', 'COMPLETED'].includes(p.status)).length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => ['completed', 'COMPLETED', 'done', 'DONE'].includes(t.status)).length
    const inProgressTasks = tasks.filter(t => ['in_progress', 'IN_PROGRESS'].includes(t.status)).length
    const pendingTasks = tasks.filter(t => ['pending', 'PENDING', 'todo', 'TODO'].includes(t.status)).length
    const totalUsers = users.length
    const adminUsers = users.filter(u => u.role === 'Admin').length

    return {
      totalProjects, activeProjects, completedProjects, totalTasks, completedTasks, inProgressTasks, pendingTasks, totalUsers, adminUsers,
      projectCompletionPct: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
      taskCompletionPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      taskProgressPct: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
      adminPct: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0,
    }
  }, [projects, tasks, users])

  /**
   * Loading skeleton component
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @returns JSX element for loading skeleton card
   */
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      /* Loading skeleton grid */
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Projects', value: stats.totalProjects, subtitle: `${stats.completedProjects} completed (${stats.projectCompletionPct}%)`,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      bgColor: 'bg-blue-50', iconColor: 'text-blue-600', valueColor: 'text-blue-600', progressPct: stats.projectCompletionPct, progressColor: 'bg-blue-500',
    },
    {
      title: 'Total Tasks', value: stats.totalTasks, subtitle: `${stats.completedTasks} completed (${stats.taskCompletionPct}%)`,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', valueColor: 'text-emerald-600', progressPct: stats.taskCompletionPct, progressColor: 'bg-emerald-500',
    },
    {
      title: 'In Progress', value: stats.inProgressTasks, subtitle: `${stats.pendingTasks} pending (${100 - stats.taskProgressPct - stats.taskCompletionPct}%)`,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      bgColor: 'bg-amber-50', iconColor: 'text-amber-600', valueColor: 'text-amber-600', progressPct: stats.taskProgressPct, progressColor: 'bg-amber-500',
    },
    {
      title: 'Team Members', value: stats.totalUsers, subtitle: `${stats.adminUsers} admins (${stats.adminPct}%)`,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      bgColor: 'bg-violet-50', iconColor: 'text-violet-600', valueColor: 'text-violet-600', progressPct: stats.adminPct, progressColor: 'bg-violet-500',
    },
  ]

  return (
    /* Statistics cards grid with real data and percentages from database */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <p className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</p>
            </div>
            <div className={`${card.bgColor} rounded-xl p-3`}>
              <span className={card.iconColor}>{card.icon}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
            <div className={`h-1.5 rounded-full ${card.progressColor} transition-all duration-500`} style={{ width: `${card.progressPct}%` }}></div>
          </div>
          <p className="text-xs text-gray-400">{card.subtitle}</p>
        </div>
      ))}
    </div>
  )
}

export default DashboardStatsCards
