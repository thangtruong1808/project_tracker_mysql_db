/**
 * TeamTableTablet Component
 * Tablet layout for team members table
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { getRoleBadge, getRoleLabel } from '../utils/teamUtils'

interface TeamMember {
  id: string
  projectId: string
  userId: string
  projectName: string
  memberName: string
  memberEmail: string
  role: string
  rowNumber?: number
}

type SortField = 'projectId' | 'userId' | 'projectName' | 'memberName' | 'memberEmail' | 'role'
type SortDirection = 'ASC' | 'DESC'

interface TeamTableTabletProps {
  members: TeamMember[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (teamMemberId: string) => void
  onDelete: (teamMemberId: string) => void
  getSortIcon: (field: SortField) => JSX.Element
}

const TeamTableTablet = ({ members, sortField: _sortField, sortDirection: _sortDirection, onSort, onEdit, onDelete, getSortIcon }: TeamTableTabletProps) => {
  return (
    /* Tablet table container */
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th
              onClick={() => onSort('projectId')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Project ID
                {getSortIcon('projectId')}
              </div>
            </th>
            <th
              onClick={() => onSort('userId')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                User ID
                {getSortIcon('userId')}
              </div>
            </th>
            <th
              onClick={() => onSort('memberName')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Member
                {getSortIcon('memberName')}
              </div>
            </th>
            <th
              onClick={() => onSort('memberEmail')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Email
                {getSortIcon('memberEmail')}
              </div>
            </th>
            <th
              onClick={() => onSort('projectName')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Project
                {getSortIcon('projectName')}
              </div>
            </th>
            <th
              onClick={() => onSort('role')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Role
                {getSortIcon('role')}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.rowNumber || ''}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{member.projectId}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{member.userId}</td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">{member.memberName}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">{member.memberEmail}</td>
              <td className="px-4 py-4 text-sm text-gray-700">{member.projectName}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getRoleBadge(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(member.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                    aria-label="Edit team member"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(member.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                    aria-label="Delete team member"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TeamTableTablet

