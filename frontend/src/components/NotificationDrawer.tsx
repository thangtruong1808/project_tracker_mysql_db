/**
 * NotificationDrawer Component
 * Renders a right-side drawer showing recent notifications
 * Includes mark/delete all read/unread and individual toggle functionality
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import {
  UPDATE_NOTIFICATION_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_UNREAD_MUTATION,
  DELETE_ALL_READ_NOTIFICATIONS_MUTATION,
  DELETE_ALL_UNREAD_NOTIFICATIONS_MUTATION,
} from '../graphql/notifications/mutations'

interface NotificationItem { id: string; message: string; isRead: boolean; createdAt: string }
interface NotificationDrawerProps { isOpen: boolean; onClose: () => void; notifications: NotificationItem[]; isLoading: boolean; userId?: string }

/**
 * NotificationDrawer Component - Displays notifications with management features
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
const NotificationDrawer = ({ isOpen, onClose, notifications, isLoading, userId }: NotificationDrawerProps) => {
  const { showToast } = useToast()
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const drawerNotifications = useMemo(() => notifications.slice(0, 50), [notifications])
  const unreadCount = useMemo(() => drawerNotifications.filter((n) => !n.isRead).length, [drawerNotifications])
  const readCount = useMemo(() => drawerNotifications.filter((n) => n.isRead).length, [drawerNotifications])

  const refetchConfig = { refetchQueries: [{ query: NOTIFICATIONS_QUERY }] }
  const [updateNotification] = useMutation(UPDATE_NOTIFICATION_MUTATION, refetchConfig)
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION, refetchConfig)
  const [markAllUnread] = useMutation(MARK_ALL_NOTIFICATIONS_UNREAD_MUTATION, refetchConfig)
  const [deleteAllRead] = useMutation(DELETE_ALL_READ_NOTIFICATIONS_MUTATION, refetchConfig)
  const [deleteAllUnread] = useMutation(DELETE_ALL_UNREAD_NOTIFICATIONS_MUTATION, refetchConfig)

  /**
   * Format timestamp to relative time
   * @author Thang Truong
   * @date 2025-11-26
   */
  const formatRelativeTime = (value: string): string => {
    try {
      const date = new Date(value)
      const diffMs = Date.now() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return value }
  }

  /** Toggle individual notification read status @author Thang Truong @date 2025-11-26 */
  const handleToggleRead = async (id: string, currentIsRead: boolean): Promise<void> => {
    if (updatingIds.has(id)) return
    setUpdatingIds((prev) => new Set(prev).add(id))
    try {
      await updateNotification({ variables: { id, input: { isRead: !currentIsRead } } })
      await showToast(`Notification marked as ${!currentIsRead ? 'read' : 'unread'}`, 'success', 3000)
    } catch { await showToast('Failed to update notification', 'error', 5000) }
    finally { setUpdatingIds((prev) => { const next = new Set(prev); next.delete(id); return next }) }
  }

  /** Mark all notifications as read @author Thang Truong @date 2025-11-26 */
  const handleMarkAllRead = async (): Promise<void> => {
    if (!userId || unreadCount === 0) return
    try { await markAllRead({ variables: { userId } }); await showToast('All notifications marked as read', 'success', 3000) }
    catch { await showToast('Failed to mark all as read', 'error', 5000) }
  }

  /** Mark all notifications as unread @author Thang Truong @date 2025-11-26 */
  const handleMarkAllUnread = async (): Promise<void> => {
    if (!userId || readCount === 0) return
    try { await markAllUnread({ variables: { userId } }); await showToast('All notifications marked as unread', 'success', 3000) }
    catch { await showToast('Failed to mark all as unread', 'error', 5000) }
  }

  /** Delete all read notifications @author Thang Truong @date 2025-11-26 */
  const handleDeleteAllRead = async (): Promise<void> => {
    if (!userId || readCount === 0) return
    try { await deleteAllRead({ variables: { userId } }); await showToast('All read notifications deleted', 'success', 3000) }
    catch { await showToast('Failed to delete read notifications', 'error', 5000) }
  }

  /** Delete all unread notifications @author Thang Truong @date 2025-11-26 */
  const handleDeleteAllUnread = async (): Promise<void> => {
    if (!userId || unreadCount === 0) return
    try { await deleteAllUnread({ variables: { userId } }); await showToast('All unread notifications deleted', 'success', 3000) }
    catch { await showToast('Failed to delete unread notifications', 'error', 5000) }
  }

  return (
    /* Notification drawer overlay container */
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-gray-800/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      {/* Notification drawer panel */}
      <aside className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-label="Notifications drawer">
        {/* Header with title and close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Real-time updates</p>
            <h2 className="text-lg font-semibold text-gray-900">Notifications ({unreadCount} unread)</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Bulk action buttons - Mark as read/unread */}
        {!isLoading && drawerNotifications.length > 0 && (
          <div className="px-5 py-2 border-b border-gray-100 bg-gray-50 space-y-2">
            <div className="flex gap-2">
              <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="flex-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed">Mark all read</button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={handleMarkAllUnread} disabled={readCount === 0} className="flex-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed">Mark all unread</button>
            </div>
            {/* Delete buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleDeleteAllRead} disabled={readCount === 0} className="flex-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed">Delete read ({readCount})</button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={handleDeleteAllUnread} disabled={unreadCount === 0} className="flex-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed">Delete unread ({unreadCount})</button>
            </div>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {isLoading ? (<p className="text-sm text-gray-500">Loading notifications...</p>) : drawerNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">You are all caught up. Actions from your projects will appear here.</p>
          ) : (
            drawerNotifications.map((notification) => (
              /* Individual notification card with toggle */
              <article key={notification.id} className={`rounded-xl border px-4 py-3 shadow-sm transition-all ${notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  {/* Read/unread toggle checkbox */}
                  <button type="button" onClick={() => handleToggleRead(notification.id, notification.isRead)} disabled={updatingIds.has(notification.id)} className="mt-0.5 flex-shrink-0" aria-label={notification.isRead ? 'Mark as unread' : 'Mark as read'}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${notification.isRead ? 'border-gray-300 bg-gray-100' : 'border-blue-500 bg-blue-500'}`}>
                      {!notification.isRead && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                  </button>
                  {/* Notification content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${notification.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>{notification.isRead ? 'Read' : 'Unread'}</span>
                      <span className="text-[11px] text-gray-400">{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer with close button */}
        <div className="px-5 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </aside>
    </div>
  )
}

export default NotificationDrawer
