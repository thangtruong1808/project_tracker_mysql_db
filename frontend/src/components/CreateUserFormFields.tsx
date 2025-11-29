/**
 * CreateUserFormFields Component
 * Form fields for creating a new user with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form'
import PasswordFieldWithToggle from './PasswordFieldWithToggle'
import { USER_ROLES } from './EditUserFormFields'

interface CreateUserFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

interface CreateUserFormFieldsProps {
  register: UseFormRegister<CreateUserFormData>
  errors: FieldErrors<CreateUserFormData>
  watch: UseFormWatch<CreateUserFormData>
  showPassword: boolean
  showConfirmPassword: boolean
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
}

/**
 * CreateUserFormFields Component
 * Renders form fields for creating a new user with validation
 *
 * @param register - react-hook-form register function
 * @param errors - Form validation errors
 * @param watch - react-hook-form watch function
 * @param showPassword - Whether password is visible
 * @param showConfirmPassword - Whether confirm password is visible
 * @param onTogglePassword - Callback to toggle password visibility
 * @param onToggleConfirmPassword - Callback to toggle confirm password visibility
 * @returns JSX element containing form fields
 */
const CreateUserFormFields = ({
  register,
  errors,
  watch,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
}: CreateUserFormFieldsProps) => {
  /**
   * Watch password field for confirmation validation
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const password = watch('password')

  return (
    /* Form fields container for user creation */
    <div className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="John"
            className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.firstName
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
            })}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Doe"
            className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.lastName
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
            })}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.email
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <PasswordFieldWithToggle
        id="password"
        label="Password"
        placeholder="At least 6 characters"
        showPassword={showPassword}
        error={errors.password?.message}
        onToggle={onTogglePassword}
        register={register}
        validationRules={{
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        }}
      />

      {/* Confirm Password Field */}
      <PasswordFieldWithToggle
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        showPassword={showConfirmPassword}
        error={errors.confirmPassword?.message}
        onToggle={onToggleConfirmPassword}
        register={register}
        validationRules={{
          required: 'Please confirm your password',
          validate: (value: string) => value === password || 'Passwords do not match',
        }}
      />

      {/* Role Field */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          {...register('role')}
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default CreateUserFormFields

