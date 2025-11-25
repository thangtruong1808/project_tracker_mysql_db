/**
 * Tasks Page
 * Displays all tasks in a table with search, sorting, and pagination
 * Provides task management capabilities with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-25
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
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

interface Task {
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

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

/**
 * Tasks Component
 * Main tasks page displaying all tasks in a sortable, searchable table
 *
 * @returns JSX element containing tasks table with search and pagination
 */
const Tasks = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Fetch tasks data from GraphQL API
   * Uses Apollo Client's useQuery hook with error handling
   */
  const { data, loading, error, refetch } = useQuery<{ tasks: Task[] }>(TASKS_QUERY, {
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
          'Failed to load tasks. Please try again later.',
          'error',
          5000
        )
      }
    }
    handleError()
  }, [error, showToast])

  /**
   * Refetch tasks data when component mounts
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
   * Filter and sort tasks based on search term and sort settings
   * Searches across title, description, status, and priority
   */
  const sortedTasks = useMemo(() => {
    const tasks = data?.tasks || []

    // Filter tasks
    let filtered = tasks
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.status.toLowerCase().includes(searchLower) ||
          task.priority.toLowerCase().includes(searchLower)
      )
    }

    // Sort tasks
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
  }, [data?.tasks, debouncedSearchTerm, sortField, sortDirection])

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(sortedTasks.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedTasks = sortedTasks.slice(startIndex, endIndex)

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
   * Handle edit task action
   * Opens edit modal with selected task data
   *
   * @param taskId - The ID of the task to edit
   */
  const handleEdit = useCallback((taskId: string) => {
    const task = sortedTasks.find((t) => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setIsEditModalOpen(true)
    }
  }, [sortedTasks])

  /**
   * Handle delete task action
   * Opens delete confirmation dialog with selected task data
   *
   * @param taskId - The ID of the task to delete
   */
  const handleDelete = useCallback((taskId: string) => {
    const task = sortedTasks.find((t) => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setIsDeleteDialogOpen(true)
    }
  }, [sortedTasks])

  /**
   * Handle successful create, edit or delete
   * Resets selected task and closes modals
   */
  const handleSuccess = useCallback(() => {
    setSelectedTask(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
  }, [])

  /**
   * Handle create task action
   * Opens create task modal
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
          Manage your tasks efficiently. View, search, and organize all tasks with advanced filtering and sorting capabilities.
        </p>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          aria-label="Create new task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Task</span>
        </button>
      </div>

      {/* Search Input - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <TasksSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={handleClearSearch}
          placeholder="Search tasks by title, description, status, or priority..."
        />
      </div>

      {/* Tasks Table */}
      <TasksTable
        tasks={paginatedTasks}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination - Only show when not loading and has data */}
      {!loading && (
        <TasksPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={sortedTasks.length}
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

      {/* Edit Task Modal */}
      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTask(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        task={selectedTask}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedTask(null)
        }}
        onSuccess={handleSuccess}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Tasks

