/**
 * CreateTaskFormFields Component
 * Form input fields for creating a new task with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface CreateTaskFormData {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  projectId: string
  assignedTo: string
}

interface CreateTaskFormFieldsProps {
  register: UseFormRegister<CreateTaskFormData>
  errors: FieldErrors<CreateTaskFormData>
  projects: Array<{ id: string; name: string }>
  users: Array<{ id: string; firstName: string; lastName: string }>
}

/**
 * Available task statuses
 */
const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

/**
 * Available task priorities
 */
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

/**
 * CreateTaskFormFields Component
 * Renders form input fields for task creation with validation
 *
 * @param register - react-hook-form register function
 * @param errors - Form validation errors
 * @param projects - Array of available projects
 * @param users - Array of available users for assignment
 * @returns JSX element containing form fields
 */
const CreateTaskFormFields = ({ register, errors, projects, users }: CreateTaskFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="Enter task title"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.title
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('title', {
            required: 'Task title is required',
            minLength: {
              value: 2,
              message: 'Task title must be at least 2 characters',
            },
            maxLength: {
              value: 150,
              message: 'Task title must not exceed 150 characters',
            },
          })}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Enter task description"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
            errors.description
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('description', {
            required: 'Task description is required',
            minLength: {
              value: 2,
              message: 'Task description must be at least 2 characters',
            },
          })}
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
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.status
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('status', {
            required: 'Status is required',
          })}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Priority Field */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority <span className="text-red-500">*</span>
        </label>
        <select
          id="priority"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.priority
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('priority', {
            required: 'Priority is required',
          })}
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority === 'LOW' ? 'Low' : priority === 'MEDIUM' ? 'Medium' : 'High'}
            </option>
          ))}
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.priority.message}
          </p>
        )}
      </div>

      {/* Project ID Field */}
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          id="projectId"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.projectId
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('projectId', {
            required: 'Project is required',
          })}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.projectId.message}
          </p>
        )}
      </div>

      {/* Assigned To Field */}
      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
          Assigned To
        </label>
        <select
          id="assignedTo"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.assignedTo
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('assignedTo')}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.assignedTo.message}
          </p>
        )}
      </div>

      {/* Due Date Field */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          id="dueDate"
          type="date"
          className={`block w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.dueDate
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          {...register('dueDate')}
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.dueDate.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default CreateTaskFormFields

