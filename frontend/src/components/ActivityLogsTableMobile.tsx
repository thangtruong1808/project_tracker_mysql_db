/**
 * ActivityLogsTableMobile Component
 * Mobile-friendly card view for displaying activity logs
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { formatDateToMelbourne, getActivityTypeBadge, getActivityTypeLabel, formatMetadataPreview } from '../utils/activityLogUtils'

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

interface ActivityLogsTableMobileProps {
  activities: ActivityLog[]
  onEdit: (activityId: string) => void
  onDelete: (activityId: string) => void
}

/**
 * ActivityLogsTableMobile Component
 * Renders activity logs as stacked cards for smaller screens
 *
 * @returns JSX element containing mobile card list
 */
const ActivityLogsTableMobile = ({ activities, onEdit, onDelete }: ActivityLogsTableMobileProps) => {
  return (
    <div className="space-y-3 p-3">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">#{activity.id}</p>
              <p className="text-sm text-gray-700">
                User: <span className="font-medium">{activity.userId}</span>
              </p>
              {activity.targetUserId && (
                <p className="text-sm text-gray-700">
                  Target: <span className="font-medium">{activity.targetUserId}</span>
                </p>
              )}
              {activity.projectId && (
                <p className="text-sm text-gray-700">
                  Project: <span className="font-medium">{activity.projectId}</span>
                </p>
              )}
              {activity.taskId && (
                <p className="text-sm text-gray-700">
                  Task: <span className="font-medium">{activity.taskId}</span>
                </p>
              )}
            </div>
            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getActivityTypeBadge(activity.type)} flex-shrink-0`}>
              {getActivityTypeLabel(activity.type)}
            </span>
          </div>
          {activity.action && (
            <p className="text-sm text-gray-800 mb-2">
              Action: <span className="font-medium">{activity.action}</span>
            </p>
          )}
          <div className="text-xs text-gray-500 space-y-1 mb-3">
            <p>Created: {formatDateToMelbourne(activity.createdAt)}</p>
            <p>Updated: {formatDateToMelbourne(activity.updatedAt)}</p>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-3 mb-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Metadata</p>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
              {formatMetadataPreview(activity.metadata)}
            </pre>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onEdit(activity.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Edit activity log"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Delete activity log"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityLogsTableMobile

