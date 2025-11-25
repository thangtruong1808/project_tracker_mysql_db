/**
 * Team Page
 * Displays project team members with search, sorting, pagination, and CRUD
 *
 * @author Thang Truong
 * @date 2024-12-24
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
}

type SortField = 'projectName' | 'memberName' | 'memberEmail' | 'role' | 'createdAt' | 'updatedAt'
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (error) {
      showToast('Failed to load team members. Please try again later.', 'error', 5000)
    }
  }, [error, showToast])

  useEffect(() => {
    refetch().catch(() => undefined)
  }, [refetch])

  const filteredMembers = useMemo(() => {
    const members = data?.teamMembers || []
    const term = debouncedSearchTerm.trim().toLowerCase()
    const filtered = term
      ? members.filter((member) => {
        return (
          member.memberName.toLowerCase().includes(term) ||
          member.memberEmail.toLowerCase().includes(term) ||
          member.projectName.toLowerCase().includes(term) ||
          member.role.toLowerCase().includes(term)
        )
      })
      : members

    const sorted = [...filtered].sort((a, b) => {
      const getValue = (member: TeamMember, field: SortField) => {
        if (field === 'createdAt' || field === 'updatedAt') {
          return new Date(member[field]).getTime()
        }
        return member[field].toLowerCase()
      }
      const aValue = getValue(a, sortField)
      const bValue = getValue(b, sortField)
      if (aValue === bValue) {
        return 0
      }
      return sortDirection === 'ASC' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })
    return sorted
  }, [data?.teamMembers, debouncedSearchTerm, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / entriesPerPage))
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
      } else {
        setSortField(field)
        setSortDirection('ASC')
      }
    },
    [sortField]
  )

  const handleEdit = useCallback(
    (teamMemberId: string) => {
      const member = filteredMembers.find((item) => item.id === teamMemberId)
      if (member) {
        setSelectedMember(member)
        setIsEditModalOpen(true)
      }
    },
    [filteredMembers]
  )

  const handleDelete = useCallback(
    (teamMemberId: string) => {
      const member = filteredMembers.find((item) => item.id === teamMemberId)
      if (member) {
        setSelectedMember(member)
        setIsDeleteDialogOpen(true)
      }
    },
    [filteredMembers]
  )

  const handleSuccess = useCallback(() => {
    setSelectedMember(null)
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
  }, [])

  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Manage every teammate across all projects with the same search, sort, and pagination UX used elsewhere. Keep project staffing organized and
          transparent.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <TeamSearchInput value={searchTerm} onChange={setSearchTerm} onClear={handleClearSearch} />
      </div>

      <TeamTable
        members={paginatedMembers}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {!loading && (
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
        />
      )}

      <CreateTeamMemberModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleSuccess} />

      <EditTeamMemberModal
        member={selectedMember}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMember(null)
        }}
        onSuccess={handleSuccess}
      />

      <DeleteTeamMemberDialog
        member={
          selectedMember
            ? {
              id: selectedMember.id,
              projectId: selectedMember.projectId,
              userId: selectedMember.userId,
              memberName: selectedMember.memberName,
              projectName: selectedMember.projectName,
              role: selectedMember.role,
            }
            : null
        }
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedMember(null)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Team

