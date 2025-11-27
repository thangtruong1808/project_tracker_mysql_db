/**
 * NotificationsSearchInput Component
 * Search input with clear icon and debounce functionality
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

interface NotificationsSearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  isLoading?: boolean
}

/**
 * NotificationsSearchInput Component
 * Renders a search input with search icon and clear button
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
const NotificationsSearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search notifications...',
  isLoading = false
}: NotificationsSearchInputProps) => {
  if (isLoading) {
    return (
      /* Loading skeleton for search input */
      <div className="relative w-full animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    /* Search input container */
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default NotificationsSearchInput

