import { useMemo } from 'react'

interface NotificationItem {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  isLoading: boolean
}

/**
 * NotificationDrawer Component
 * Renders a right-side drawer showing recent notifications
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
const NotificationDrawer = ({ isOpen, onClose, notifications, isLoading }: NotificationDrawerProps) => {
  const drawerNotifications = useMemo(() => notifications.slice(0, 50), [notifications])

  const formatTimestamp = (value: string): string => {
    try {
      const date = new Date(value)
      return date.toLocaleString()
    } catch {
      return value
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Notification drawer container */}
      <div
        className={`absolute inset-0 bg-gray-800/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Notifications drawer"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Real-time updates</p>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close notifications drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading notifications...</p>
          ) : drawerNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">You are all caught up. Actions from your projects will appear here.</p>
          ) : (
            drawerNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-xl border px-4 py-3 shadow-sm transition-colors ${
                  notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
                }`}
              >
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-500">
                  {formatTimestamp(notification.createdAt)}
                </p>
              </article>
            ))
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  )
}

export default NotificationDrawer


