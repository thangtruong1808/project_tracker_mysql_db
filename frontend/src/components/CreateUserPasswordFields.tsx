/**
 * CreateUserPasswordFields Component
 * Password input fields for creating a new user
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

interface CreateUserPasswordFieldsProps {
  password: string
  confirmPassword: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * CreateUserPasswordFields Component
 * Renders password and confirm password input fields
 *
 * @param password - Current password value
 * @param confirmPassword - Current confirm password value
 * @param onInputChange - Callback when input value changes
 * @returns JSX element containing password fields
 */
const CreateUserPasswordFields = ({
  password,
  confirmPassword,
  onInputChange,
}: CreateUserPasswordFieldsProps) => {
  return (
    <>
      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={onInputChange}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={onInputChange}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </>
  )
}

export default CreateUserPasswordFields

