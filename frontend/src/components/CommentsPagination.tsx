/**
 * CommentsPagination Component
 * Pagination controls with First, Previous, Next, and Last buttons
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

interface CommentsPaginationProps {
  currentPage: number
  totalPages: number
  totalEntries: number
  startIndex: number
  endIndex: number
  entriesPerPage: number
  onPageChange: (page: number) => void
  onEntriesPerPageChange: (value: number) => void
  isLoading?: boolean
}

/**
 * CommentsPagination Component
 * Renders pagination controls with navigation buttons, page numbers, and entries per page selector
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
const CommentsPagination = ({
  currentPage,
  totalPages,
  totalEntries,
  startIndex,
  endIndex,
  entriesPerPage,
  onPageChange,
  onEntriesPerPageChange,
  isLoading = false
}: CommentsPaginationProps) => {
  /**
   * Generate page numbers to display
   * Shows current page and up to 2 pages on each side
   * @author Thang Truong
   * @date 2025-11-27
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1)
      }

      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      if (start > 2) {
        pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push('...')
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (isLoading) {
    return (
      /* Loading skeleton for pagination */
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mt-3 sm:mt-4 animate-pulse">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    /* Pagination container */
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mt-3 sm:mt-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Entries Info and Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="entriesPerPage" className="text-xs sm:text-sm text-gray-700">
              Show:
            </label>
            <select
              id="entriesPerPage"
              value={entriesPerPage}
              onChange={(e) => onEntriesPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs sm:text-sm text-gray-700">entries</span>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First Button */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="First page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Previous Button */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-1 sm:mx-2">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-xs sm:text-sm text-gray-500">
                      ...
                    </span>
                  )
                }
                const pageNum = page as number
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors touch-manipulation ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Next page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last Button */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              aria-label="Last page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentsPagination

