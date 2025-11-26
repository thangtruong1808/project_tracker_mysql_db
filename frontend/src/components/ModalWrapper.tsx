/**
 * ModalWrapper Component
 * Reusable modal container with overlay and standard layout
 * Reduces code duplication across modal components
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import React from 'react'

interface ModalWrapperProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

/**
 * ModalWrapper Component
 * Renders a modal overlay with header and close button
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param isOpen - Whether the modal is visible
 * @param title - Modal header title
 * @param onClose - Callback when modal is closed
 * @param children - Modal content
 * @param maxWidth - Optional max width class (default: max-w-2xl)
 * @returns JSX element containing modal wrapper
 */
const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  title,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) {
    return null
  }

  return (
    /* Modal Overlay Container */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Modal Content Box */}
      <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header with Title and Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default ModalWrapper

