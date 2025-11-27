/**
 * SearchResultsHeader Component
 * Displays the header section for search results page
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

interface SearchResultsHeaderProps {
  isLoading?: boolean
}

/**
 * SearchResultsHeader Component
 * Renders header with title and description
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
const SearchResultsHeader = ({ isLoading = false }: SearchResultsHeaderProps) => {
  if (isLoading) {
    return (
      /* Loading skeleton for header */
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-96 ml-15"></div>
      </div>
    )
  }

  return (
    /* Header container */
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
          <svg
            className="w-7 h-7 text-blue-600"
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
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Search Intelligence
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Search Results</h1>
        </div>
      </div>
      <p className="text-sm text-gray-600 ml-15">
        Unified results across projects and tasks based on your search criteria
      </p>
    </div>
  )
}

export default SearchResultsHeader
