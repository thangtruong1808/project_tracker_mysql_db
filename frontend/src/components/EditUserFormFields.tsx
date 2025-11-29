/**
 * EditUserFormFields Component
 * Form input fields for editing user information
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

/**
 * Available user roles
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const USER_ROLES = [
  'Admin',
  'Project Manager',
  'Software Architect',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'DevOps Engineer',
  'QA Engineer',
  'QC Engineer',
  'UX/UI Designer',
  'Business Analyst',
  'Database Administrator',
  'Technical Writer',
  'Support Engineer',
]

interface EditUserFormFieldsProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

/**
 * EditUserFormFields Component
 * Renders form input fields for user editing
 *
 * @param formData - Current form data values
 * @param onInputChange - Callback when input value changes
 * @returns JSX element containing form fields
 */
/**
 * EditUserFormFields Component
 * Renders form input fields for user editing
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param formData - Current form data values
 * @param onInputChange - Callback when input value changes
 * @returns JSX element containing form fields
 */
const EditUserFormFields = ({ formData, onInputChange }: EditUserFormFieldsProps) => {
  return (
    /* Form fields container */
    <div className="space-y-4">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
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
          value={formData.lastName}
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
          value={formData.email}
          onChange={onInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

export default EditUserFormFields

