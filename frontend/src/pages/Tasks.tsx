/**
 * Tasks Page
 * Displays all tasks in a table with search, sorting, and pagination
 * Provides task management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { usePageDataManager } from '../hooks/usePageDataManager'
import { useModalState } from '../hooks/useModalState'
import { TASKS_QUERY } from '../graphql/queries'
import TasksTable from '../components/TasksTable'
import TasksSearchInput from '../components/TasksSearchInput'
import TasksPagination from '../components/TasksPagination'
import EditTaskModal from '../components/EditTaskModal'
import DeleteTaskDialog from '../components/DeleteTaskDialog'
import CreateTaskModal from '../components/CreateTaskModal'

interface Tag {
  id: string
  name: string
  description?: string
  category?: string
}

interface Task extends Record<string, unknown> {
  id: string
  uuid: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  projectId: string
  assignedTo: string | null
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'title' | 'status' | 'priority' | 'projectId' | 'createdAt' | 'updatedAt'

/**
 * Tasks Component
 * Main tasks page displaying all tasks in a sortable, searchable table
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @returns JSX element containing tasks table with search and pagination
 */
const Tasks = () => {
  const { showToast } = useToast()
  const { data, loading, error, refetch } = useQuery<{ tasks: Task[] }>(TASKS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const dataManager = usePageDataManager<Task, SortField>({
    data: data?.tasks,
    defaultSortField: 'id',
    searchFields: ['title', 'description', 'status', 'priority'],
    getFieldValue: (item, field) => {
      if (field === 'id' || field === 'projectId') return Number(item[field])
      if (field === 'createdAt' || field === 'updatedAt') {
        return new Date(item[field] as string).getTime()
      }
      return (item[field] as string) || ''
    },
  })

  const modalState = useModalState<Task>()

  /**
   * Handle data fetching errors
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        await showToast('Failed to load tasks. Please try again later.', 'error', 5000)
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch data on component mount
   *
   * @author Thang Truong
   * @date 2025-01-27
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
   * Handle edit task action by finding task and opening modal
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param taskId - ID of task to edit
   */
  const handleEdit = useCallback(async (taskId: string): Promise<void> => {
    const task = dataManager.sortedData.find((t) => t.id === taskId)
    if (task) modalState.openEditModal(task)
  }, [dataManager.sortedData, modalState])

  /**
   * Handle delete task action by finding task and opening dialog
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param taskId - ID of task to delete
   */
  const handleDelete = useCallback(async (taskId: string): Promise<void> => {
    const task = dataManager.sortedData.find((t) => t.id === taskId)
    if (task) modalState.openDeleteDialog(task)
  }, [dataManager.sortedData, modalState])

  /**
   * Handle successful CRUD operation and refetch data
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleSuccess = useCallback(async (): Promise<void> => {
    modalState.handleSuccess()
    await refetch()
  }, [modalState, refetch])

  return (
    /* Tasks Page Container */
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
            Manage your tasks efficiently. View, search, and organize all tasks with advanced filtering.
          </p>
          <button
            onClick={modalState.openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Create new task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Task</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <TasksSearchInput
          value={dataManager.searchTerm}
          onChange={dataManager.setSearchTerm}
          onClear={dataManager.handleClearSearch}
          placeholder="Search tasks by title, description, status, or priority..."
          isLoading={loading}
        />
      </div>

      {/* Tasks Data Table */}
      <TasksTable
        tasks={dataManager.paginatedData}
        sortField={dataManager.sortField}
        sortDirection={dataManager.sortDirection}
        onSort={dataManager.handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <TasksPagination
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

      {/* Edit Task Modal */}
      <EditTaskModal
        task={modalState.selectedItem}
        isOpen={modalState.isEditModalOpen}
        onClose={modalState.closeEditModal}
        onSuccess={handleSuccess}
      />

      {/* Delete Task Confirmation Dialog */}
      <DeleteTaskDialog
        task={modalState.selectedItem}
        isOpen={modalState.isDeleteDialogOpen}
        onClose={modalState.closeDeleteDialog}
        onSuccess={handleSuccess}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={modalState.isCreateModalOpen}
        onClose={modalState.closeCreateModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Tasks
