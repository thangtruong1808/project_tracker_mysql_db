/**
 * SearchResultsPanel Component
 * Displays paginated search results for projects and tasks in a grid layout
 * Hides sections based on filter selection (project-only or task-only searches)
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import ProjectSearchCard from './ProjectSearchCard'
import TaskSearchCard from './TaskSearchCard'
import SearchPagination from './SearchPagination'
import SearchEmptyState from './SearchEmptyState'
import { ProjectOwner } from '../types/project'

interface SearchResultsPanelProps {
  query: string
  projectStatuses: string[]
  taskStatuses: string[]
  projects: Array<{
    id: string
    name: string
    status: string
    description?: string | null
    owner: ProjectOwner | null
    likesCount: number
    commentsCount: number
    isLiked: boolean
    updatedAt: string
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    projectId: string
    description?: string | null
    owner: ProjectOwner | null
    likesCount: number
    commentsCount: number
    isLiked: boolean
    updatedAt: string
  }>
  projectTotal: number
  taskTotal: number
  projectPage: number
  taskPage: number
  onProjectPageChange: (page: number) => Promise<void>
  onTaskPageChange: (page: number) => Promise<void>
}

/**
 * SearchResultsPanel Component
 * Renders sections for projects and tasks based on filter selections
 * Hides irrelevant sections when user filters by specific type only
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
const SearchResultsPanel = ({
  query,
  projectStatuses,
  taskStatuses,
  projects,
  tasks,
  projectTotal,
  taskTotal,
  projectPage,
  taskPage,
  onProjectPageChange,
  onTaskPageChange,
}: SearchResultsPanelProps) => {
  const desiredPageSize = 12
  const hasProjects = projects.length > 0
  const hasTasks = tasks.length > 0
  const hasResults = hasProjects || hasTasks

  /**
   * Determine section visibility based on filter selections
   * Show projects section only if user didn't exclusively filter by task statuses
   * Show tasks section only if user didn't exclusively filter by project statuses
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const hasProjectFilters = projectStatuses.length > 0
  const hasTaskFilters = taskStatuses.length > 0
  const showProjectsSection = !(hasTaskFilters && !hasProjectFilters)
  const showTasksSection = !(hasProjectFilters && !hasTaskFilters)

  /**
   * Handle empty state when no search criteria provided
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  if (!hasResults && query === '' && !hasProjectFilters && !hasTaskFilters) {
    return (
      /* Empty search criteria message */
      <div className="mt-8">
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-base font-medium text-gray-700 mb-2">No search criteria</p>
          <p className="text-sm text-gray-500">Use the search drawer to filter projects and tasks by keyword or status</p>
        </div>
      </div>
    )
  }

  return (
    /* Search results container with conditional sections */
    <div className="mt-6 space-y-8">
      {/* Projects Section - Hidden when filtering by task status only */}
      {showProjectsSection && (
        <section className="space-y-4">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {projectTotal === 0 ? 'No projects found' : `${projectTotal} ${projectTotal === 1 ? 'project' : 'projects'} found`}
                </p>
              </div>
            </div>
          </header>

          {hasProjects ? (
            <>
              {/* Projects grid - 4 cards per row on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <ProjectSearchCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    status={project.status}
                    description={project.description ?? null}
                    owner={project.owner}
                    likesCount={project.likesCount}
                    commentsCount={project.commentsCount}
                    isLiked={project.isLiked}
                    updatedAt={project.updatedAt}
                  />
                ))}
              </div>
              {projectTotal > desiredPageSize && (
                <div className="mt-6">
                  <SearchPagination page={projectPage} total={projectTotal} pageSize={desiredPageSize} onChange={onProjectPageChange} />
                </div>
              )}
            </>
          ) : (
            <SearchEmptyState message="No projects matched your search criteria." type="project" />
          )}
        </section>
      )}

      {/* Tasks Section - Hidden when filtering by project status only */}
      {showTasksSection && (
        <section className="space-y-4">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {taskTotal === 0 ? 'No tasks found' : `${taskTotal} ${taskTotal === 1 ? 'task' : 'tasks'} found`}
                </p>
              </div>
            </div>
          </header>

          {hasTasks ? (
            <>
              {/* Tasks grid - 4 cards per row on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tasks.map((task) => (
                  <TaskSearchCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    status={task.status}
                    projectId={task.projectId}
                    description={task.description}
                    owner={task.owner}
                    likesCount={task.likesCount}
                    commentsCount={task.commentsCount}
                    isLiked={task.isLiked}
                    updatedAt={task.updatedAt}
                  />
                ))}
              </div>
              {taskTotal > desiredPageSize && (
                <div className="mt-6">
                  <SearchPagination page={taskPage} total={taskTotal} pageSize={desiredPageSize} onChange={onTaskPageChange} />
                </div>
              )}
            </>
          ) : (
            <SearchEmptyState message="No tasks matched your search criteria." type="task" />
          )}
        </section>
      )}
    </div>
  )
}

export default SearchResultsPanel
