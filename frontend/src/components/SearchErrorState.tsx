/**
 * SearchErrorState Component
 * Displays error state when search fails
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface SearchErrorStateProps {
  message: string
}

/**
 * SearchErrorState Component
 * Renders error message with icon
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const SearchErrorState = ({ message }: SearchErrorStateProps) => {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
      <svg
        className="w-12 h-12 text-red-400 mx-auto mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm font-medium text-red-800 mb-1">Search Error</p>
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}

export default SearchErrorState

