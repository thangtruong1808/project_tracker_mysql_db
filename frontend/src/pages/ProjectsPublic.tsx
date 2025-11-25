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
import EditProjectModal from '../components/EditProjectModal'
import DeleteProjectDialog from '../components/DeleteProjectDialog'
import { useAuth } from '../context/AuthContext'

interface ProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
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
  const { isAuthenticated, accessToken } = useAuth()
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        await showToast('Failed to load projects. Please try again later.', 'error', 5000)
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

  const handleEdit = useCallback(async (projectId: string): Promise<void> => {
    if (!isAuthenticated) {
      await showToast('Please log in to edit projects', 'info', 3000)
      return
    }
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setIsEditModalOpen(true)
    }
  }, [projects, isAuthenticated, showToast])

  const handleDelete = useCallback(async (projectId: string): Promise<void> => {
    if (!isAuthenticated) {
      await showToast('Please log in to delete projects', 'info', 3000)
      return
    }
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setIsDeleteDialogOpen(true)
    }
  }, [projects, isAuthenticated, showToast])

  const handleSuccess = useCallback(async (): Promise<void> => {
    setSelectedProject(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    await refetch()
  }, [refetch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProjectsHeader />

        <ProjectsFilter
          selectedStatuses={selectedStatuses}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onStatusChange={handleStatusChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onClearFilters={handleClearFilters}
        />

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
            onEdit={isAuthenticated ? handleEdit : undefined}
            onDelete={isAuthenticated ? handleDelete : undefined}
          />
        </div>

        {isAuthenticated && (
          <>
            <EditProjectModal
              project={selectedProject}
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedProject(null)
              }}
              onSuccess={handleSuccess}
            />
            <DeleteProjectDialog
              project={selectedProject}
              isOpen={isDeleteDialogOpen}
              onClose={() => {
                setIsDeleteDialogOpen(false)
                setSelectedProject(null)
              }}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectsPublic
