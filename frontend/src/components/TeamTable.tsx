/**
 * TeamTable Component
 * Desktop/tablet/mobile table for project team members
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import TeamTableMobile from './TeamTableMobile'
import TeamTableTablet from './TeamTableTablet'
import TeamTableLoading from './TeamTableLoading'
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
  rowNumber?: number
}

type SortField = 'projectId' | 'userId' | 'projectName' | 'memberName' | 'memberEmail' | 'role' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

interface TeamTableProps {
  members: TeamMember[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (teamMemberId: string) => void
  onDelete: (teamMemberId: string) => void
  isLoading?: boolean
}

const TeamTable = ({ members, sortField, sortDirection, onSort, onEdit, onDelete, isLoading = false }: TeamTableProps) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
        </svg>
      )
    }
    return sortDirection === 'ASC' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (isLoading) {
    return <TeamTableLoading />
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
        </svg>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No team members found</h3>
        <p className="text-sm sm:text-base text-gray-600">Add users to project teams to see them here.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                ['id', 'ID'],
                ['projectId', 'Project ID'],
                ['userId', 'User ID'],
                ['memberName', 'Member'],
                ['memberEmail', 'Email'],
                ['projectName', 'Project'],
                ['role', 'Role'],
                ['createdAt', 'Added'],
                ['updatedAt', 'Updated'],
              ].map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => field !== 'id' && onSort(field as SortField)}
                  className={`px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${field !== 'id' ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {field !== 'id' && getSortIcon(field as SortField)}
                  </div>
                </th>
              ))}
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-100 transition-colors">
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.rowNumber || ''}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.projectId}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.userId}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.memberName}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.memberEmail}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.projectName}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getRoleBadge(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateToMelbourne(member.createdAt)}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateToMelbourne(member.updatedAt)}</td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
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

      <div className="hidden md:block lg:hidden">
        <TeamTableTablet
          members={members}
          sortField={sortField as 'projectId' | 'userId' | 'projectName' | 'memberName' | 'memberEmail' | 'role'}
          sortDirection={sortDirection}
          onSort={onSort as (field: 'projectId' | 'userId' | 'projectName' | 'memberName' | 'memberEmail' | 'role') => void}
          onEdit={onEdit}
          onDelete={onDelete}
          getSortIcon={getSortIcon as (field: 'projectId' | 'userId' | 'projectName' | 'memberName' | 'memberEmail' | 'role') => JSX.Element}
        />
      </div>

      <div className="md:hidden">
        <TeamTableMobile members={members} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default TeamTable

