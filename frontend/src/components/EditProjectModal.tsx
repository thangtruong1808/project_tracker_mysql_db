/**
 * EditProjectModal Component
 * Modal dialog for editing project information with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { UPDATE_PROJECT_MUTATION } from '../graphql/mutations'
import { PROJECTS_QUERY } from '../graphql/queries'
import EditProjectFormFields from './EditProjectFormFields'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface EditProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditProjectFormData {
  name: string
  description: string
  status: string
}

/**
 * EditProjectModal Component
 * Renders a modal form for editing project information with react-hook-form validation
 *
 * @param project - Project object to edit (null when closed)
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when project is successfully updated
 * @returns JSX element containing edit project modal
 */
const EditProjectModal = ({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')

  /**
   * Initialize react-hook-form with validation rules
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditProjectFormData>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
      status: 'PLANNING',
    },
  })

  /**
   * Update project mutation
   * Refetches projects list after successful update
   */
  const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION, {
    refetchQueries: [{ query: PROJECTS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to update project. Please try again.')
    },
  })

  /**
   * Initialize form data when project changes
   */
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
      })
    }
  }, [project, reset])

  /**
   * Handle form submission with validated data
   * Updates project information upon successful validation
   *
   * @param data - Form data containing name, description, and status
   */
  const onSubmit = async (data: EditProjectFormData) => {
    if (!project) return

    setError('') // Clear previous errors

    try {
      await updateProject({
        variables: {
          id: project.id,
          input: {
            name: data.name.trim(),
            description: data.description.trim() || null,
            status: data.status,
          },
        },
      })

      await showToast('Project updated successfully', 'success', 3000)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update project. Please try again.')
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

  if (!isOpen || !project) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
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
          <EditProjectFormFields register={register} errors={errors} />

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
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProjectModal

