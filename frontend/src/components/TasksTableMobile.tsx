/**
 * TasksTableMobile Component
 * Mobile card view for displaying tasks on small screens
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { formatDateToMelbourne, getStatusBadge, getStatusLabel, getPriorityBadge, getPriorityLabel } from '../utils/taskUtils'

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

interface TasksTableMobileProps {
  tasks: Task[]
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
}

/**
 * TasksTableMobile Component
 * Renders tasks as cards for mobile devices
 *
 * @param tasks - Array of task objects to display
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @returns JSX element containing mobile card view
 */
const TasksTableMobile = ({ tasks, onEdit, onDelete }: TasksTableMobileProps) => {
  return (
    <div className="space-y-3 p-3">
      {tasks.map((task) => (
        <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadge(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getPriorityBadge(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-3 space-y-1">
            <p>ID: {task.id}</p>
            <p>Project ID: {task.projectId}</p>
            {task.assignedTo && <p>Assigned To: {task.assignedTo}</p>}
            {task.dueDate && <p>Due: {formatDateToMelbourne(task.dueDate)}</p>}
            <p>Created: {formatDateToMelbourne(task.createdAt)}</p>
            <p>Updated: {formatDateToMelbourne(task.updatedAt)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              onClick={() => onEdit(task.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Edit task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Delete task"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TasksTableMobile

