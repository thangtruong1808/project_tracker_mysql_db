/**
 * Comments Page
 * Displays all comments in a table with search, sorting, and pagination
 * Provides comment management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { usePageDataManager } from '../hooks/usePageDataManager'
import { useModalState } from '../hooks/useModalState'
import { COMMENTS_QUERY } from '../graphql/queries'
import CommentsTable from '../components/CommentsTable'
import CommentsSearchInput from '../components/CommentsSearchInput'
import CommentsPagination from '../components/CommentsPagination'
import EditCommentModal from '../components/EditCommentModal'
import DeleteCommentDialog from '../components/DeleteCommentDialog'
import CreateCommentModal from '../components/CreateCommentModal'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Comment extends Record<string, unknown> {
  id: string
  uuid: string
  content: string
  projectId: string | null
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'content' | 'projectId' | 'createdAt' | 'updatedAt'

/**
 * Comments Component
 * Main comments page displaying all comments in a sortable, searchable table
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @returns JSX element containing comments table with search and pagination
 */
const Comments = () => {
  const { showToast } = useToast()
  const { data, loading, error, refetch } = useQuery<{ comments: Comment[] }>(COMMENTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const dataManager = usePageDataManager<Comment, SortField>({
    data: data?.comments,
    defaultSortField: 'id',
    searchFields: ['content', 'projectId'],
    getFieldValue: (item, field) => {
      if (field === 'id' || field === 'projectId') return Number(item[field] || 0)
      if (field === 'createdAt' || field === 'updatedAt') {
        return new Date(item[field] as string).getTime()
      }
      return (item[field] as string) || ''
    },
  })

  const modalState = useModalState<Comment>()

  /**
   * Handle data fetching errors
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        await showToast('Failed to load comments. Please try again later.', 'error', 5000)
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Handle edit comment action by finding comment and opening modal
   *
   * @author Thang Truong
   * @date 2025-11-27
   * @param commentId - ID of comment to edit
   */
  const handleEdit = useCallback((commentId: string): void => {
    const comment = dataManager.sortedData.find((c) => c.id === commentId)
    if (comment) modalState.openEditModal(comment)
  }, [dataManager.sortedData, modalState])

  /**
   * Handle delete comment action by finding comment and opening dialog
   *
   * @author Thang Truong
   * @date 2025-11-27
   * @param commentId - ID of comment to delete
   */
  const handleDelete = useCallback((commentId: string): void => {
    const comment = dataManager.sortedData.find((c) => c.id === commentId)
    if (comment) modalState.openDeleteDialog(comment)
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
    /* Comments Page Container */
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
            Manage project comments efficiently. View, search, and organize all comments.
          </p>
          <button
            onClick={modalState.openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Create new comment"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Comment</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <CommentsSearchInput
          value={dataManager.searchTerm}
          onChange={dataManager.setSearchTerm}
          onClear={dataManager.handleClearSearch}
          placeholder="Search comments by content or project ID..."
          isLoading={loading}
        />
      </div>

      {/* Comments Data Table */}
      <CommentsTable
        comments={dataManager.paginatedData}
        sortField={dataManager.sortField}
        sortDirection={dataManager.sortDirection}
        onSort={dataManager.handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <CommentsPagination
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

      {/* Edit Comment Modal */}
      <EditCommentModal
        comment={modalState.selectedItem}
        isOpen={modalState.isEditModalOpen}
        onClose={modalState.closeEditModal}
        onSuccess={handleSuccess}
      />

      {/* Delete Comment Confirmation Dialog */}
      <DeleteCommentDialog
        comment={modalState.selectedItem}
        isOpen={modalState.isDeleteDialogOpen}
        onClose={modalState.closeDeleteDialog}
        onSuccess={handleSuccess}
      />

      {/* Create Comment Modal */}
      <CreateCommentModal
        isOpen={modalState.isCreateModalOpen}
        onClose={modalState.closeCreateModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Comments

