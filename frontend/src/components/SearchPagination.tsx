/**
 * SearchPagination Component
 * Provides pagination controls for search results with improved UX
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface SearchPaginationProps {
  page: number
  total: number
  pageSize: number
  onChange: (page: number) => Promise<void>
}

/**
 * SearchPagination Component
 * Renders pagination controls with previous/next buttons and page info
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const SearchPagination = ({
  page,
  total,
  pageSize,
  onChange
}: SearchPaginationProps) => {
  const totalPages = Math.ceil(total / pageSize)
  
  if (totalPages <= 1) {
    return null
  }

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  /**
   * Handle previous page navigation
   * Navigates to the previous page if not on the first page
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handlePrev = async (): Promise<void> => {
    if (page > 1) {
      await onChange(page - 1)
    }
  }

  /**
   * Handle next page navigation
   * Navigates to the next page if not on the last page
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleNext = async (): Promise<void> => {
    if (page < totalPages) {
      await onChange(page + 1)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
        <span className="font-semibold text-gray-900">{total}</span> results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={page === 1}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Previous page"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
        
        <div className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700">
          Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalPages}</span>
        </div>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={page >= totalPages}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Next page"
        >
          Next
          <svg
            className="w-5 h-5 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SearchPagination

