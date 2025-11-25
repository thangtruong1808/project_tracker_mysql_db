/**
 * EditTeamMemberFormFields Component
 * Form inputs for editing team member role assignment
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface EditTeamMemberFormData {
  projectId: string
  userId: string
  role: string
}

interface EditTeamMemberFormFieldsProps {
  register: UseFormRegister<EditTeamMemberFormData>
  errors: FieldErrors<EditTeamMemberFormData>
  projects: Array<{ id: string; name: string }>
  users: Array<{ id: string; firstName: string; lastName: string; email: string }>
}

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'VIEWER', label: 'Viewer' },
]

const EditTeamMemberFormFields = ({ register, errors, projects, users }: EditTeamMemberFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
          Project
        </label>
        <select
          id="projectId"
          disabled
          className="block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          {...register('projectId')}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          User
        </label>
        <select
          id="userId"
          disabled
          className="block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          {...register('userId')}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('role', { required: 'Role is required' })}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
      </div>
    </div>
  )
}

export default EditTeamMemberFormFields

