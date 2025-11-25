/**
 * ProjectsTableHeader Component
 * Header section with description and create button
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import ProjectsSearchInput from './ProjectsSearchInput'

interface ProjectsTableHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onClearSearch: () => Promise<void>
  onCreateClick: () => Promise<void>
}

/**
 * ProjectsTableHeader Component
 * Renders header with description, create button, and search input
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsTableHeader = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onCreateClick
}: ProjectsTableHeaderProps) => {
  return (
    <>
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Manage your projects efficiently. View, search, and organize all system projects with advanced filtering and sorting capabilities.
        </p>
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          aria-label="Create new project"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Project</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <ProjectsSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          onClear={onClearSearch}
          placeholder="Search projects by name, description, or status..."
        />
      </div>
    </>
  )
}

export default ProjectsTableHeader

