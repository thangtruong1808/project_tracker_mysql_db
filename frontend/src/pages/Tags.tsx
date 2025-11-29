/**
 * Tags Page
 * Displays all tags in a table with search, sorting, and pagination
 * Provides tag management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { usePageDataManager } from '../hooks/usePageDataManager'
import { useModalState } from '../hooks/useModalState'
import { TAGS_QUERY } from '../graphql/queries'
import TagsTable from '../components/TagsTable'
import TagsSearchInput from '../components/TagsSearchInput'
import TagsPagination from '../components/TagsPagination'
import EditTagModal from '../components/EditTagModal'
import DeleteTagDialog from '../components/DeleteTagDialog'
import CreateTagModal from '../components/CreateTagModal'

interface Tag extends Record<string, unknown> {
  id: string
  name: string
  description: string | null
  title: string | null
  type: string | null
  category: string | null
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'name' | 'type' | 'category' | 'createdAt' | 'updatedAt'

/**
 * Tags Component
 * Main tags page displaying all tags in a sortable, searchable table
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing tags table with search and pagination
 */
const Tags = () => {
  const { showToast } = useToast()
  const { data, loading, error, refetch } = useQuery<{ tags: Tag[] }>(TAGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const dataManager = usePageDataManager<Tag, SortField>({
    data: data?.tags,
    defaultSortField: 'id',
    searchFields: ['name', 'description', 'title', 'type', 'category'],
    getFieldValue: (item, field) => {
      if (field === 'id') return Number(item[field])
      if (field === 'createdAt' || field === 'updatedAt') {
        return new Date(item[field] as string).getTime()
      }
      return (item[field] as string) || ''
    },
  })

  const modalState = useModalState<Tag>()

  /**
   * Handle data fetching errors
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useEffect(() => {
    const handleError = async () => {
      if (error) {
        await showToast('Failed to load tags. Please try again later.', 'error', 5000)
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

  /** Handle edit tag action - @author Thang Truong @date 2025-11-27 */
  const handleEdit = useCallback(async (tagId: string): Promise<void> => {
    const tag = dataManager.sortedData.find((t) => t.id === tagId)
    if (tag) modalState.openEditModal(tag)
  }, [dataManager.sortedData, modalState])

  /** Handle delete tag action - @author Thang Truong @date 2025-11-27 */
  const handleDelete = useCallback(async (tagId: string): Promise<void> => {
    const tag = dataManager.sortedData.find((t) => t.id === tagId)
    if (tag) modalState.openDeleteDialog(tag)
  }, [dataManager.sortedData, modalState])

  /** Handle successful CRUD operation - @author Thang Truong @date 2025-11-27 */
  const handleSuccess = useCallback(async (): Promise<void> => {
    modalState.handleSuccess()
  }, [modalState])

  return (
    /* Tags page container */
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
            Manage your tags efficiently. View, search, and organize all tags with advanced filtering.
          </p>
          <button
            onClick={modalState.openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Create new tag"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Tag</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <TagsSearchInput
          value={dataManager.searchTerm}
          onChange={dataManager.setSearchTerm}
          onClear={dataManager.handleClearSearch}
          placeholder="Search tags by name, description, title, type, or category..."
          isLoading={loading}
        />
      </div>

      {/* Tags Data Table */}
      <TagsTable
        tags={dataManager.paginatedData}
        sortField={dataManager.sortField}
        sortDirection={dataManager.sortDirection}
        onSort={dataManager.handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <TagsPagination
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

      {/* Edit Tag Modal */}
      <EditTagModal
        tag={modalState.selectedItem}
        isOpen={modalState.isEditModalOpen}
        onClose={modalState.closeEditModal}
        onSuccess={handleSuccess}
      />

      {/* Delete Tag Confirmation Dialog */}
      <DeleteTagDialog
        tag={modalState.selectedItem}
        isOpen={modalState.isDeleteDialogOpen}
        onClose={modalState.closeDeleteDialog}
        onSuccess={handleSuccess}
      />

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={modalState.isCreateModalOpen}
        onClose={modalState.closeCreateModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Tags
