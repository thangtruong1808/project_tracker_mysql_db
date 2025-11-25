/**
 * CreateActivityLogModal Component
 * Modal dialog for creating new activity log entries
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { CREATE_ACTIVITY_MUTATION } from '../graphql/mutations'
import { ACTIVITIES_QUERY, USERS_QUERY, PROJECTS_QUERY, TASKS_QUERY } from '../graphql/queries'
import CreateActivityLogFormFields from './CreateActivityLogFormFields'

interface CreateActivityLogModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateActivityLogFormData {
  userId: string
  targetUserId: string
  projectId: string
  taskId: string
  action: string
  type: string
  metadata: string
}

const CreateActivityLogModal = ({ isOpen, onClose, onSuccess }: CreateActivityLogModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')

  const { data: usersData } = useQuery<{ users: Array<{ id: string; firstName: string; lastName: string }> }>(USERS_QUERY, {
    skip: !isOpen,
  })
  const { data: projectsData } = useQuery<{ projects: Array<{ id: string; name: string }> }>(PROJECTS_QUERY, {
    skip: !isOpen,
  })
  const { data: tasksData } = useQuery<{ tasks: Array<{ id: string; title: string }> }>(TASKS_QUERY, {
    skip: !isOpen,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateActivityLogFormData>({
    mode: 'onBlur',
    defaultValues: {
      userId: '',
      targetUserId: '',
      projectId: '',
      taskId: '',
      action: '',
      type: '',
      metadata: '',
    },
  })

  const [createActivity] = useMutation(CREATE_ACTIVITY_MUTATION, {
    refetchQueries: [{ query: ACTIVITIES_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to create activity log. Please try again.')
    },
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
      setError('')
    }
  }, [isOpen, reset])

  const onSubmit = async (data: CreateActivityLogFormData) => {
    setError('')
    try {
      await createActivity({
        variables: {
          input: {
            userId: data.userId,
            targetUserId: data.targetUserId || null,
            projectId: data.projectId || null,
            taskId: data.taskId || null,
            action: data.action || null,
            type: data.type,
            metadata: data.metadata || null,
          },
        },
      })
      await showToast('Activity log created successfully', 'success', 7000)
      reset()
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create activity log. Please try again.'
      setError(errorMessage)
    }
  }

  const handleClose = () => {
    reset()
    setError('')
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const users = usersData?.users || []
  const projects = projectsData?.projects || []
  const tasks = tasksData?.tasks || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Activity Log</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <CreateActivityLogFormFields register={register} errors={errors} users={users} projects={projects} tasks={tasks} />

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
              {isSubmitting ? 'Creating...' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateActivityLogModal

