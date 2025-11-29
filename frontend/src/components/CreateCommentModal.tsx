/**
 * CreateCommentModal Component
 * Modal dialog for creating a new comment with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { CREATE_COMMENT_MUTATION } from '../graphql/mutations'
import { COMMENTS_QUERY, PROJECTS_QUERY } from '../graphql/queries'
import ModalWrapper from './ModalWrapper'
import FormErrorMessage from './FormErrorMessage'
import FormActions from './FormActions'

interface CreateCommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateCommentFormData {
  projectId: string
  content: string
}

/**
 * CreateCommentModal Component
 * Renders a modal form for creating a new comment with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when comment is successfully created
 * @returns JSX element containing create comment modal
 */
const CreateCommentModal = ({ isOpen, onClose, onSuccess }: CreateCommentModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')

  /**
   * Fetch projects for dropdown
   * @author Thang Truong
   * @date 2025-11-27
   */
  const { data: projectsData } = useQuery<{ projects: Array<{ id: string; name: string }> }>(
    PROJECTS_QUERY,
    { skip: !isOpen }
  )

  /**
   * Initialize react-hook-form with validation rules
   * @author Thang Truong
   * @date 2025-11-27
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCommentFormData>({
    mode: 'onBlur',
    defaultValues: {
      projectId: '',
      content: '',
    },
  })

  /**
   * Create comment mutation
   * Refetches comments list after successful creation
   * @author Thang Truong
   * @date 2025-11-27
   */
  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: COMMENTS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to create comment. Please try again.')
    },
  })

  /**
   * Reset form when modal closes
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    if (!isOpen) {
      reset()
      setError('')
    }
  }, [isOpen, reset])

  /**
   * Handle form submission with validated data
   * Creates new comment upon successful validation
   * @author Thang Truong
   * @date 2025-11-27
   * @param data - Form data containing projectId and content
   */
  const onSubmit = async (data: CreateCommentFormData): Promise<void> => {
    setError('')

    try {
      await createComment({
        variables: {
          projectId: data.projectId.trim(),
          content: data.content.trim(),
        },
      })

      await showToast('Comment created successfully', 'success', 5000)
      onSuccess()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comment. Please try again.'
      await showToast(errorMessage, 'error', 5000)
    }
  }

  return (
    /* Create Comment Modal */
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Create Comment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Project Field */}
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            id="projectId"
            className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.projectId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('projectId', { required: 'Project is required' })}
          >
            <option value="">Select a project</option>
            {projectsData?.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.projectId.message}
            </p>
          )}
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={4}
            className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.content ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('content', {
              required: 'Content is required',
              minLength: { value: 1, message: 'Content cannot be empty' },
            })}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        <FormErrorMessage message={error} />

        {/* Form Actions */}
        <FormActions
          onCancel={onClose}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          submitLabel="Create Comment"
        />
      </form>
    </ModalWrapper>
  )
}

export default CreateCommentModal

