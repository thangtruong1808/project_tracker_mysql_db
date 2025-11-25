/**
 * CreateActivityLogFormFields Component
 * Form fields for creating activity logs with validation
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface CreateActivityLogFormData {
  userId: string
  targetUserId: string
  projectId: string
  taskId: string
  action: string
  type: string
  metadata: string
}

interface CreateActivityLogFormFieldsProps {
  register: UseFormRegister<CreateActivityLogFormData>
  errors: FieldErrors<CreateActivityLogFormData>
  users: Array<{ id: string; firstName: string; lastName: string }>
  projects: Array<{ id: string; name: string }>
  tasks: Array<{ id: string; title: string }>
}

const ACTIVITY_TYPES = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DELETED',
  'PROJECT_CREATED',
  'PROJECT_UPDATED',
  'PROJECT_DELETED',
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_DELETED',
]

/**
 * CreateActivityLogFormFields Component
 * Renders all input elements used in the modal
 */
const CreateActivityLogFormFields = ({ register, errors, users, projects, tasks }: CreateActivityLogFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          User <span className="text-red-500">*</span>
        </label>
        <select
          id="userId"
          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.userId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          {...register('userId', { required: 'User is required' })}
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>}
      </div>

      <div>
        <label htmlFor="targetUserId" className="block text-sm font-medium text-gray-700 mb-1">
          Target User
        </label>
        <select
          id="targetUserId"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          {...register('targetUserId')}
        >
          <option value="">Select target user (optional)</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            id="projectId"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            {...register('projectId')}
          >
            <option value="">Select project (optional)</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
            Task
          </label>
          <select
            id="taskId"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            {...register('taskId')}
          >
            <option value="">Select task (optional)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
          Action
        </label>
        <input
          id="action"
          type="text"
          placeholder="Describe the action (optional)"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          {...register('action')}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.type ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          {...register('type', { required: 'Type is required' })}
        >
          <option value="">Select type</option>
          {ACTIVITY_TYPES.map((value) => (
            <option key={value} value={value}>
              {value.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-1">
          Metadata (JSON)
        </label>
        <textarea
          id="metadata"
          rows={4}
          placeholder='e.g. {"detail":"value"}'
          className={`block w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all ${errors.metadata ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          {...register('metadata', {
            validate: (value) => {
              if (!value) return true
              try {
                JSON.parse(value)
                return true
              } catch (error) {
                return 'Metadata must be valid JSON'
              }
            },
          })}
        />
        {errors.metadata && <p className="mt-1 text-sm text-red-600">{errors.metadata.message}</p>}
      </div>
    </div>
  )
}

export default CreateActivityLogFormFields

