/**
 * usePageDataManager Custom Hook
 * Generic hook for managing page data with search, sort, and pagination
 * Reduces code duplication across list pages (Users, Tasks, Tags, etc.)
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useState, useEffect, useMemo, useCallback } from 'react'

interface UsePageDataManagerOptions<T, SortField extends string> {
  data: T[] | undefined
  defaultSortField: SortField
  searchFields: (keyof T)[]
  getFieldValue?: (item: T, field: SortField) => string | number | boolean
}

interface UsePageDataManagerResult<T, SortField extends string> {
  searchTerm: string
  setSearchTerm: (term: string) => void
  debouncedSearchTerm: string
  sortField: SortField
  sortDirection: 'ASC' | 'DESC'
  currentPage: number
  setCurrentPage: (page: number) => void
  entriesPerPage: number
  setEntriesPerPage: (entries: number) => void
  sortedData: T[]
  paginatedData: T[]
  totalPages: number
  startIndex: number
  endIndex: number
  handleSort: (field: SortField) => void
  handleClearSearch: () => void
}

/**
 * Custom hook for managing list page data operations
 * Handles search, sort, and pagination with debouncing
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param options - Configuration options for the data manager
 * @returns Object containing state and handlers for data management
 */
export function usePageDataManager<T extends Record<string, unknown>, SortField extends string>(
  options: UsePageDataManagerOptions<T, SortField>
): UsePageDataManagerResult<T, SortField> {
  const { data, defaultSortField, searchFields, getFieldValue } = options

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>(defaultSortField)
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  /**
   * Debounce search input with 500ms delay
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  /**
   * Filter and sort data based on search term and sort settings
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const sortedData = useMemo(() => {
    const items = data || []
    let filtered = items

    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = items.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return value && String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: string | number | boolean
      let bValue: string | number | boolean

      if (getFieldValue) {
        aValue = getFieldValue(a, sortField)
        bValue = getFieldValue(b, sortField)
      } else {
        aValue = (a[sortField as keyof T] as string | number | boolean) || ''
        bValue = (b[sortField as keyof T] as string | number | boolean) || ''
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      return sortDirection === 'ASC'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1
    })

    return sorted
  }, [data, debouncedSearchTerm, sortField, sortDirection, searchFields, getFieldValue])

  const totalPages = Math.ceil(sortedData.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  /**
   * Handle column header click for sorting
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortField(field)
      setSortDirection('ASC')
    }
  }, [sortField])

  /**
   * Clear search input and reset debounced value
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    sortedData,
    paginatedData,
    totalPages,
    startIndex,
    endIndex,
    handleSort,
    handleClearSearch,
  }
}

