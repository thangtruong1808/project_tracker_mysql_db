/**
 * DeleteTeamMemberDialog Component
 * Confirmation dialog for removing a team member from a project
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_TEAM_MEMBER_MUTATION } from '../graphql/mutations'
import { TEAM_MEMBERS_QUERY } from '../graphql/queries'
import { getRoleLabel } from '../utils/teamUtils'

interface TeamMemberSummary {
  id: string
  projectId: string
  userId: string
  memberName: string
  projectName: string
  role: string
}

interface DeleteTeamMemberDialogProps {
  member: TeamMemberSummary | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DeleteTeamMemberDialog = ({ member, isOpen, onClose, onSuccess }: DeleteTeamMemberDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTeamMember] = useMutation(DELETE_TEAM_MEMBER_MUTATION, {
    refetchQueries: [{ query: TEAM_MEMBERS_QUERY }],
    awaitRefetchQueries: true,
  })

  const handleDelete = async () => {
    if (!member) return
    setIsDeleting(true)
    try {
      await deleteTeamMember({
        variables: {
          projectId: member.projectId,
          userId: member.userId,
        },
      })
      await showToast('Team member removed successfully', 'success', 7000)
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove team member. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !member) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Remove Team Member</h2>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-gray-700">Are you sure you want to remove this member from the project team?</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-medium text-gray-900">Member:</span> {member.memberName}
            </p>
            <p>
              <span className="font-medium text-gray-900">Project:</span> {member.projectName}
            </p>
            <p>
              <span className="font-medium text-gray-900">Role:</span> {getRoleLabel(member.role)}
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTeamMemberDialog

