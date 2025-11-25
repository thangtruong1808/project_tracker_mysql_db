/**
 * SearchDrawer Component
 * Provides a left-side drawer with quick search filters for projects and tasks.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */

import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']
const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

/**
 * SearchDrawer Component
 * Renders input, status filters, and search actions inside a drawer UI.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const SearchDrawer = ({ isOpen, onClose }: SearchDrawerProps) => {
  const [query, setQuery] = useState('')
  const [projectStatuses, setProjectStatuses] = useState<string[]>([])
  const [taskStatuses, setTaskStatuses] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()

  /**
   * Toggle a status value within the provided state setter.
   */
  const toggleStatus = (value: string, selected: string[], setSelected: (next: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value))
    } else {
      setSelected([...selected, value])
    }
  }

  /**
   * Clear the text query input.
   */
  const handleClearQuery = () => {
    setQuery('')
  }

  /**
   * Clear all project status selections.
   *
   * @author Thang Truong
   * @date 2025-11-24
   */
  const clearProjectStatuses = () => {
    setProjectStatuses([])
  }

  /**
   * Clear all task status selections.
   *
   * @author Thang Truong
   * @date 2025-11-24
   */
  const clearTaskStatuses = () => {
    setTaskStatuses([])
  }

  /**
   * Perform the search action asynchronously to satisfy UX requirements.
   *
   * @param event - Form submission event
   */
  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 120))
    const params = new URLSearchParams()
    if (query.trim()) {
      params.set('q', query.trim())
    }
    if (projectStatuses.length > 0) {
      params.set('projectStatuses', projectStatuses.join(','))
    }
    if (taskStatuses.length > 0) {
      params.set('taskStatuses', taskStatuses.join(','))
    }
    navigate(`/search-results?${params.toString()}`)
    setIsSearching(false)
    onClose()
  }

  const selectedFilters = useMemo(
    () => ({
      projects: projectStatuses.length,
      tasks: taskStatuses.length,
    }),
    [projectStatuses.length, taskStatuses.length]
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto p-6 animate-slide-in-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-500">Quick Search</p>
            <h2 className="text-2xl font-semibold text-gray-900">Find anything faster</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close search drawer"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-8">
          <div>
            <label htmlFor="globalSearch" className="text-sm font-medium text-gray-700">
              Keyword
            </label>
            <div className="mt-2 relative">
              <input
                id="globalSearch"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search projects and tasks names..."
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search input"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Project Status ({selectedFilters.projects})</p>
            <button
              type="button"
              onClick={clearProjectStatuses}
              className="text-xs text-blue-600 hover:text-blue-800 mb-2"
            >
              Clear all
            </button>
            <div className="space-y-2">
              {PROJECT_STATUSES.map((status) => (
                <label key={status} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={projectStatuses.includes(status)}
                    onChange={() => toggleStatus(status, projectStatuses, setProjectStatuses)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Task Status ({selectedFilters.tasks})</p>
            <button
              type="button"
              onClick={clearTaskStatuses}
              className="text-xs text-blue-600 hover:text-blue-800 mb-2"
            >
              Clear all
            </button>
            <div className="space-y-2">
              {TASK_STATUSES.map((status) => (
                <label key={status} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={taskStatuses.includes(status)}
                    onChange={() => toggleStatus(status, taskStatuses, setTaskStatuses)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <>
                <span className="inline-flex h-3 w-3 rounded-full bg-white animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </>
            )}
          </button>
        </form>

      </div>
      <div className="flex-1 bg-black bg-opacity-40" onClick={onClose} aria-hidden="true" />
    </div>
  )
}

export default SearchDrawer


