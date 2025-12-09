/**
 * Dashboard Page
 * Main dashboard with 4-row layout fetching real-time data from database
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { PROJECTS_QUERY, TASKS_QUERY, USERS_QUERY, ACTIVITIES_QUERY } from '../graphql/queries'
import HeaderDescriptionDashboard from '../components/HeaderDescriptionDashboard'
import DashboardStatsCards from '../components/DashboardStatsCards'
import DashboardTasksOverview from '../components/DashboardTasksOverview'
import DashboardRecentProjects from '../components/DashboardRecentProjects'
import DashboardRecentActivity from '../components/DashboardRecentActivity'
import DashboardEngagement from '../components/DashboardEngagement'

interface Project {
  id: string; name: string; description: string | null; status: string
  likesCount: number; commentsCount: number; createdAt: string; updatedAt: string
}
interface Task {
  id: string; title: string; status: string; priority: string; projectId: string
  likesCount: number; commentsCount: number; createdAt: string; updatedAt: string
}
interface User { id: string; firstName: string; lastName: string; email: string; role: string }
interface Activity { id: string; action: string; type: string; projectId: string | null; taskId: string | null; createdAt: string }

/**
 * Dashboard Component - 4-row layout with real-time database data
 * @author Thang Truong
 * @date 2025-11-27
 */
const Dashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  /** Fetch projects from database - @author Thang Truong @date 2025-11-27 */
  const { data: projectsData, loading: projectsLoading, error: projectsError, refetch: refetchProjects } =
    useQuery<{ projects: Project[] }>(PROJECTS_QUERY, { fetchPolicy: 'cache-and-network', errorPolicy: 'all' })

  /** Fetch tasks from database - @author Thang Truong @date 2025-11-27 */
  const { data: tasksData, loading: tasksLoading, error: tasksError, refetch: refetchTasks } =
    useQuery<{ tasks: Task[] }>(TASKS_QUERY, { fetchPolicy: 'cache-and-network', errorPolicy: 'all' })

  /** Fetch users from database - @author Thang Truong @date 2025-11-27 */
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } =
    useQuery<{ users: User[] }>(USERS_QUERY, { fetchPolicy: 'cache-and-network', errorPolicy: 'all' })

  /** Fetch activities from database - @author Thang Truong @date 2025-11-27 */
  const { data: activitiesData, loading: activitiesLoading, refetch: refetchActivities } =
    useQuery<{ activities: Activity[] }>(ACTIVITIES_QUERY, { fetchPolicy: 'cache-and-network', errorPolicy: 'all' })

  /** Handle errors with toast notifications - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const handleErrors = async (): Promise<void> => {
      if (projectsError) await showToast('Failed to load projects.', 'error', 5000)
      if (tasksError) await showToast('Failed to load tasks.', 'error', 5000)
      if (usersError) await showToast('Failed to load users.', 'error', 5000)
    }
    handleErrors()
  }, [projectsError, tasksError, usersError, showToast])

  /** Refetch all data on mount - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await Promise.all([refetchProjects(), refetchTasks(), refetchUsers(), refetchActivities()])
      } catch {
        await showToast('Failed to load data. Please try again later.', 'error', 5000)
      }
    }
    loadData()
  }, [refetchProjects, refetchTasks, refetchUsers, refetchActivities, showToast])

  const projects = projectsData?.projects || []
  const tasks = tasksData?.tasks || []
  const users = usersData?.users || []
  const activities = activitiesData?.activities || []
  const isLoading = projectsLoading || tasksLoading || usersLoading || activitiesLoading
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User'

  return (
    /* Dashboard page container with 4-row layout */
    <div className="p-4 lg:p-6 bg-gray-50 min-h-full">
      <div className="w-full mx-auto space-y-6">
        {/* Row 1: Header with personalized greeting and description */}
        <HeaderDescriptionDashboard userName={displayName} isLoading={isLoading} />

        {/* Row 2: Statistics Cards with percentages */}
        <DashboardStatsCards projects={projects} tasks={tasks} users={users} isLoading={isLoading} />

        {/* Row 3: Tasks Overview (left) + Recent Projects (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardTasksOverview tasks={tasks} isLoading={tasksLoading} />
          <DashboardRecentProjects projects={projects} isLoading={projectsLoading} />
        </div>

        {/* Row 4: Recent Activity (left) + Engagement Overview (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardRecentActivity activities={activities} isLoading={activitiesLoading} />
          <DashboardEngagement projects={projects} tasks={tasks} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
