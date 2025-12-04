/**
 * Projects Page - Displays all projects with search, sorting, and pagination
 * @author Thang Truong
 * @date 2025-12-04
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { PROJECTS_QUERY } from '../graphql/queries'
import useProjectsFilterSort from '../hooks/useProjectsFilterSort'
import ProjectsTableHeader from '../components/ProjectsTableHeader'
import ProjectsTableSection from '../components/ProjectsTableSection'
import ProjectsTableModals from '../components/ProjectsTableModals'

interface ProjectOwner { id: string; firstName: string; lastName: string; email: string; role: string }
interface Project {
  id: string; name: string; description: string | null; status: string; owner: ProjectOwner | null
  likesCount: number; commentsCount: number; createdAt: string; updatedAt: string
}
type SortField = 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'
interface SelectedProject { id: string; name: string; description: string | null; status: string; createdAt: string; updatedAt: string }

/** Projects Component - Main page for project management @author Thang Truong @date 2025-12-04 */
const Projects = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /** Fetch projects from GraphQL API with cache-and-network strategy @author Thang Truong @date 2025-12-04 */
  const { data, loading, error, refetch } = useQuery<{ projects: Project[] }>(PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const isLoading = loading || !data?.projects

  /** Debounce search term for performance @author Thang Truong @date 2025-12-04 */
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearchTerm(searchTerm); setCurrentPage(1) }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  /** Handle GraphQL errors with toast notification @author Thang Truong @date 2025-12-04 */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) await showToast(error.message || 'Failed to load projects.', 'error', 10000)
    }
    handleError()
  }, [error, showToast])

  /** Initial data load @author Thang Truong @date 2025-12-04 */
  useEffect(() => {
    const loadData = async (): Promise<void> => { try { await refetch() } catch { /* Error handled by error effect */ } }
    loadData()
  }, [refetch])

  /** Filter and sort projects @author Thang Truong @date 2025-12-04 */
  const sortedProjects = useProjectsFilterSort({
    projects: data?.projects || [], searchTerm: debouncedSearchTerm, sortField, sortDirection
  })

  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedProjects = sortedProjects.slice(startIndex, startIndex + entriesPerPage)

  /** Handle column sorting @author Thang Truong @date 2025-12-04 */
  const handleSort = useCallback(async (field: SortField): Promise<void> => {
    if (sortField === field) { setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC') }
    else { setSortField(field); setSortDirection('ASC') }
  }, [sortField, sortDirection])

  /** Handle edit project action @author Thang Truong @date 2025-12-04 */
  const handleEdit = useCallback(async (projectId: string): Promise<void> => {
    const project = sortedProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject({ id: project.id, name: project.name, description: project.description, status: project.status, createdAt: project.createdAt, updatedAt: project.updatedAt })
      setIsEditModalOpen(true)
    }
  }, [sortedProjects])

  /** Handle delete project action @author Thang Truong @date 2025-12-04 */
  const handleDelete = useCallback(async (projectId: string): Promise<void> => {
    const project = sortedProjects.find((p) => p.id === projectId)
    if (project) {
      setSelectedProject({ id: project.id, name: project.name, description: project.description, status: project.status, createdAt: project.createdAt, updatedAt: project.updatedAt })
      setIsDeleteDialogOpen(true)
    }
  }, [sortedProjects])

  /** Handle successful mutation and refetch @author Thang Truong @date 2025-12-04 */
  const handleSuccess = useCallback(async (): Promise<void> => {
    setSelectedProject(null); setIsEditModalOpen(false); setIsDeleteDialogOpen(false); setIsCreateModalOpen(false)
    await refetch()
  }, [refetch])

  /** Handle create project action @author Thang Truong @date 2025-12-04 */
  const handleCreate = useCallback(async (): Promise<void> => { setIsCreateModalOpen(true) }, [])

  /** Handle clear search action @author Thang Truong @date 2025-12-04 */
  const handleClearSearch = useCallback(async (): Promise<void> => { setSearchTerm(''); setDebouncedSearchTerm('') }, [])

  /* Projects page container with search, table, and modals */
  return (
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header section with search and create button */}
      <ProjectsTableHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} onClearSearch={handleClearSearch} onCreateClick={handleCreate} isLoading={isLoading} />
      {/* Projects table with sorting and pagination */}
      <ProjectsTableSection projects={paginatedProjects} sortedProjects={sortedProjects} sortField={sortField} sortDirection={sortDirection} currentPage={currentPage} entriesPerPage={entriesPerPage} loading={isLoading} onSort={handleSort} onEdit={handleEdit} onDelete={handleDelete} onPageChange={setCurrentPage} onEntriesPerPageChange={(value) => { setEntriesPerPage(value); setCurrentPage(1) }} />
      {/* Modal dialogs for CRUD operations */}
      <ProjectsTableModals selectedProject={selectedProject} isEditModalOpen={isEditModalOpen} isDeleteDialogOpen={isDeleteDialogOpen} isCreateModalOpen={isCreateModalOpen} onCloseEdit={async () => { setIsEditModalOpen(false); setSelectedProject(null) }} onCloseDelete={async () => { setIsDeleteDialogOpen(false); setSelectedProject(null) }} onCloseCreate={async () => setIsCreateModalOpen(false)} onSuccess={handleSuccess} />
    </div>
  )
}

export default Projects
