/**
 * ProjectsPublic Page
 * Public-facing projects page displaying all projects in a grid layout
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { PROJECTS_QUERY } from '../graphql/queries'
import ProjectsHeader from '../components/ProjectsHeader'
import ProjectsFilter from '../components/ProjectsFilter'
import ProjectsContent from '../components/ProjectsContent'
import { useAuth } from '../context/AuthContext'

interface ProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  owner: ProjectOwner | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

const PROJECTS_PER_PAGE = 12

/**
 * ProjectsPublic Component
 * Displays all projects in a grid layout with filtering and pagination
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsPublic = () => {
  const { showToast } = useToast()
  const { accessToken } = useAuth()
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)

  /**
   * Fetch projects data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const { data, loading, error, refetch } = useQuery<{ projects: Project[] }>(PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  })

  /**
   * Refetch projects when authentication token becomes available
   * Backend checks DB for user likes, so we need fresh data after auth is ready
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const hasRefetchedRef = useRef(false)
  useEffect(() => {
    const refetchProjects = async (): Promise<void> => {
      if (accessToken && !hasRefetchedRef.current) {
        hasRefetchedRef.current = true
        try {
          await refetch({ fetchPolicy: 'network-only' })
        } catch {
          // Error handling is done in the error effect
        }
      } else if (!accessToken) {
        hasRefetchedRef.current = false
      }
    }
    refetchProjects()
  }, [accessToken, refetch])

  /**
   * Handle GraphQL query errors
   * Displays detailed error messages from the backend
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        // Extract error message from GraphQL error
        const errorMessage = error.message || 'Failed to load projects. Please try again later.'
        await showToast(errorMessage, 'error', 10000)
      }
    }
    handleError()
  }, [error, showToast])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatuses, dateFrom, dateTo])

  const projects = data?.projects || []

  const handleStatusChange = useCallback(async (statuses: string[]): Promise<void> => {
    setSelectedStatuses(statuses)
  }, [])

  const handleDateFromChange = useCallback(async (date: string): Promise<void> => {
    setDateFrom(date)
  }, [])

  const handleDateToChange = useCallback(async (date: string): Promise<void> => {
    setDateTo(date)
  }, [])

  const handleClearFilters = useCallback(async (): Promise<void> => {
    setSelectedStatuses([])
    setDateFrom('')
    setDateTo('')
  }, [])

  const handlePageChange = useCallback(async (page: number): Promise<void> => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    /* Projects public page container */
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Projects page header */}
        <ProjectsHeader />

        {/* Projects filter section */}
        <ProjectsFilter
          selectedStatuses={selectedStatuses}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onStatusChange={handleStatusChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onClearFilters={handleClearFilters}
        />

        {/* Projects content section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <ProjectsContent
            projects={projects}
            loading={loading}
            error={error}
            selectedStatuses={selectedStatuses}
            dateFrom={dateFrom}
            dateTo={dateTo}
            currentPage={currentPage}
            itemsPerPage={PROJECTS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectsPublic
