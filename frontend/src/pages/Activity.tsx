/**
 * Activity Page
 * Manages activity logs with search, sorting, pagination, and CRUD operations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { ACTIVITIES_QUERY } from '../graphql/queries'
import ActivityLogsTable from '../components/ActivityLogsTable'
import ActivityLogsSearchInput from '../components/ActivityLogsSearchInput'
import ActivityLogsPagination from '../components/ActivityLogsPagination'
import CreateActivityLogModal from '../components/CreateActivityLogModal'
import EditActivityLogModal from '../components/EditActivityLogModal'
import DeleteActivityLogDialog from '../components/DeleteActivityLogDialog'

interface ActivityLog {
  id: string
  userId: string
  targetUserId: string | null
  projectId: string | null
  taskId: string | null
  action: string | null
  type: string
  metadata: string | null
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'userId' | 'targetUserId' | 'projectId' | 'taskId' | 'action' | 'type' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

const Activity = () => {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(5)
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data, loading, error, refetch } = useQuery<{ activities: ActivityLog[] }>(ACTIVITIES_QUERY, {
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
      showToast('Failed to load activity logs. Please try again later.', 'error', 7000)
    }
  }, [error, showToast])

  useEffect(() => {
    refetch().catch(() => undefined)
  }, [refetch])

  const filteredActivities = useMemo(() => {
    const activities = data?.activities || []
    const term = debouncedSearchTerm.trim().toLowerCase()
    const filtered = term
      ? activities.filter((activity) => {
        const metadataText = activity.metadata ? activity.metadata.toLowerCase() : ''
        return (
          activity.userId.toLowerCase().includes(term) ||
          (activity.targetUserId || '').toLowerCase().includes(term) ||
          (activity.projectId || '').toLowerCase().includes(term) ||
          (activity.taskId || '').toLowerCase().includes(term) ||
          (activity.action || '').toLowerCase().includes(term) ||
          activity.type.toLowerCase().includes(term) ||
          metadataText.includes(term)
        )
      })
      : activities
    const sorted = [...filtered].sort((a, b) => {
      const getValue = (activity: ActivityLog, field: SortField) => {
        switch (field) {
          case 'id':
            return Number(activity.id)
          case 'createdAt':
          case 'updatedAt':
            return new Date(activity[field]).getTime()
          default:
            return (activity[field] || '').toString().toLowerCase()
        }
      }
      const aValue = getValue(a, sortField)
      const bValue = getValue(b, sortField)
      if (aValue === bValue) return 0
      return sortDirection === 'ASC' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })
    return sorted
  }, [data?.activities, debouncedSearchTerm, sortField, sortDirection])

  const totalPages = Math.ceil(filteredActivities.length / entriesPerPage) || 1
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

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

  const handleEdit = useCallback((activityId: string) => {
    const activity = filteredActivities.find((item) => item.id === activityId)
    if (activity) {
      setSelectedActivity(activity)
      setIsEditModalOpen(true)
    }
  }, [filteredActivities])

  const handleDelete = useCallback((activityId: string) => {
    const activity = filteredActivities.find((item) => item.id === activityId)
    if (activity) {
      setSelectedActivity(activity)
      setIsDeleteDialogOpen(true)
    }
  }, [filteredActivities])

  const handleSuccess = useCallback(() => {
    setSelectedActivity(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
  }, [])

  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Review every user, project, and task change in one place. Search, sort, and audit activity logs faster with the same UX you use on other data tables.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Activity</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <ActivityLogsSearchInput value={searchTerm} onChange={setSearchTerm} onClear={handleClearSearch} />
      </div>

      <ActivityLogsTable
        activities={paginatedActivities}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {!loading && (
        <ActivityLogsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={filteredActivities.length}
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

      <CreateActivityLogModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleSuccess} />

      <EditActivityLogModal
        activity={selectedActivity}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedActivity(null)
        }}
        onSuccess={handleSuccess}
      />

      <DeleteActivityLogDialog
        activity={
          selectedActivity
            ? { id: selectedActivity.id, userId: selectedActivity.userId, action: selectedActivity.action, type: selectedActivity.type }
            : null
        }
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedActivity(null)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Activity

