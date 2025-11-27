/**
 * Projects Page
 * Displays all projects in a table with search, sorting, and pagination
 * Provides project management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { PROJECTS_QUERY } from '../graphql/queries'
import useProjectsFilterSort from '../hooks/useProjectsFilterSort'
import ProjectsTableHeader from '../components/ProjectsTableHeader'
import ProjectsTableSection from '../components/ProjectsTableSection'
import ProjectsTableModals from '../components/ProjectsTableModals'

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
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

/**
 * Projects Component
 * Main projects page displaying all projects in a sortable, searchable table
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
const Projects = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Fetch projects data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  const { data, loading, error, refetch } = useQuery<{ projects: Project[] }>(PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  /** Debounce search term to improve performance - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  /** Handle GraphQL query errors - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        await showToast('Failed to load projects. Please try again later.', 'error', 7000)
      }
    }
    handleError()
  }, [error, showToast])

  /** Initial data load - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await refetch()
      } catch (err) {
        // Error handled by error effect
      }
    }
    loadData()
  }, [refetch])

  /**
   * Filter and sort projects using custom hook
   * Uses debounced search term for performance
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  const sortedProjects = useProjectsFilterSort({
    projects: data?.projects || [],
    searchTerm: debouncedSearchTerm,
    sortField,
    sortDirection
  })

  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedProjects = sortedProjects.slice(startIndex, startIndex + entriesPerPage)

  /** Handle column sorting - @author Thang Truong @date 2025-11-27 */
  const handleSort = useCallback(async (field: SortField): Promise<void> => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortField(field)
      setSortDirection('ASC')
    }
  }, [sortField, sortDirection])

  /** Handle edit project action - @author Thang Truong @date 2025-11-27 */
  const handleEdit = useCallback(async (projectId: string): Promise<void> => {
    const project = sortedProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setIsEditModalOpen(true)
    }
  }, [sortedProjects])

  /** Handle delete project action - @author Thang Truong @date 2025-11-27 */
  const handleDelete = useCallback(async (projectId: string): Promise<void> => {
    const project = sortedProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setIsDeleteDialogOpen(true)
    }
  }, [sortedProjects])

  /** Handle successful mutation - @author Thang Truong @date 2025-11-27 */
  const handleSuccess = useCallback(async (): Promise<void> => {
    setSelectedProject(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
    await refetch()
  }, [refetch])

  /** Handle create project action - @author Thang Truong @date 2025-11-27 */
  const handleCreate = useCallback(async (): Promise<void> => {
    setIsCreateModalOpen(true)
  }, [])

  /** Handle clear search action - @author Thang Truong @date 2025-11-27 */
  const handleClearSearch = useCallback(async (): Promise<void> => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  return (
    /* Projects page container */
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header with search and create button */}
      <ProjectsTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
        onCreateClick={handleCreate}
        isLoading={loading}
      />

      {/* Projects Table with Pagination */}
      <ProjectsTableSection
        projects={paginatedProjects}
        sortedProjects={sortedProjects}
        sortField={sortField}
        sortDirection={sortDirection}
        currentPage={currentPage}
        entriesPerPage={entriesPerPage}
        loading={loading}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
        onEntriesPerPageChange={(value) => {
          setEntriesPerPage(value)
          setCurrentPage(1)
        }}
      />

      {/* Modals for edit, delete, and create */}
      <ProjectsTableModals
        selectedProject={selectedProject}
        isEditModalOpen={isEditModalOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isCreateModalOpen={isCreateModalOpen}
        onCloseEdit={async () => {
          setIsEditModalOpen(false)
          setSelectedProject(null)
        }}
        onCloseDelete={async () => {
          setIsDeleteDialogOpen(false)
          setSelectedProject(null)
        }}
        onCloseCreate={async () => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Projects
