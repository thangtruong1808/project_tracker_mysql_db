/**
 * TasksTableDesktop Component
 * Desktop view for tasks table with sortable columns
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import React from 'react'
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

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt'

interface TasksTableDesktopProps {
  tasks: Task[]
  onSort: (field: SortField) => void
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
  getSortIcon: (field: SortField) => React.ReactNode
}

/**
 * TasksTableDesktop Component
 * Renders the desktop view of the tasks table with full column support
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param tasks - Array of task objects to display
 * @param onSort - Callback when column header is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param getSortIcon - Function to get sort icon for columns
 * @returns JSX element containing desktop table view
 */
const TasksTableDesktop: React.FC<TasksTableDesktopProps> = ({ tasks, onSort, onEdit, onDelete, getSortIcon }) => {
  const sortableColumns: Array<{ field: SortField; label: string }> = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
  ]

  return (
    /* Desktop Tasks Table Container */
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header with Sortable Columns */}
        <thead className="bg-gray-50">
          <tr>
            {sortableColumns.map((col) => (
              <th key={col.field} onClick={() => onSort(col.field)} className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">{col.label}{getSortIcon(col.field)}</div>
              </th>
            ))}
            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th onClick={() => onSort('status')} className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">Status{getSortIcon('status')}</div>
            </th>
            <th onClick={() => onSort('priority')} className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">Priority{getSortIcon('priority')}</div>
            </th>
            <th onClick={() => onSort('createdAt')} className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">Created At{getSortIcon('createdAt')}</div>
            </th>
            <th onClick={() => onSort('updatedAt')} className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">Updated At{getSortIcon('updatedAt')}</div>
            </th>
            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        {/* Table Body with Task Data Rows */}
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
              <td className="px-4 xl:px-6 py-4 text-sm text-gray-700 max-w-xs"><div className="truncate">{task.description}</div></td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadge(task.status)}`}>{getStatusLabel(task.status)}</span>
              </td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getPriorityBadge(task.priority)}`}>{getPriorityLabel(task.priority)}</span>
              </td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateToMelbourne(task.createdAt)}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateToMelbourne(task.updatedAt)}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(task.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium" aria-label="Edit task">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <span>Edit</span>
                  </button>
                  <button onClick={() => onDelete(task.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium" aria-label="Delete task">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TasksTableDesktop

