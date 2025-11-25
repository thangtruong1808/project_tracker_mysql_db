/**
 * CreateUserBasicFields Component
 * Basic user information input fields for creating a new user
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

interface CreateUserBasicFieldsProps {
  firstName: string
  lastName: string
  email: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * CreateUserBasicFields Component
 * Renders basic user information input fields
 *
 * @param firstName - Current first name value
 * @param lastName - Current last name value
 * @param email - Current email value
 * @param onInputChange - Callback when input value changes
 * @returns JSX element containing basic user fields
 */
const CreateUserBasicFields = ({
  firstName,
  lastName,
  email,
  onInputChange,
}: CreateUserBasicFieldsProps) => {
  return (
    <>
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={firstName}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={lastName}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </>
  )
}

export default CreateUserBasicFields

