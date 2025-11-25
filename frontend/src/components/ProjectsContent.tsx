/**
 * ProjectsContent Component
 * Handles filtering logic for projects
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useMemo } from 'react'
import ProjectsGrid from './ProjectsGrid'
import SearchLoadingState from './SearchLoadingState'
import SearchEmptyState from './SearchEmptyState'

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

interface ProjectsContentProps {
  projects: Project[]
  loading: boolean
  error: any
  selectedStatuses: string[]
  dateFrom: string
  dateTo: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => Promise<void>
  onEdit?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

/**
 * Check if project matches date range filter
 * Filters projects based on creation date between dateFrom and dateTo
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param project - Project object
 * @param dateFrom - Start date (YYYY-MM-DD format)
 * @param dateTo - End date (YYYY-MM-DD format)
 * @returns Boolean indicating if project matches date filter
 */
const matchesDateFilter = (project: Project, dateFrom: string, dateTo: string): boolean => {
  if (!dateFrom && !dateTo) return true

  try {
    const projectDate = new Date(project.createdAt)
    projectDate.setHours(0, 0, 0, 0)

    if (isNaN(projectDate.getTime())) {
      return true
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      if (projectDate < fromDate) {
        return false
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (projectDate > toDate) {
        return false
      }
    }

    return true
  } catch {
    return true
  }
}

/**
 * ProjectsContent Component
 * Handles filtering and displays projects grid or loading/error states
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsContent = ({
  projects,
  loading,
  error,
  selectedStatuses,
  dateFrom,
  dateTo,
  currentPage,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete
}: ProjectsContentProps) => {
  /**
   * Filter projects based on selected statuses and date range
   * Returns filtered array of projects
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return []
    }

    return projects.filter(project => {
      if (!project || !project.id) {
        return false
      }

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(project.status)
      const matchesDate = matchesDateFilter(project, dateFrom, dateTo)
      return matchesStatus && matchesDate
    })
  }, [projects, selectedStatuses, dateFrom, dateTo])

  if (loading) {
    return <SearchLoadingState />
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p className="text-sm font-medium">Failed to load projects</p>
        <p className="text-xs text-gray-500 mt-1">Please try again later</p>
      </div>
    )
  }

  /**
   * Check project display conditions
   * Determines appropriate state to show (empty or grid)
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const hasProjectsButFiltered = projects && projects.length > 0 && filteredProjects.length === 0
  const hasNoProjects = !projects || projects.length === 0
  const hasFilteredProjects = filteredProjects && filteredProjects.length > 0

  if (hasProjectsButFiltered) {
    return (
      <SearchEmptyState
        message="No projects match your current filters. Try adjusting your filter criteria."
        type="project"
      />
    )
  }

  if (hasNoProjects) {
    return (
      <SearchEmptyState
        message="No projects found. Create your first project to get started!"
        type="project"
      />
    )
  }

  if (!hasFilteredProjects) {
    return (
      <SearchEmptyState
        message="No projects available to display."
        type="project"
      />
    )
  }

  return (
    <ProjectsGrid
      projects={filteredProjects}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}

export default ProjectsContent

