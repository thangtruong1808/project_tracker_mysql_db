/**
 * UsersTableLoading Component
 * Loading skeleton for users table during data fetch
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * UsersTableLoading Component
 * Renders animated skeleton placeholders for table rows
 * Supports desktop, tablet, and mobile views
 *
 * @returns JSX element containing loading skeleton
 */
const UsersTableLoading = () => {
  /**
   * Render loading skeleton rows for desktop table
   */
  const renderDesktopSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="px-4 xl:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-4 xl:px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 bg-gray-200 rounded w-16"></div>
            <div className="h-7 bg-gray-200 rounded w-16"></div>
          </div>
        </td>
      </tr>
    ))
  }

  /**
   * Render loading skeleton rows for tablet table
   */
  const renderTabletSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={`skeleton-tablet-${index}`} className="animate-pulse">
        <td className="px-4 py-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 bg-gray-200 rounded w-16"></div>
            <div className="h-7 bg-gray-200 rounded w-16"></div>
          </div>
        </td>
      </tr>
    ))
  }

  /**
   * Render loading skeleton cards for mobile view
   */
  const renderMobileSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div key={`skeleton-mobile-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="ml-2 h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-9 bg-gray-200 rounded"></div>
          <div className="flex-1 h-9 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table Loading View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Name
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated At
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderDesktopSkeleton()}
          </tbody>
        </table>
      </div>

      {/* Tablet Table Loading View */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderTabletSkeleton()}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Loading View */}
      <div className="md:hidden space-y-3 p-3">
        {renderMobileSkeleton()}
      </div>
    </div>
  )
}

export default UsersTableLoading

