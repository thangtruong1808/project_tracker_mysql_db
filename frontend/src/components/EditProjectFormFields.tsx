/**
 * EditProjectFormFields Component
 * Form input fields for editing project information with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface EditProjectFormData {
  name: string
  description: string
  status: string
}

interface EditProjectFormFieldsProps {
  register: UseFormRegister<EditProjectFormData>
  errors: FieldErrors<EditProjectFormData>
}

/**
 * Available project statuses
 */
const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']

/**
 * EditProjectFormFields Component
 * Renders form input fields for project editing with validation
 *
 * @param register - react-hook-form register function
 * @param errors - Form validation errors
 * @returns JSX element containing form fields
 */
const EditProjectFormFields = ({ register, errors }: EditProjectFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter project name"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.name
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('name', {
            required: 'Project name is required',
            minLength: {
              value: 2,
              message: 'Project name must be at least 2 characters',
            },
          })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Enter project description (optional)"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
            errors.description
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.status
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('status')}
        >
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'PLANNING' ? 'Planning' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.status.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default EditProjectFormFields

