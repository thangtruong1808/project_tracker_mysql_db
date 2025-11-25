/**
 * SearchFilterBadges Component
 * Displays filter badges showing active search criteria
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface SearchFilterBadgesProps {
  query: string
  projectStatuses: string[]
  taskStatuses: string[]
}

/**
 * Format status badge text for display
 * Converts status values to readable format
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param statuses - Array of status strings
 * @returns Formatted status string
 */
const formatStatusBadge = (statuses: string[]): string => {
  if (statuses.length === 0) return 'All'
  return statuses.map(s => s.replace(/_/g, ' ')).join(', ')
}

/**
 * SearchFilterBadges Component
 * Renders badges showing active search filters
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const SearchFilterBadges = ({
  query,
  projectStatuses,
  taskStatuses
}: SearchFilterBadgesProps) => {
  const hasFilters = query || projectStatuses.length > 0 || taskStatuses.length > 0

  if (!hasFilters) {
    return null
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {query && (
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium border border-blue-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Keyword: <span className="font-semibold">{query}</span>
        </span>
      )}
      {projectStatuses.length > 0 && (
        <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium border border-purple-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Projects: <span className="font-semibold">{formatStatusBadge(projectStatuses)}</span>
        </span>
      )}
      {taskStatuses.length > 0 && (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-4 py-2 text-sm font-medium border border-emerald-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Tasks: <span className="font-semibold">{formatStatusBadge(taskStatuses)}</span>
        </span>
      )}
    </div>
  )
}

export default SearchFilterBadges

