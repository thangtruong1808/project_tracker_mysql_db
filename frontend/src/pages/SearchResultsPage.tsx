/**
 * SearchResultsPage Component
 * Displays dashboard-wide search outcomes using query parameters with improved UX
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import SearchResultsPanel from '../components/SearchResultsPanel'
import SearchLoadingState from '../components/SearchLoadingState'
import SearchErrorState from '../components/SearchErrorState'
import SearchResultsHeader from '../components/SearchResultsHeader'
import SearchFilterBadges from '../components/SearchFilterBadges'
import { SEARCH_DASHBOARD_QUERY } from '../graphql/queries'

/**
 * Parse comma-separated status query parameter safely
 * Returns array of status strings or empty array
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param value - Query parameter value
 * @returns Array of status strings
 */
const parseStatuses = (value: string | null): string[] => {
  if (!value) {
    return []
  }
  const parts = value.split(',').map((item) => item.trim()).filter(Boolean)
  return parts.length > 0 ? parts : []
}

const PROJECT_PAGE_SIZE = 10
const TASK_PAGE_SIZE = 10

/**
 * SearchResultsPage Component
 * Main component for displaying search results with filtering and pagination
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const [projectPage, setProjectPage] = useState(1)
  const [taskPage, setTaskPage] = useState(1)
  
  const [searchDashboard, { loading: isLoading, error: queryError, data }] = useLazyQuery(
    SEARCH_DASHBOARD_QUERY,
    {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    }
  )

  const queryValue = searchParams.get('q') || ''
  const projectStatusParam = searchParams.get('projectStatuses')
  const taskStatusParam = searchParams.get('taskStatuses')
  
  const projectStatuses = useMemo(() => parseStatuses(projectStatusParam), [projectStatusParam])
  const taskStatuses = useMemo(() => parseStatuses(taskStatusParam), [taskStatusParam])

  /**
   * Reset pagination when search criteria changes
   * Resets both project and task pages to 1
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    setProjectPage(1)
    setTaskPage(1)
  }, [queryValue, projectStatuses.join(','), taskStatuses.join(',')])

  const projectStatusesKey = projectStatuses.join(',')
  const taskStatusesKey = taskStatuses.join(',')

  /**
   * Build variables for GraphQL query
   * Constructs input object with query, statuses, and pagination
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const variables = useMemo(
    () => ({
      input: {
        query: queryValue || undefined,
        projectStatuses: projectStatuses.length > 0 ? projectStatuses : undefined,
        taskStatuses: taskStatuses.length > 0 ? taskStatuses : undefined,
        projectPage,
        projectPageSize: PROJECT_PAGE_SIZE,
        taskPage,
        taskPageSize: TASK_PAGE_SIZE,
      },
    }),
    [queryValue, projectStatusesKey, taskStatusesKey, projectPage, taskPage]
  )

  /**
   * Execute search query when variables change
   * Fetches search results asynchronously
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    const executeSearch = async (): Promise<void> => {
      try {
        await searchDashboard({ variables })
      } catch (error) {
        // Error handled by Apollo Client error policy
      }
    }
    executeSearch()
  }, [variables, searchDashboard])

  /**
   * Handle project page change
   * Updates project page state and triggers new search
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param nextPage - Next page number
   */
  const handleProjectPageChange = useCallback(async (nextPage: number): Promise<void> => {
    setProjectPage(nextPage)
  }, [])

  /**
   * Handle task page change
   * Updates task page state and triggers new search
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param nextPage - Next page number
   */
  const handleTaskPageChange = useCallback(async (nextPage: number): Promise<void> => {
    setTaskPage(nextPage)
  }, [])

  const results = data?.searchDashboard || {
    projects: [],
    tasks: [],
    projectTotal: 0,
    taskTotal: 0,
  }

  const error = queryError?.message || null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SearchResultsHeader />
        <SearchFilterBadges
          query={queryValue}
          projectStatuses={projectStatuses}
          taskStatuses={taskStatuses}
        />

        {/* Main Content Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-lg">
          {isLoading && <SearchLoadingState />}

          {error && <SearchErrorState message={error} />}

          {!isLoading && !error && (
            <SearchResultsPanel
              query={queryValue}
              projects={results.projects || []}
              tasks={results.tasks || []}
              projectTotal={results.projectTotal || 0}
              taskTotal={results.taskTotal || 0}
              projectPage={projectPage}
              projectPageSize={PROJECT_PAGE_SIZE}
              taskPage={taskPage}
              taskPageSize={TASK_PAGE_SIZE}
              onProjectPageChange={handleProjectPageChange}
              onTaskPageChange={handleTaskPageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage
