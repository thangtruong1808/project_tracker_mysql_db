/**
 * Notifications Page
 * Displays all notifications in a table with search, sorting, and pagination
 * Provides notification management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import NotificationsTable from '../components/NotificationsTable'
import NotificationsSearchInput from '../components/NotificationsSearchInput'
import NotificationsPagination from '../components/NotificationsPagination'
import EditNotificationModal from '../components/EditNotificationModal'
import DeleteNotificationDialog from '../components/DeleteNotificationDialog'
import CreateNotificationModal from '../components/CreateNotificationModal'
import { useAuth } from '../context/AuthContext'
import { NOTIFICATION_CREATED_SUBSCRIPTION } from '../graphql/subscriptions'

interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'message' | 'isRead' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

/**
 * Notifications Component
 * Main notifications page displaying all notifications in a sortable, searchable table
 *
 * @returns JSX element containing notifications table with search and pagination
 */
const Notifications = () => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const processedNotificationIds = useRef<Set<string>>(new Set())

  /**
   * Fetch notifications data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   */
  const { data, loading, error, refetch } = useQuery<{ notifications: Notification[] }>(NOTIFICATIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  useSubscription(NOTIFICATION_CREATED_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
    onData: async ({ data: subscriptionData }) => {
      const newNotification = subscriptionData?.data?.notificationCreated
      if (!newNotification || processedNotificationIds.current.has(newNotification.id)) {
        return
      }
      processedNotificationIds.current.add(newNotification.id)
      await showToast('New notification received.', 'info', 7000)
      await refetch()
    },
  })

  /**
   * Debounce search input with 500ms delay
   * Updates debouncedSearchTerm after user stops typing for 500ms
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  /**
   * Handle data fetching errors
   * Displays error toast notification to user
   */
  useEffect(() => {
    const handleError = async () => {
      if (error) {
        await showToast(
          'Failed to load notifications. Please try again later.',
          'error',
          5000
        )
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch notifications data when component mounts
   * Ensures fresh data is loaded on page access
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        await refetch()
      } catch (err) {
        // Error handling is done in the error effect above
      }
    }
    loadData()
  }, [refetch])

  /**
   * Filter and sort notifications based on search term and sort settings
   * Searches across message and read status
   */
  const sortedNotifications = useMemo(() => {
    const notifications = data?.notifications || []

    // Filter notifications
    let filtered = notifications
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = notifications.filter(
        (notification) =>
          notification.message.toLowerCase().includes(searchLower) ||
          notification.userId.toLowerCase().includes(searchLower) ||
          (notification.isRead ? 'read' : 'unread').includes(searchLower)
      )
    }

    // Sort notifications
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: string | number | boolean = a[sortField] || ''
      let bValue: string | number | boolean = b[sortField] || ''

      if (sortField === 'id') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortField === 'isRead') {
        aValue = a.isRead ? 1 : 0
        bValue = b.isRead ? 1 : 0
      } else if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else {
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      return sortDirection === 'ASC'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1)
    })
    return sorted
  }, [data?.notifications, debouncedSearchTerm, sortField, sortDirection])

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(sortedNotifications.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedNotifications = sortedNotifications.slice(startIndex, endIndex)

  /**
   * Handle column header click for sorting
   * Toggles between ASC and DESC, or sets new sort field
   *
   * @param field - The field to sort by
   */
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortField(field)
      setSortDirection('ASC')
    }
  }, [sortField, sortDirection])

  /**
   * Handle edit notification action
   * Opens edit modal with selected notification data
   *
   * @param notificationId - The ID of the notification to edit
   */
  const handleEdit = useCallback((notificationId: string) => {
    const notification = sortedNotifications.find((n) => n.id === notificationId)
    if (notification) {
      setSelectedNotification(notification)
      setIsEditModalOpen(true)
    }
  }, [sortedNotifications])

  /**
   * Handle delete notification action
   * Opens delete confirmation dialog with selected notification data
   *
   * @param notificationId - The ID of the notification to delete
   */
  const handleDelete = useCallback((notificationId: string) => {
    const notification = sortedNotifications.find((n) => n.id === notificationId)
    if (notification) {
      setSelectedNotification(notification)
      setIsDeleteDialogOpen(true)
    }
  }, [sortedNotifications])

  /**
   * Handle successful create, edit or delete
   * Resets selected notification and closes modals
   */
  const handleSuccess = useCallback(async () => {
    setSelectedNotification(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
    await refetch()
  }, [refetch])

  /**
   * Handle create notification action
   * Opens create notification modal
   */
  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  /**
   * Clear search input
   */
  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header Section with Description and Create Button */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Manage your notifications efficiently. View, search, and organize all notifications with advanced filtering and sorting capabilities.
        </p>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          aria-label="Create new notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Notification</span>
        </button>
      </div>

      {/* Search Input - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <NotificationsSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={handleClearSearch}
          placeholder="Search notifications by message, user ID, or status..."
        />
      </div>

      {/* Notifications Table */}
      <NotificationsTable
        notifications={paginatedNotifications}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination - Only show when not loading and has data */}
      {!loading && (
        <NotificationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={sortedNotifications.length}
          startIndex={startIndex}
          endIndex={endIndex}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value)
            setCurrentPage(1)
          }}
        />
      )}

      {/* Edit Notification Modal */}
      <EditNotificationModal
        notification={selectedNotification}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedNotification(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Notification Dialog */}
      <DeleteNotificationDialog
        notification={selectedNotification}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedNotification(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Notifications

