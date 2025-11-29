/**
 * TasksTable Component
 * Displays tasks in a sortable table with responsive layouts
 * Delegates to desktop, tablet, and mobile sub-components
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import TasksTableDesktop from './TasksTableDesktop'
import TasksTableMobile from './TasksTableMobile'
import TasksTableTablet from './TasksTableTablet'
import TasksTableLoading from './TasksTableLoading'

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
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'title' | 'status' | 'priority' | 'projectId' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

interface TasksTableProps {
  tasks: Task[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
  isLoading?: boolean
}

/**
 * TasksTable Component
 * Renders a responsive tasks table with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param tasks - Array of task objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction (ASC or DESC)
 * @param onSort - Callback when column header is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param isLoading - Whether data is loading
 * @returns JSX element containing responsive tasks table
 */
const TasksTable = ({ tasks, sortField, sortDirection, onSort, onEdit, onDelete, isLoading = false }: TasksTableProps) => {
  /**
   * Get sort icon for column header
   *
   * @author Thang Truong
   * @date 2025-11-26
   * @param field - The field to check
   * @returns JSX element with sort icon
   */
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'ASC' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (isLoading) return <TasksTableLoading />

  if (tasks.length === 0) {
    return (
      /* Empty State Display */
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
        <p className="text-sm sm:text-base text-gray-600">No tasks to display</p>
      </div>
    )
  }

  return (
    /* Responsive Tasks Table Container */
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <TasksTableDesktop tasks={tasks} onSort={onSort} onEdit={onEdit} onDelete={onDelete} getSortIcon={getSortIcon} />
      {/* Tablet Table View */}
      <div className="hidden md:block lg:hidden">
        <TasksTableTablet tasks={tasks} sortField={sortField} sortDirection={sortDirection} onSort={onSort} onEdit={onEdit} onDelete={onDelete} getSortIcon={getSortIcon} />
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden">
        <TasksTableMobile tasks={tasks} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default TasksTable
