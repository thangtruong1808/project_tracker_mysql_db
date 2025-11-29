/**
 * CommentsTableDesktop Component
 * Desktop view for comments table with sortable columns
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import React from 'react'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Comment {
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

interface CommentsTableDesktopProps {
  comments: Comment[]
  onSort: (field: SortField) => void
  onEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
  formatDate: (dateString: string | null | undefined) => string
  getSortIcon: (field: SortField) => React.ReactNode
}

/**
 * CommentsTableDesktop Component
 * Renders the desktop view of the comments table with full column support
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @param comments - Array of comment objects to display
 * @param onSort - Callback when column header is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param formatDate - Function to format date values
 * @param getSortIcon - Function to get sort icon for columns
 * @returns JSX element containing desktop table view
 */
const CommentsTableDesktop: React.FC<CommentsTableDesktopProps> = ({
  comments,
  onSort,
  onEdit,
  onDelete,
  formatDate,
  getSortIcon,
}) => {
  const columns: Array<{ field: SortField; label: string }> = [
    { field: 'id', label: 'ID' },
    { field: 'content', label: 'Content' },
    { field: 'projectId', label: 'Project ID' },
    { field: 'createdAt', label: 'Created At' },
    { field: 'updatedAt', label: 'Updated At' },
  ]

  return (
    /* Desktop Table Container */
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header with Sortable Columns */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => onSort(col.field)}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {getSortIcon(col.field)}
                </div>
              </th>
            ))}
            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        {/* Table Body with Comment Data Rows */}
        <tbody className="bg-white divide-y divide-gray-200">
          {comments.map((comment) => (
            <tr key={comment.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comment.id}</td>
              <td className="px-4 xl:px-6 py-4 text-sm text-gray-700 max-w-xs"><div className="truncate">{comment.content}</div></td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{comment.projectId || 'N/A'}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(comment.createdAt)}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(comment.updatedAt)}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {comment.user.firstName} {comment.user.lastName}
              </td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(comment.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                    aria-label="Edit comment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                    aria-label="Delete comment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

export default CommentsTableDesktop

