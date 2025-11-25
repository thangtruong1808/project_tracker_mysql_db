/**
 * CreateNotificationFormFields Component
 * Form input fields for creating a new notification with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface CreateNotificationFormData {
  userId: string
  message: string
  isRead: boolean
}

interface CreateNotificationFormFieldsProps {
  register: UseFormRegister<CreateNotificationFormData>
  errors: FieldErrors<CreateNotificationFormData>
  users: Array<{ id: string; firstName: string; lastName: string }>
}

/**
 * CreateNotificationFormFields Component
 * Renders form input fields for notification creation with validation
 *
 * @param register - react-hook-form register function
 * @param errors - Form validation errors
 * @param users - Array of available users
 * @returns JSX element containing form fields
 */
const CreateNotificationFormFields = ({ register, errors, users }: CreateNotificationFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* User ID Field */}
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          User <span className="text-red-500">*</span>
        </label>
        <select
          id="userId"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.userId
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('userId', {
            required: 'User is required',
          })}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.userId.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Enter notification message"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
            errors.message
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('message', {
            required: 'Message is required',
            minLength: {
              value: 2,
              message: 'Message must be at least 2 characters',
            },
          })}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Is Read Field */}
      <div>
        <label htmlFor="isRead" className="block text-sm font-medium text-gray-700 mb-1">
          Read Status
        </label>
        <select
          id="isRead"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.isRead
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('isRead', {
            setValueAs: (value) => value === 'true',
          })}
        >
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        {errors.isRead && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.isRead.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default CreateNotificationFormFields

