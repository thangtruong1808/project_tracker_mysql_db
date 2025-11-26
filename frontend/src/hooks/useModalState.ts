/**
 * useModalState Custom Hook
 * Generic hook for managing modal state (edit, delete, create)
 * Reduces code duplication across pages with CRUD operations
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useState, useCallback } from 'react'

interface UseModalStateResult<T> {
  selectedItem: T | null
  isEditModalOpen: boolean
  isDeleteDialogOpen: boolean
  isCreateModalOpen: boolean
  openEditModal: (item: T) => void
  openDeleteDialog: (item: T) => void
  openCreateModal: () => void
  closeEditModal: () => void
  closeDeleteDialog: () => void
  closeCreateModal: () => void
  handleSuccess: () => void
}

/**
 * Custom hook for managing modal states in CRUD pages
 * Handles edit, delete, and create modal visibility
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns Object containing modal state and handler functions
 */
export function useModalState<T>(): UseModalStateResult<T> {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Open edit modal with selected item
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const openEditModal = useCallback((item: T) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }, [])

  /**
   * Open delete dialog with selected item
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const openDeleteDialog = useCallback((item: T) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }, [])

  /**
   * Open create modal
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  /**
   * Close edit modal and clear selected item
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setSelectedItem(null)
  }, [])

  /**
   * Close delete dialog and clear selected item
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setSelectedItem(null)
  }, [])

  /**
   * Close create modal
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  /**
   * Handle successful CRUD operation
   * Closes all modals and clears selected item
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleSuccess = useCallback(() => {
    setSelectedItem(null)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
    setIsCreateModalOpen(false)
  }, [])

  return {
    selectedItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    isCreateModalOpen,
    openEditModal,
    openDeleteDialog,
    openCreateModal,
    closeEditModal,
    closeDeleteDialog,
    closeCreateModal,
    handleSuccess,
  }
}

