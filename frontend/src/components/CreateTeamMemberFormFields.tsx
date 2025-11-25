/**
 * CreateTeamMemberFormFields Component
 * Form inputs for creating a team member entry
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface CreateTeamMemberFormData {
  projectId: string
  userId: string
  role: string
}

interface CreateTeamMemberFormFieldsProps {
  register: UseFormRegister<CreateTeamMemberFormData>
  errors: FieldErrors<CreateTeamMemberFormData>
  projects: Array<{ id: string; name: string }>
  users: Array<{ id: string; firstName: string; lastName: string; email: string }>
}

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'VIEWER', label: 'Viewer' },
]

const CreateTeamMemberFormFields = ({ register, errors, projects, users }: CreateTeamMemberFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          id="projectId"
          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.projectId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('projectId', { required: 'Project is required' })}
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>}
      </div>

      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          User <span className="text-red-500">*</span>
        </label>
        <select
          id="userId"
          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.userId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('userId', { required: 'User is required' })}
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
        {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>}
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

export default CreateTeamMemberFormFields

