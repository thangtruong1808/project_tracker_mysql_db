/**
 * ProjectsFilter Component
 * Provides compact filtering options for projects by status and date range
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'

interface ProjectsFilterProps {
  selectedStatuses: string[]
  dateFrom: string
  dateTo: string
  onStatusChange: (statuses: string[]) => Promise<void>
  onDateFromChange: (date: string) => Promise<void>
  onDateToChange: (date: string) => Promise<void>
  onClearFilters: () => Promise<void>
}

const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']

/**
 * ProjectsFilter Component
 * Renders compact filter controls for status and date range
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsFilter = ({
  selectedStatuses,
  dateFrom,
  dateTo,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters
}: ProjectsFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  /**
   * Handle status checkbox change
   * Updates selected statuses array based on checkbox state
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param status - Status value to toggle
   * @param checked - Whether checkbox is checked
   */
  const handleStatusChange = async (status: string, checked: boolean): Promise<void> => {
    if (checked) {
      await onStatusChange([...selectedStatuses, status])
    } else {
      await onStatusChange(selectedStatuses.filter(s => s !== status))
    }
  }

  /**
   * Handle date from input change
   * Updates date from value
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param value - Date from value
   */
  const handleDateFromChange = async (value: string): Promise<void> => {
    await onDateFromChange(value)
  }

  /**
   * Handle date to input change
   * Updates date to value
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param value - Date to value
   */
  const handleDateToChange = async (value: string): Promise<void> => {
    await onDateToChange(value)
  }

  /**
   * Check if any filters are active
   * Determines if clear button should be shown
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const hasActiveFilters = selectedStatuses.length > 0 || dateFrom || dateTo

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {selectedStatuses.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_STATUSES.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={(e) => handleStatusChange(status, e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{status.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => handleDateFromChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => handleDateToChange(e.target.value)}
                      min={dateFrom || undefined}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectsFilter
