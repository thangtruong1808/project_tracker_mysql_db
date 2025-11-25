/**
 * DashboardStatsCards Component
 * Displays statistics cards showing project counts, task counts, and team member counts
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useMemo } from 'react'

interface Project {
  id: string
  name: string
  status: string
}

interface DashboardStatsCardsProps {
  projects: Project[]
  isLoading: boolean
}

/**
 * DashboardStatsCards Component
 * Renders statistics cards for dashboard overview
 * 
 * @param projects - Array of project objects
 * @param isLoading - Loading state indicator
 * @returns JSX element containing statistics cards
 */
const DashboardStatsCards = ({ projects, isLoading }: DashboardStatsCardsProps) => {
  /**
   * Calculate statistics from projects data
   * Counts total projects, projects by status, and calculates task estimates
   * 
   * @returns Object containing calculated statistics
   */
  const stats = useMemo(() => {
    const totalProjects = projects.length
    const planningProjects = projects.filter((p) => p.status === 'PLANNING').length
    const inProgressProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length
    
    // Estimate tasks based on projects (1 task per project as placeholder)
    const estimatedTasks = totalProjects
    
    return {
      totalProjects,
      planningProjects,
      inProgressProjects,
      completedProjects,
      estimatedTasks,
    }
  }, [projects])

  /**
   * Render statistics card
   * 
   * @param title - Card title
   * @param value - Card value to display
   * @param icon - SVG icon component
   * @param color - Color scheme for the card
   * @returns JSX element for a single statistics card
   */
  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {isLoading ? '...' : value}
          </p>
        </div>
        <div className={`${color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg p-3`}>
          {icon}
        </div>
      </div>
    </div>
  )

  /**
   * Projects icon SVG component
   */
  const ProjectsIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )

  /**
   * Tasks icon SVG component
   */
  const TasksIcon = () => (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )

  /**
   * Team icon SVG component
   */
  const TeamIcon = () => (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Projects"
        value={stats.totalProjects}
        icon={<ProjectsIcon />}
        color="text-blue-600"
      />
      <StatCard
        title="Active Tasks"
        value={stats.estimatedTasks}
        icon={<TasksIcon />}
        color="text-green-600"
      />
      <StatCard
        title="Team Members"
        value={1}
        icon={<TeamIcon />}
        color="text-purple-600"
      />
    </div>
  )
}

export default DashboardStatsCards

