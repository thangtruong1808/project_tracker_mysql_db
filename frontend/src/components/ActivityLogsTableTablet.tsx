/**
 * ActivityLogsTableTablet Component
 * Tablet view for displaying activity logs with condensed columns
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { getActivityTypeBadge, getActivityTypeLabel } from '../utils/activityLogUtils'
import { ActivitySortField } from '../types/activityLog'

interface ActivityLog {
  id: string
  userId: string
  targetUserId: string | null
  action: string | null
  type: string
}

interface ActivityLogsTableTabletProps {
  activities: ActivityLog[]
  onSort: (field: ActivitySortField) => void
  onEdit: (activityId: string) => void
  onDelete: (activityId: string) => void
  getSortIcon: (field: ActivitySortField) => JSX.Element
}

/**
 * ActivityLogsTableTablet Component
 * Renders activity logs in a simplified table layout for tablet screens
 */
const ActivityLogsTableTablet = ({ activities, onSort, onEdit, onDelete, getSortIcon }: ActivityLogsTableTabletProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => onSort('userId')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                User
                {getSortIcon('userId')}
              </div>
            </th>
            <th
              onClick={() => onSort('type')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Type
                {getSortIcon('type')}
              </div>
            </th>
            <th
              onClick={() => onSort('action')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Action
                {getSortIcon('action')}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">#{activity.id} · {activity.userId}</div>
                {activity.targetUserId && <div className="text-xs text-gray-500">Target: {activity.targetUserId}</div>}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getActivityTypeBadge(activity.type)}`}>
                  {getActivityTypeLabel(activity.type)}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">
                {activity.action || '—'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
  )
}

export default ActivityLogsTableTablet

