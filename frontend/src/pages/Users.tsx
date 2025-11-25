/**
 * Users Page
 * Displays all users in a table with search, sorting, and pagination
 * Provides user management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
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
type SortDirection = 'ASC' | 'DESC'

/**
 * Users Component
 * Main users page displaying all users in a sortable, searchable table
 *
 * @returns JSX element containing users table with search and pagination
 */
const Users = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Fetch users data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   */
  const { data, loading, error, refetch } = useQuery<{ users: User[] }>(USERS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  /**
   * Debounce search input with 500ms delay
   * Updates debouncedSearchTerm after user stops typing for 500ms
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when search changes
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
          'Failed to load users. Please try again later.',
          'error',
          5000
        )
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch users data when component mounts
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
   * Filter and sort users based on search term and sort settings
   * Searches across firstName, lastName, email, and role
   */
  const sortedUsers = useMemo(() => {
    const users = data?.users || []

    // Filter users
    let filtered = users
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
      )
    }

    // Sort users
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (sortField === 'id') {
        aValue = Number(aValue)
        bValue = Number(bValue)
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
  }, [data?.users, debouncedSearchTerm, sortField, sortDirection])

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(sortedUsers.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex)

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
   * Handle edit user action
   * Opens edit modal with selected user data
   *
   * @param userId - The ID of the user to edit
   */
  const handleEdit = useCallback((userId: string) => {
    const user = sortedUsers.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setIsEditModalOpen(true)
    }
  }, [sortedUsers])

  /**
   * Handle delete user action
   * Opens delete confirmation dialog with selected user data
   *
   * @param userId - The ID of the user to delete
   */
  const handleDelete = useCallback((userId: string) => {
    const user = sortedUsers.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setIsDeleteDialogOpen(true)
    }
  }, [sortedUsers])

  /**
   * Handle successful create, edit or delete
   * Resets selected user and closes modals
   */
  const handleSuccess = useCallback(() => {
    setSelectedUser(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
  }, [])

  /**
   * Handle create user action
   * Opens create user modal
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
          Manage your team members efficiently. View, search, and organize all system users with advanced filtering and sorting capabilities.
        </p>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          aria-label="Create new user"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create User</span>
        </button>
      </div>

      {/* Search Input - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <UsersSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={handleClearSearch}
          placeholder="Search users by name, email, or role..."
        />
      </div>

      {/* Users Table */}
      <UsersTable
        users={paginatedUsers}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination - Only show when not loading and has data */}
      {!loading && (
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={sortedUsers.length}
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

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Users
