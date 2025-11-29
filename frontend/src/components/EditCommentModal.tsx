/**
 * EditCommentModal Component
 * Modal dialog for editing comment content with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { UPDATE_COMMENT_MUTATION } from '../graphql/mutations'
import { COMMENTS_QUERY } from '../graphql/queries'
import ModalWrapper from './ModalWrapper'
import FormErrorMessage from './FormErrorMessage'
import FormActions from './FormActions'

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

interface EditCommentModalProps {
  comment: Comment | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditCommentFormData {
  content: string
}

/**
 * EditCommentModal Component
 * Renders a modal form for editing comment content with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @param comment - Comment object to edit (null when closed)
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when comment is successfully updated
 * @returns JSX element containing edit comment modal
 */
const EditCommentModal = ({ comment, isOpen, onClose, onSuccess }: EditCommentModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')

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
  } = useForm<EditCommentFormData>({
    mode: 'onBlur',
    defaultValues: {
      content: '',
    },
  })

  /**
   * Update comment mutation
   * Refetches comments list after successful update
   * @author Thang Truong
   * @date 2025-11-27
   */
  const [updateComment] = useMutation(UPDATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: COMMENTS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to update comment. Please try again.')
    },
  })

  /**
   * Initialize form data when comment changes
   * @author Thang Truong
   * @date 2025-11-27
   */
  useEffect(() => {
    if (comment) {
      reset({
        content: comment.content,
      })
      setError('')
    }
  }, [comment, reset])

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
   * Updates comment content upon successful validation
   * @author Thang Truong
   * @date 2025-11-27
   * @param data - Form data containing content
   */
  const onSubmit = async (data: EditCommentFormData): Promise<void> => {
    if (!comment) return
    setError('')

    try {
      await updateComment({
        variables: {
          commentId: comment.id,
          content: data.content.trim(),
        },
      })

      await showToast('Comment updated successfully', 'success', 5000)
      onSuccess()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment. Please try again.'
      await showToast(errorMessage, 'error', 5000)
    }
  }

  return (
    /* Edit Comment Modal */
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Comment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          submitLabel="Update Comment"
        />
      </form>
    </ModalWrapper>
  )
}

export default EditCommentModal

