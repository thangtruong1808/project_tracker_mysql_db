/**
 * SearchEmptyState Component
 * Displays an empty state message when no search results are found
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface SearchEmptyStateProps {
  message: string
  type?: 'project' | 'task'
}

/**
 * SearchEmptyState Component
 * Renders a user-friendly empty state with icon and message
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const SearchEmptyState = ({ message, type = 'project' }: SearchEmptyStateProps) => {
  const iconColor = type === 'project' ? 'text-blue-400' : 'text-emerald-400'
  
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <div className="flex justify-center mb-4">
        <svg
          className={`w-12 h-12 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">No results found</p>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

export default SearchEmptyState

