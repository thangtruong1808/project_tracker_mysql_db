/**
 * CreateNotificationModal Component
 * Modal dialog for creating a new notification with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { CREATE_NOTIFICATION_MUTATION } from '../graphql/mutations'
import { NOTIFICATIONS_QUERY, USERS_QUERY } from '../graphql/queries'
import CreateNotificationFormFields from './CreateNotificationFormFields'

interface CreateNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateNotificationFormData {
  userId: string
  message: string
  isRead: boolean
}

/**
 * CreateNotificationModal Component
 * Renders a modal form for creating a new notification with react-hook-form validation
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when notification is successfully created
 * @returns JSX element containing create notification modal
 */
const CreateNotificationModal = ({ isOpen, onClose, onSuccess }: CreateNotificationModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')

  /**
   * Fetch users for dropdown
   */
  const { data: usersData } = useQuery<{ users: Array<{ id: string; firstName: string; lastName: string }> }>(USERS_QUERY, {
    skip: !isOpen,
  })

  /**
   * Initialize react-hook-form with validation rules
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateNotificationFormData>({
    mode: 'onBlur',
    defaultValues: {
      userId: '',
      message: '',
      isRead: false,
    },
  })

  /**
   * Create notification mutation
   * Refetches notifications list after successful creation
   */
  const [createNotification] = useMutation(CREATE_NOTIFICATION_MUTATION, {
    refetchQueries: [{ query: NOTIFICATIONS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to create notification. Please try again.')
    },
  })

  /**
   * Reset form when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      reset()
      setError('')
    }
  }, [isOpen, reset])

  /**
   * Handle form submission with validated data
   * Creates new notification upon successful validation
   *
   * @param data - Form data containing notification information
   */
  const onSubmit = async (data: CreateNotificationFormData) => {
    setError('')

    try {
      await createNotification({
        variables: {
          input: {
            userId: data.userId,
            message: data.message.trim(),
            isRead: data.isRead,
          },
        },
      })

      await showToast('Notification created successfully', 'success', 7000)
      reset()
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create notification. Please try again.'
      setError(errorMessage)
    }
  }

  /**
   * Handle modal close
   * Resets form data
   */
  const handleClose = () => {
    reset()
    setError('')
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const users = usersData?.users || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Notification</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <CreateNotificationFormFields register={register} errors={errors} users={users} />

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

          {/* Actions */}
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
              {isSubmitting ? 'Creating...' : 'Create Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateNotificationModal

