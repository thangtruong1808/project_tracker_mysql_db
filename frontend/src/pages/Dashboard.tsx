/**
 * Dashboard Page
 * Main dashboard for authenticated users with statistics, recent projects, and quick actions
 * Displays project overview, status distribution, and provides quick access to common tasks
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { PROJECTS_QUERY } from '../graphql/queries'
import DashboardStatsCards from '../components/DashboardStatsCards'
import RecentProjects from '../components/RecentProjects'
import QuickActions from '../components/QuickActions'
import ProjectStatusChart from '../components/ProjectStatusChart'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

/**
 * Dashboard Component
 * Main dashboard page displaying project statistics and overview
 * 
 * @returns JSX element containing the dashboard layout
 */
const Dashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  /**
   * Fetch projects data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   */
  const { data, loading, error, refetch } = useQuery<{ projects: Project[] }>(PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  /**
   * Handle data fetching errors
   * Displays error toast notification to user
   */
  useEffect(() => {
    const handleError = async () => {
      if (error) {
        await showToast(
          'Failed to load projects. Please try again later.',
          'error',
          5000
        )
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch projects data when component mounts or user changes
   * Ensures fresh data is loaded on dashboard access
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        await refetch()
      } catch (err) {
        // Error handling is done in the error effect above
      }
    }
    loadData()
  }, [refetch])

  /**
   * Get projects array from query data
   * Returns empty array if data is not available
   */
  const projects = data?.projects || []

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'User'}! Here's an overview of your projects.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <DashboardStatsCards projects={projects} isLoading={loading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Projects - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <RecentProjects projects={projects} isLoading={loading} />
          </div>

          {/* Quick Actions - Takes 1 column on large screens */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Project Status Chart */}
        <div className="mb-8">
          <ProjectStatusChart projects={projects} isLoading={loading} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
