/**
 * SearchLoadingState Component
 * Displays a loading state with animation during search operations
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

/**
 * SearchLoadingState Component
 * Renders a loading indicator with animated spinner
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const SearchLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-600 rounded-full opacity-20"></div>
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-gray-700">Searching...</p>
      <p className="mt-2 text-xs text-gray-500">Gathering results from projects and tasks</p>
    </div>
  )
}

export default SearchLoadingState

