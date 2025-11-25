/**
 * NotificationsTableLoading Component
 * Loading skeleton for notifications table during data fetch
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * NotificationsTableLoading Component
 * Renders animated skeleton placeholders for table rows
 * Supports desktop, tablet, and mobile views
 *
 * @returns JSX element containing loading skeleton
 */
const NotificationsTableLoading = () => {
  const desktopRows = Array.from({ length: 5 })
  const tabletRows = Array.from({ length: 5 })
  const mobileCards = Array.from({ length: 5 })

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Loading Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 animate-pulse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {desktopRows.map((_, index) => (
              <tr key={index}>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </td>
                <td className="px-4 xl:px-6 py-4">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-100 rounded-full w-1/4"></div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-100 rounded w-12"></div>
                    <div className="h-6 bg-gray-100 rounded w-12"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet Loading Skeleton */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 animate-pulse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tabletRows.map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-100 rounded-full w-1/3"></div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-100 rounded w-12"></div>
                    <div className="h-6 bg-gray-100 rounded w-12"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Loading Skeleton */}
      <div className="md:hidden space-y-3 p-3 animate-pulse">
        {mobileCards.map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              </div>
              <div className="ml-2 h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="flex-1 h-8 bg-gray-200 rounded-md"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationsTableLoading

