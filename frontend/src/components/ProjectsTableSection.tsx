/**
 * ProjectsTableSection Component
 * Displays projects table with pagination
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import ProjectsTable from './ProjectsTable'
import ProjectsPagination from './ProjectsPagination'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

interface ProjectsTableSectionProps {
  projects: Project[]
  sortedProjects: Project[]
  sortField: SortField
  sortDirection: SortDirection
  currentPage: number
  entriesPerPage: number
  loading: boolean
  onSort: (field: SortField) => Promise<void>
  onEdit: (projectId: string) => Promise<void>
  onDelete: (projectId: string) => Promise<void>
  onPageChange: (page: number) => void
  onEntriesPerPageChange: (value: number) => void
}

/**
 * ProjectsTableSection Component
 * Renders projects table and pagination controls
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
const ProjectsTableSection = ({
  projects,
  sortedProjects,
  sortField,
  sortDirection,
  currentPage,
  entriesPerPage,
  loading,
  onSort,
  onEdit,
  onDelete,
  onPageChange,
  onEntriesPerPageChange
}: ProjectsTableSectionProps) => {
  const totalPages = Math.ceil(sortedProjects.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage

  return (
    <>
      {/* Projects table with loading state */}
      <ProjectsTable
        projects={projects}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={loading}
      />
      {/* Pagination controls with loading skeleton */}
      <ProjectsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={sortedProjects.length}
        startIndex={startIndex}
        endIndex={endIndex}
        entriesPerPage={entriesPerPage}
        onPageChange={onPageChange}
        onEntriesPerPageChange={onEntriesPerPageChange}
        isLoading={loading}
      />
    </>
  )
}

export default ProjectsTableSection
