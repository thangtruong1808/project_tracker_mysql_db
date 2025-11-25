/**
 * ActivityLogsTable Component
 * Responsive table for displaying activity logs with sorting and actions
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import ActivityLogsTableMobile from './ActivityLogsTableMobile'
import ActivityLogsTableTablet from './ActivityLogsTableTablet'
import ActivityLogsTableLoading from './ActivityLogsTableLoading'
import { formatDateToMelbourne, getActivityTypeBadge, getActivityTypeLabel, formatMetadataPreview } from '../utils/activityLogUtils'
import { ActivitySortField } from '../types/activityLog'

interface ActivityLog {
  id: string
  userId: string
  targetUserId: string | null
  projectId: string | null
  taskId: string | null
  action: string | null
  type: string
  metadata: string | null
  createdAt: string
  updatedAt: string
}

type SortField = ActivitySortField
type SortDirection = 'ASC' | 'DESC'

interface ActivityLogsTableProps {
  activities: ActivityLog[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (activityId: string) => void
  onDelete: (activityId: string) => void
  isLoading?: boolean
}

/**
 * ActivityLogsTable Component
 * Renders table with desktop/tablet/mobile layouts and action buttons
 */
const ActivityLogsTable = ({
  activities,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  isLoading = false,
}: ActivityLogsTableProps) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
        </svg>
      )
    }
    return sortDirection === 'ASC' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (isLoading) {
    return <ActivityLogsTableLoading />
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No activity logs found</h3>
        <p className="text-sm sm:text-base text-gray-600">Create a new activity log to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                ['id', 'ID'],
                ['userId', 'User ID'],
                ['targetUserId', 'Target User ID'],
                ['projectId', 'Project ID'],
                ['taskId', 'Task ID'],
                ['action', 'Action'],
                ['type', 'Type'],
                ['createdAt', 'Created'],
                ['updatedAt', 'Updated'],
              ].map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => onSort(field as SortField)}
                  className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {getSortIcon(field as SortField)}
                  </div>
                </th>
              ))}
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metadata</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-100 transition-colors">
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.id}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.userId}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.targetUserId || '—'}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.projectId || '—'}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{activity.taskId || '—'}</td>
                <td className="px-4 xl:px-6 py-4 text-sm text-gray-700 max-w-[180px]">
                  <div className="truncate">{activity.action || '—'}</div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getActivityTypeBadge(activity.type)}`}>
                    {getActivityTypeLabel(activity.type)}
                  </span>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToMelbourne(activity.createdAt)}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToMelbourne(activity.updatedAt)}
                </td>
                <td className="px-4 xl:px-6 py-4 text-xs text-gray-600">
                  <pre className="whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                    {formatMetadataPreview(activity.metadata)}
                  </pre>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(activity.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                      aria-label="Edit activity log"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                      aria-label="Delete activity log"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hidden md:block lg:hidden">
        <ActivityLogsTableTablet activities={activities} onSort={onSort} onEdit={onEdit} onDelete={onDelete} getSortIcon={getSortIcon} />
      </div>

      <div className="md:hidden">
        <ActivityLogsTableMobile activities={activities} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default ActivityLogsTable

