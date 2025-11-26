/**
 * FormErrorMessage Component
 * Displays form error messages in a styled alert box
 * Reusable across all form components
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import React from 'react'

interface FormErrorMessageProps {
  message: string
}

/**
 * FormErrorMessage Component
 * Renders an error message in a styled red alert box
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param message - Error message to display
 * @returns JSX element containing error alert or null if no message
 */
const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
  if (!message) {
    return null
  }

  return (
    /* Error Alert Container */
    <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
      <div className="flex">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {/* Error Message Text */}
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default FormErrorMessage

