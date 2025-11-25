/**
 * TeamTableMobile Component
 * Mobile-friendly cards for displaying team members
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { formatDateToMelbourne, getRoleBadge, getRoleLabel } from '../utils/teamUtils'

interface TeamMember {
  id: string
  projectId: string
  projectName: string
  userId: string
  memberName: string
  memberEmail: string
  role: string
  createdAt: string
  updatedAt: string
}

interface TeamTableMobileProps {
  members: TeamMember[]
  onEdit: (teamMemberId: string) => void
  onDelete: (teamMemberId: string) => void
}

const TeamTableMobile = ({ members, onEdit, onDelete }: TeamTableMobileProps) => {
  return (
    <div className="space-y-3 p-3">
      {members.map((member) => (
        <div key={member.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{member.memberName}</p>
              <p className="text-xs text-gray-600">{member.memberEmail}</p>
              <p className="text-xs text-gray-600 mt-1">
                Project: <span className="font-medium">{member.projectName}</span>
              </p>
            </div>
            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getRoleBadge(member.role)} flex-shrink-0`}>
              {getRoleLabel(member.role)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-3 space-y-1">
            <p>Joined: {formatDateToMelbourne(member.createdAt)}</p>
            <p>Updated: {formatDateToMelbourne(member.updatedAt)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onEdit(member.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Edit team member"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(member.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Delete team member"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TeamTableMobile

