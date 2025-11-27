/**
 * Activity Page
 * Manages activity logs with search, sorting, pagination, and CRUD operations
 *
 * @author Thang Truong
 * @date 2025-11-27
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
        await showToast('Failed to load activity logs. Please try again later.', 'error', 7000)
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

  /** Filter and sort activity logs - @author Thang Truong @date 2025-11-27 */
  const filteredActivities = useMemo(() => {
    const activities = data?.activities || []
    const term = debouncedSearchTerm.trim().toLowerCase()
    const filtered = term
      ? activities.filter((a) => {
          const meta = a.metadata ? a.metadata.toLowerCase() : ''
          return a.userId.toLowerCase().includes(term) || (a.targetUserId || '').toLowerCase().includes(term) || (a.projectId || '').toLowerCase().includes(term) || (a.taskId || '').toLowerCase().includes(term) || (a.action || '').toLowerCase().includes(term) || a.type.toLowerCase().includes(term) || meta.includes(term)
        })
      : activities
    const getValue = (a: ActivityLog, f: SortField) => f === 'id' ? Number(a.id) : f === 'createdAt' || f === 'updatedAt' ? new Date(a[f]).getTime() : (a[f] || '').toString().toLowerCase()
    return [...filtered].sort((a, b) => {
      const aVal = getValue(a, sortField)
      const bVal = getValue(b, sortField)
      if (aVal === bVal) return 0
      return sortDirection === 'ASC' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
  }, [data?.activities, debouncedSearchTerm, sortField, sortDirection])

  const totalPages = Math.ceil(filteredActivities.length / entriesPerPage) || 1
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

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

  /** Handle edit activity log action - @author Thang Truong @date 2025-11-27 */
  const handleEdit = useCallback(async (activityId: string): Promise<void> => {
    const activity = filteredActivities.find((item) => item.id === activityId)
    if (activity) {
      setSelectedActivity(activity)
      setIsEditModalOpen(true)
    }
  }, [filteredActivities])

  /** Handle delete activity log action - @author Thang Truong @date 2025-11-27 */
  const handleDelete = useCallback(async (activityId: string): Promise<void> => {
    const activity = filteredActivities.find((item) => item.id === activityId)
    if (activity) {
      setSelectedActivity(activity)
      setIsDeleteDialogOpen(true)
    }
  }, [filteredActivities])

  /** Handle successful CRUD operation - @author Thang Truong @date 2025-11-27 */
  const handleSuccess = useCallback(async (): Promise<void> => {
    setSelectedActivity(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
    await refetch()
  }, [refetch])

  /** Handle clear search action - @author Thang Truong @date 2025-11-27 */
  const handleClearSearch = useCallback(async (): Promise<void> => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  /** Close create modal - @author Thang Truong @date 2025-11-27 */
  const closeCreateModal = useCallback(async (): Promise<void> => setIsCreateModalOpen(false), [])
  /** Close edit modal - @author Thang Truong @date 2025-11-27 */
  const closeEditModal = useCallback(async (): Promise<void> => { setIsEditModalOpen(false); setSelectedActivity(null) }, [])
  /** Close delete dialog - @author Thang Truong @date 2025-11-27 */
  const closeDeleteDialog = useCallback(async (): Promise<void> => { setIsDeleteDialogOpen(false); setSelectedActivity(null) }, [])

  return (
    /* Activity page container */
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      {/* Header Section with Description and Create Button */}
      {loading ? (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 max-w-md"></div>
          <div className="h-10 bg-blue-200 rounded-lg w-32"></div>
        </div>
      ) : (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Review every user, project, and task change in one place. Search, sort, and audit activity logs faster with the same UX you use on other data tables.</p>
          <button
            onClick={async () => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            aria-label="Create activity log"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Activity</span>
          </button>
        </div>
      )}

      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <ActivityLogsSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={handleClearSearch}
          isLoading={loading}
        />
      </div>

      {/* Activity Logs Data Table */}
      <ActivityLogsTable
        activities={paginatedActivities}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

      {/* Pagination Controls */}
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
        isLoading={loading}
      />

      {/* Modals */}
      <CreateActivityLogModal isOpen={isCreateModalOpen} onClose={closeCreateModal} onSuccess={handleSuccess} />
      <EditActivityLogModal activity={selectedActivity} isOpen={isEditModalOpen} onClose={closeEditModal} onSuccess={handleSuccess} />
      <DeleteActivityLogDialog
        activity={selectedActivity ? { id: selectedActivity.id, userId: selectedActivity.userId, action: selectedActivity.action, type: selectedActivity.type } : null}
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default Activity

