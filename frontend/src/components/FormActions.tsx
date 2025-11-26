/**
 * FormActions Component
 * Renders form action buttons (Cancel and Submit)
 * Reusable across all form components
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import React from 'react'

interface FormActionsProps {
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
  submittingLabel: string
}

/**
 * FormActions Component
 * Renders Cancel and Submit buttons for forms
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param onCancel - Callback when cancel button is clicked
 * @param isSubmitting - Whether form is currently submitting
 * @param submitLabel - Label for submit button
 * @param submittingLabel - Label while form is submitting
 * @returns JSX element containing form action buttons
 */
const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isSubmitting,
  submitLabel,
  submittingLabel,
}) => {
  return (
    /* Form Action Buttons Container */
    <div className="flex gap-3 pt-4">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Cancel
      </button>
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </div>
  )
}

export default FormActions

