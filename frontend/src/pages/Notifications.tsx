/**
 * Notifications Page
 * Displays all notifications in a table with search, sorting, and pagination
 * Provides notification management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useEffect, useCallback, useRef } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { usePageDataManager } from '../hooks/usePageDataManager'
import { useModalState } from '../hooks/useModalState'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import { NOTIFICATION_CREATED_SUBSCRIPTION } from '../graphql/subscriptions'
import { useAuth } from '../context/AuthContext'
import NotificationsTable from '../components/NotificationsTable'
import NotificationsSearchInput from '../components/NotificationsSearchInput'
import NotificationsPagination from '../components/NotificationsPagination'
import EditNotificationModal from '../components/EditNotificationModal'
import DeleteNotificationDialog from '../components/DeleteNotificationDialog'
import CreateNotificationModal from '../components/CreateNotificationModal'

interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'message' | 'isRead' | 'createdAt' | 'updatedAt'

/**
 * Notifications Component
 * Main notifications page displaying all notifications in a sortable, searchable table
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing notifications table with search and pagination
 */
const Notifications = () => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const processedNotificationIds = useRef<Set<string>>(new Set())

  const { data, loading, error, refetch } = useQuery<{ notifications: Notification[] }>(
    NOTIFICATIONS_QUERY,
    { fetchPolicy: 'cache-and-network', errorPolicy: 'all' }
  )

  const dataManager = usePageDataManager<Notification, SortField>({
    data: data?.notifications,
    defaultSortField: 'id',
    searchFields: ['message', 'userId'],
    getFieldValue: (item, field) => {
      if (field === 'id') return Number(item[field])
      if (field === 'isRead') return item.isRead ? 1 : 0
      if (field === 'createdAt' || field === 'updatedAt') {
        return new Date(item[field] as string).getTime()
      }
      return (item[field] as string) || ''
    },
  })

  const modalState = useModalState<Notification>()

  /**
   * Subscribe to new notifications for real-time updates
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
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
   * Handle data fetching errors
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useEffect(() => {
    const handleError = async () => {
      if (error) {
        await showToast('Failed to load notifications. Please try again later.', 'error', 5000)
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch data on component mount
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        await refetch()
      } catch {
        // Error handled in error effect
      }
    }
    loadData()
  }, [refetch])

  /** Handle edit notification action - @author Thang Truong @date 2025-11-27 */
  const handleEdit = useCallback(async (notificationId: string): Promise<void> => {
    const notification = dataManager.sortedData.find((n) => n.id === notificationId)
    if (notification) modalState.openEditModal(notification)
  }, [dataManager.sortedData, modalState])

  /** Handle delete notification action - @author Thang Truong @date 2025-11-27 */
  const handleDelete = useCallback(async (notificationId: string): Promise<void> => {
    const notification = dataManager.sortedData.find((n) => n.id === notificationId)
    if (notification) modalState.openDeleteDialog(notification)
  }, [dataManager.sortedData, modalState])

  /** Handle successful CRUD operation and refetch data - @author Thang Truong @date 2025-11-27 */
  const handleSuccess = useCallback(async (): Promise<void> => {
    modalState.handleSuccess()
    await refetch()
  }, [modalState, refetch])

  return (
    /* Notifications page container */
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header Section with Description and Create Button */}
      {loading ? (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 max-w-md"></div>
          <div className="h-10 bg-blue-200 rounded-lg w-32"></div>
        </div>
      ) : (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Manage your notifications efficiently. View, search, and organize all notifications.
          </p>
          <button
            onClick={modalState.openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Create new notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Notification</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <NotificationsSearchInput
          value={dataManager.searchTerm}
          onChange={dataManager.setSearchTerm}
          onClear={dataManager.handleClearSearch}
          placeholder="Search notifications by message, user ID, or status..."
          isLoading={loading}
        />
      </div>

      {/* Notifications Data Table */}
      <NotificationsTable
        notifications={dataManager.paginatedData}
        sortField={dataManager.sortField}
        sortDirection={dataManager.sortDirection}
        onSort={dataManager.handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <NotificationsPagination
        currentPage={dataManager.currentPage}
        totalPages={dataManager.totalPages}
        totalEntries={dataManager.sortedData.length}
        startIndex={dataManager.startIndex}
        endIndex={dataManager.endIndex}
        entriesPerPage={dataManager.entriesPerPage}
        onPageChange={dataManager.setCurrentPage}
        onEntriesPerPageChange={(value) => {
          dataManager.setEntriesPerPage(value)
          dataManager.setCurrentPage(1)
        }}
        isLoading={loading}
      />

      {/* Edit Notification Modal */}
      <EditNotificationModal
        notification={modalState.selectedItem}
        isOpen={modalState.isEditModalOpen}
        onClose={modalState.closeEditModal}
        onSuccess={handleSuccess}
      />

      {/* Delete Notification Confirmation Dialog */}
      <DeleteNotificationDialog
        notification={modalState.selectedItem}
        isOpen={modalState.isDeleteDialogOpen}
        onClose={modalState.closeDeleteDialog}
        onSuccess={handleSuccess}
      />

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={modalState.isCreateModalOpen}
        onClose={modalState.closeCreateModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Notifications
