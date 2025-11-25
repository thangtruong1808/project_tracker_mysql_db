/**
 * useProjectsFilterSort Hook
 * Handles filtering and sorting logic for projects
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useMemo } from 'react'

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

interface UseProjectsFilterSortProps {
  projects: Project[]
  searchTerm: string
  sortField: SortField
  sortDirection: SortDirection
}

/**
 * useProjectsFilterSort Hook
 * Filters and sorts projects based on search term and sort settings
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const useProjectsFilterSort = ({
  projects,
  searchTerm,
  sortField,
  sortDirection
}: UseProjectsFilterSortProps) => {
  /**
   * Filter and sort projects based on search term and sort settings
   * Searches across name, description, and status
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const sortedProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return []
    }

    // Filter projects
    let filtered = projects
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower)) ||
          project.status.toLowerCase().includes(searchLower)
      )
    }

    // Sort projects
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: string | number = a[sortField] || ''
      let bValue: string | number = b[sortField] || ''

      if (sortField === 'id') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else {
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      return sortDirection === 'ASC'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1)
    })
    return sorted
  }, [projects, searchTerm, sortField, sortDirection])

  return sortedProjects
}

export default useProjectsFilterSort

