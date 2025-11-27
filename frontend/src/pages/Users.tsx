/**
 * Users Page
 * Displays all users in a table with search, sorting, and pagination
 * Provides user management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { usePageDataManager } from '../hooks/usePageDataManager'
import { useModalState } from '../hooks/useModalState'
import { USERS_QUERY } from '../graphql/queries'
import UsersTable from '../components/UsersTable'
import UsersSearchInput from '../components/UsersSearchInput'
import UsersPagination from '../components/UsersPagination'
import EditUserModal from '../components/EditUserModal'
import DeleteUserDialog from '../components/DeleteUserDialog'
import CreateUserModal from '../components/CreateUserModal'

interface User {
  id: string
  uuid: string
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'updatedAt'

/**
 * Users Component
 * Main users page displaying all users in a sortable, searchable table
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @returns JSX element containing users table with search and pagination
 */
const Users = () => {
  const { showToast } = useToast()
  const { data, loading, error, refetch } = useQuery<{ users: User[] }>(USERS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const dataManager = usePageDataManager<User, SortField>({
    data: data?.users,
    defaultSortField: 'id',
    searchFields: ['firstName', 'lastName', 'email', 'role'],
    getFieldValue: (item, field) => {
      if (field === 'id') return Number(item[field])
      if (field === 'createdAt' || field === 'updatedAt') {
        return new Date(item[field] as string).getTime()
      }
      return (item[field] as string) || ''
    },
  })

  const modalState = useModalState<User>()

  /**
   * Handle data fetching errors
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        await showToast('Failed to load users. Please try again later.', 'error', 5000)
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch data on component mount
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await refetch()
      } catch {
        // Error handled in error effect
      }
    }
    loadData()
  }, [refetch])

  /**
   * Handle edit user action by finding user and opening modal
   *
   * @author Thang Truong
   * @date 2025-11-27
   * @param userId - ID of user to edit
   */
  const handleEdit = useCallback((userId: string): void => {
    const user = dataManager.sortedData.find((u) => u.id === userId)
    if (user) modalState.openEditModal(user)
  }, [dataManager.sortedData, modalState])

  /**
   * Handle delete user action by finding user and opening dialog
   *
   * @author Thang Truong
   * @date 2025-11-27
   * @param userId - ID of user to delete
   */
  const handleDelete = useCallback((userId: string): void => {
    const user = dataManager.sortedData.find((u) => u.id === userId)
    if (user) modalState.openDeleteDialog(user)
  }, [dataManager.sortedData, modalState])

  /**
   * Handle successful CRUD operation and refetch data
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  const handleSuccess = useCallback(async (): Promise<void> => {
    modalState.handleSuccess()
    await refetch()
  }, [modalState, refetch])

  return (
    /* Users Page Container */
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header Section with Description and Create Button */}
      {loading ? (
        /* Loading skeleton for header section */
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 sm:w-2/3"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32 sm:w-40"></div>
        </div>
      ) : (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Manage your team members efficiently. View, search, and organize all system users.
          </p>
          <button
            onClick={modalState.openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Create new user"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create User</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <UsersSearchInput
          value={dataManager.searchTerm}
          onChange={dataManager.setSearchTerm}
          onClear={dataManager.handleClearSearch}
          placeholder="Search users by name, email, or role..."
          isLoading={loading}
        />
      </div>

      {/* Users Data Table */}
      <UsersTable
        users={dataManager.paginatedData}
        sortField={dataManager.sortField}
        sortDirection={dataManager.sortDirection}
        onSort={dataManager.handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <UsersPagination
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

      {/* Edit User Modal */}
      <EditUserModal
        user={modalState.selectedItem}
        isOpen={modalState.isEditModalOpen}
        onClose={modalState.closeEditModal}
        onSuccess={handleSuccess}
      />

      {/* Delete User Confirmation Dialog */}
      <DeleteUserDialog
        user={modalState.selectedItem}
        isOpen={modalState.isDeleteDialogOpen}
        onClose={modalState.closeDeleteDialog}
        onSuccess={handleSuccess}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={modalState.isCreateModalOpen}
        onClose={modalState.closeCreateModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Users
