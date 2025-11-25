/**
 * CreateTeamMemberModal Component
 * Modal form for assigning a user to a project team
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { CREATE_TEAM_MEMBER_MUTATION } from '../graphql/mutations'
import { TEAM_MEMBERS_QUERY, PROJECTS_QUERY, USERS_QUERY } from '../graphql/queries'
import CreateTeamMemberFormFields from './CreateTeamMemberFormFields'

interface CreateTeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateTeamMemberFormData {
  projectId: string
  userId: string
  role: string
}

const CreateTeamMemberModal = ({ isOpen, onClose, onSuccess }: CreateTeamMemberModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')
  const { data: projectsData } = useQuery<{ projects: Array<{ id: string; name: string }> }>(PROJECTS_QUERY, { skip: !isOpen })
  const { data: usersData } = useQuery<{ users: Array<{ id: string; firstName: string; lastName: string; email: string }> }>(USERS_QUERY, {
    skip: !isOpen,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTeamMemberFormData>({
    mode: 'onBlur',
    defaultValues: {
      projectId: '',
      userId: '',
      role: 'VIEWER',
    },
  })

  const [createTeamMember] = useMutation(CREATE_TEAM_MEMBER_MUTATION, {
    refetchQueries: [{ query: TEAM_MEMBERS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => {
      setError(err.message || 'Failed to add team member. Please try again.')
    },
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
      setError('')
    }
  }, [isOpen, reset])

  const onSubmit = async (data: CreateTeamMemberFormData) => {
    setError('')
    try {
      await createTeamMember({
        variables: {
          input: {
            projectId: data.projectId,
            userId: data.userId,
            role: data.role,
          },
        },
      })
      await showToast('Team member added successfully', 'success', 7000)
      reset()
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add team member. Please try again.'
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

  const projects = projectsData?.projects || []
  const users = usersData?.users || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <CreateTeamMemberFormFields register={register} errors={errors} projects={projects} users={users} />

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
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTeamMemberModal

