/**
 * CreateTaskModal Component
 * Modal dialog for creating a new task with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-25
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { CREATE_TASK_MUTATION } from '../graphql/mutations'
import { TASKS_QUERY, PROJECTS_QUERY, USERS_QUERY, TAGS_QUERY } from '../graphql/queries'
import CreateTaskFormFields from './CreateTaskFormFields'

interface Tag {
  id: string
  name: string
  description?: string
  category?: string
}

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateTaskFormData {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  projectId: string
  assignedTo: string
}

/**
 * CreateTaskModal Component
 * Renders a modal form for creating a new task with react-hook-form validation
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when task is successfully created
 * @returns JSX element containing create task modal
 */
const CreateTaskModal = ({ isOpen, onClose, onSuccess }: CreateTaskModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  /**
   * Fetch projects, users, and tags for dropdowns
   *
   * @author Thang Truong
   * @date 2025-11-25
   */
  const { data: projectsData } = useQuery<{ projects: Array<{ id: string; name: string }> }>(
    PROJECTS_QUERY,
    { skip: !isOpen }
  )
  const { data: usersData } = useQuery<{ users: Array<{ id: string; firstName: string; lastName: string }> }>(
    USERS_QUERY,
    { skip: !isOpen }
  )
  const { data: tagsData } = useQuery<{ tags: Tag[] }>(
    TAGS_QUERY,
    { skip: !isOpen }
  )

  /**
   * Initialize react-hook-form with validation rules
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTaskFormData>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      projectId: '',
      assignedTo: '',
    },
  })

  /**
   * Create task mutation
   * Refetches tasks list after successful creation
   *
   * @author Thang Truong
   * @date 2025-11-25
   */
  const [createTask] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: [{ query: TASKS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to create task. Please try again.')
    },
  })

  /**
   * Reset form when modal closes
   *
   * @author Thang Truong
   * @date 2025-11-25
   */
  useEffect(() => {
    if (!isOpen) {
      reset()
      setError('')
      setSelectedTagIds([])
    }
  }, [isOpen, reset])

  /**
   * Handle tag selection change
   * Updates selected tag IDs state
   *
   * @author Thang Truong
   * @date 2025-11-25
   * @param tagIds - Array of selected tag IDs
   */
  const handleTagsChange = async (tagIds: string[]) => {
    setSelectedTagIds(tagIds)
  }

  /**
   * Handle form submission with validated data
   * Creates new task upon successful validation
   *
   * @author Thang Truong
   * @date 2025-11-25
   * @param data - Form data containing task information
   */
  const onSubmit = async (data: CreateTaskFormData) => {
    setError('')

    try {
      await createTask({
        variables: {
          input: {
            title: data.title.trim(),
            description: data.description.trim(),
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate || null,
            projectId: data.projectId,
            assignedTo: data.assignedTo || null,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : null,
          },
        },
      })

      await showToast('Task created successfully', 'success', 7000)
      reset()
      setSelectedTagIds([])
      await onSuccess()
      onClose()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task. Please try again.'
      setError(errorMessage)
    }
  }

  /**
   * Handle modal close
   * Resets form data and state
   *
   * @author Thang Truong
   * @date 2025-11-25
   */
  const handleClose = () => {
    reset()
    setError('')
    setSelectedTagIds([])
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const projects = projectsData?.projects || []
  const users = usersData?.users || []
  const tags = tagsData?.tags || []

  return (
    /* Create Task Modal Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <CreateTaskFormFields
            register={register}
            errors={errors}
            projects={projects}
            users={users}
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagsChange={handleTagsChange}
          />

          {/* Error Message Display */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
