/**
 * Tags Page
 * Displays all tags in a table with search, sorting, and pagination
 * Provides tag management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { TAGS_QUERY } from '../graphql/queries'
import TagsTable from '../components/TagsTable'
import TagsSearchInput from '../components/TagsSearchInput'
import TagsPagination from '../components/TagsPagination'
import EditTagModal from '../components/EditTagModal'
import DeleteTagDialog from '../components/DeleteTagDialog'
import CreateTagModal from '../components/CreateTagModal'

interface Tag {
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
type SortDirection = 'ASC' | 'DESC'

/**
 * Tags Component
 * Main tags page displaying all tags in a sortable, searchable table
 *
 * @returns JSX element containing tags table with search and pagination
 */
const Tags = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Fetch tags data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   */
  const { data, loading, error, refetch } = useQuery<{ tags: Tag[] }>(TAGS_QUERY, {
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
          'Failed to load tags. Please try again later.',
          'error',
          5000
        )
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch tags data when component mounts
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
   * Filter and sort tags based on search term and sort settings
   * Searches across name, description, title, type, and category
   */
  const sortedTags = useMemo(() => {
    const tags = data?.tags || []

    // Filter tags
    let filtered = tags
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchLower) ||
          (tag.description && tag.description.toLowerCase().includes(searchLower)) ||
          (tag.title && tag.title.toLowerCase().includes(searchLower)) ||
          (tag.type && tag.type.toLowerCase().includes(searchLower)) ||
          (tag.category && tag.category.toLowerCase().includes(searchLower))
      )
    }

    // Sort tags
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: string | number = a[sortField] || ''
      let bValue: string | number = b[sortField] || ''

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
  }, [data?.tags, debouncedSearchTerm, sortField, sortDirection])

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(sortedTags.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedTags = sortedTags.slice(startIndex, endIndex)

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
   * Handle edit tag action
   * Opens edit modal with selected tag data
   *
   * @param tagId - The ID of the tag to edit
   */
  const handleEdit = useCallback((tagId: string) => {
    const tag = sortedTags.find((t) => t.id === tagId)
    if (tag) {
      setSelectedTag(tag)
      setIsEditModalOpen(true)
    }
  }, [sortedTags])

  /**
   * Handle delete tag action
   * Opens delete confirmation dialog with selected tag data
   *
   * @param tagId - The ID of the tag to delete
   */
  const handleDelete = useCallback((tagId: string) => {
    const tag = sortedTags.find((t) => t.id === tagId)
    if (tag) {
      setSelectedTag(tag)
      setIsDeleteDialogOpen(true)
    }
  }, [sortedTags])

  /**
   * Handle successful create, edit or delete
   * Resets selected tag and closes modals
   */
  const handleSuccess = useCallback(() => {
    setSelectedTag(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
  }, [])

  /**
   * Handle create tag action
   * Opens create tag modal
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
          Manage your tags efficiently. View, search, and organize all tags with advanced filtering and sorting capabilities.
        </p>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          aria-label="Create new tag"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Tag</span>
        </button>
      </div>

      {/* Search Input - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <TagsSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={handleClearSearch}
          placeholder="Search tags by name, description, title, type, or category..."
        />
      </div>

      {/* Tags Table */}
      <TagsTable
        tags={paginatedTags}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination - Only show when not loading and has data */}
      {!loading && (
        <TagsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={sortedTags.length}
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

      {/* Edit Tag Modal */}
      <EditTagModal
        tag={selectedTag}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTag(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Tag Dialog */}
      <DeleteTagDialog
        tag={selectedTag}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedTag(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Tags

