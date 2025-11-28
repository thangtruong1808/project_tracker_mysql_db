/**
 * Team Page
 * Displays project team members with search, sorting, pagination, and CRUD
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { TEAM_MEMBERS_QUERY } from '../graphql/queries'
import TeamTable from '../components/TeamTable'
import TeamSearchInput from '../components/TeamSearchInput'
import TeamPagination from '../components/TeamPagination'
import CreateTeamMemberModal from '../components/CreateTeamMemberModal'
import EditTeamMemberModal from '../components/EditTeamMemberModal'
import DeleteTeamMemberDialog from '../components/DeleteTeamMemberDialog'

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

const Team = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('projectName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data, loading, error, refetch } = useQuery<{ teamMembers: TeamMember[] }>(TEAM_MEMBERS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  /** Debounce search term to improve performance - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  /** Handle GraphQL query errors - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const handleError = async (): Promise<void> => {
      if (error) {
        await showToast('Failed to load team members. Please try again later.', 'error', 7000)
      }
    }
    handleError()
  }, [error, showToast])

  /** Initial data load - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await refetch()
      } catch {
        // Error handled by error effect
      }
    }
    loadData()
  }, [refetch])

  /** Filter and sort team members - @author Thang Truong @date 2025-11-27 */
  const filteredMembers = useMemo(() => {
    const members = data?.teamMembers || []
    const term = debouncedSearchTerm.trim().toLowerCase()
    const filtered = term
      ? members.filter((m) =>
          m.memberName.toLowerCase().includes(term) ||
          m.memberEmail.toLowerCase().includes(term) ||
          m.projectName.toLowerCase().includes(term) ||
          m.role.toLowerCase().includes(term)
        )
      : members
    const getValue = (m: TeamMember, f: SortField) => {
      if (f === 'projectId' || f === 'userId') return Number(m[f])
      if (f === 'createdAt' || f === 'updatedAt') return new Date(m[f]).getTime()
      return m[f].toLowerCase()
    }
    return [...filtered].sort((a, b) => {
      const aVal = getValue(a, sortField)
      const bVal = getValue(b, sortField)
      if (aVal === bVal) return 0
      return sortDirection === 'ASC' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
  }, [data?.teamMembers, debouncedSearchTerm, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / entriesPerPage))
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex).map((member, index) => ({
    ...member,
    rowNumber: startIndex + index + 1,
  }))

  /** Handle column sorting - @author Thang Truong @date 2025-11-27 */
  const handleSort = useCallback(
    async (field: SortField): Promise<void> => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
      } else {
        setSortField(field)
        setSortDirection('ASC')
      }
    },
    [sortField]
  )

  /** Handle edit team member action - @author Thang Truong @date 2025-11-27 */
  const handleEdit = useCallback(
    async (teamMemberId: string): Promise<void> => {
      const member = filteredMembers.find((item) => item.id === teamMemberId)
      if (member) {
        setSelectedMember(member)
        setIsEditModalOpen(true)
      }
    },
    [filteredMembers]
  )

  /** Handle delete team member action - @author Thang Truong @date 2025-11-27 */
  const handleDelete = useCallback(
    async (teamMemberId: string): Promise<void> => {
      const member = filteredMembers.find((item) => item.id === teamMemberId)
      if (member) {
        setSelectedMember(member)
        setIsDeleteDialogOpen(true)
      }
    },
    [filteredMembers]
  )

  /** Handle successful CRUD operation - @author Thang Truong @date 2025-11-27 */
  const handleSuccess = useCallback(async (): Promise<void> => {
    setSelectedMember(null)
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    await refetch()
  }, [refetch])

  /** Handle clear search action - @author Thang Truong @date 2025-11-27 */
  const handleClearSearch = useCallback(async (): Promise<void> => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  /** Close modals - @author Thang Truong @date 2025-11-27 */
  const closeCreateModal = useCallback(async (): Promise<void> => setIsCreateModalOpen(false), [])
  const closeEditModal = useCallback(async (): Promise<void> => { setIsEditModalOpen(false); setSelectedMember(null) }, [])
  const closeDeleteDialog = useCallback(async (): Promise<void> => { setIsDeleteDialogOpen(false); setSelectedMember(null) }, [])

  return (
    /* Team page container */
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header Section with Description and Create Button */}
      {loading ? (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 max-w-md"></div>
          <div className="h-10 bg-blue-200 rounded-lg w-32"></div>
        </div>
      ) : (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Manage teammates across all projects with search, sort, and pagination.</p>
          <button
            onClick={async () => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Add team member"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Team Member</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <TeamSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={handleClearSearch}
          isLoading={loading}
        />
      </div>

      {/* Team Members Data Table */}
      <TeamTable
        members={paginatedMembers}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
      <TeamPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={filteredMembers.length}
        startIndex={startIndex}
        endIndex={endIndex}
        entriesPerPage={entriesPerPage}
        onPageChange={setCurrentPage}
        onEntriesPerPageChange={(value) => {
          setEntriesPerPage(value)
          setCurrentPage(1)
        }}
        isLoading={loading}
      />

      {/* Modals */}
      <CreateTeamMemberModal isOpen={isCreateModalOpen} onClose={closeCreateModal} onSuccess={handleSuccess} />
      <EditTeamMemberModal member={selectedMember} isOpen={isEditModalOpen} onClose={closeEditModal} onSuccess={handleSuccess} />
      <DeleteTeamMemberDialog member={selectedMember ? { id: selectedMember.id, projectId: selectedMember.projectId, userId: selectedMember.userId, memberName: selectedMember.memberName, projectName: selectedMember.projectName, role: selectedMember.role } : null} isOpen={isDeleteDialogOpen} onClose={closeDeleteDialog} onSuccess={handleSuccess} />
    </div>
  )
}

export default Team
