/**
 * ProjectDetailTasks Component
 * Displays list of tasks associated with a project with like functionality
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { LIKE_TASK_MUTATION } from '../graphql/mutations'
import { PROJECT_QUERY } from '../graphql/queries'
import { useParams } from 'react-router-dom'
import StatusBadge from './StatusBadge'

interface TaskOwner {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProjectTask {
  id: string
  uuid: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  projectId: string
  assignedTo: string | null
  owner: TaskOwner | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectDetailTasksProps {
  tasks: ProjectTask[]
}

/**
 * ProjectDetailTasks Component
 * Renders a section displaying project tasks with like functionality
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectDetailTasks = ({ tasks }: ProjectDetailTasksProps) => {
  const { id: projectId } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [submittingTasks, setSubmittingTasks] = useState<Set<string>>(new Set())

  const [likeTask] = useMutation(LIKE_TASK_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id: projectId } }],
    onError: async (error) => {
      await showToast(error.message || 'Failed to like task. Please try again.', 'error', 5000)
    },
  })

  /**
   * Format date for display
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Handle like button click for a task
   * Backend checks DB and returns updated isLiked status
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param taskId - Task ID to like/unlike
   * @param e - Mouse event
   */
  const handleLike = async (taskId: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (!isAuthenticated) {
      await showToast(
        'Please log in to like tasks. Authentication is required to show your appreciation!',
        'info',
        5000
      )
      return
    }
    if (submittingTasks.has(taskId)) return

    setSubmittingTasks((prev) => new Set(prev).add(taskId))
    try {
      const result = await likeTask({ variables: { taskId } })
      if (result.data?.likeTask?.success) {
        await showToast(result.data.likeTask.message || 'Task liked successfully!', 'success', 3000)
      } else {
        await showToast(result.data?.likeTask?.message || 'Unable to like task. Please try again.', 'info', 3000)
      }
    } catch (error: any) {
      await showToast(error.message || 'Failed to like task. Please try again.', 'error', 5000)
    } finally {
      setSubmittingTasks((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Tasks ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks found for this project.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h3>
                <StatusBadge status={task.status} type="task" />
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

              {task.owner && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="truncate">
                    {task.owner.firstName} {task.owner.lastName}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleLike(task.id, e)}
                  disabled={submittingTasks.has(task.id)}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors disabled:opacity-50 text-xs text-gray-600"
                  aria-label={`Like task ${task.title}`}
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${task.isLiked
                      ? 'text-blue-600 fill-blue-600'
                      : 'text-gray-400 hover:text-blue-500'
                      }`}
                    fill={task.isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="font-medium">{task.likesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectDetailTasks
