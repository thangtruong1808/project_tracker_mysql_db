/**
 * EditTaskModal Component
 * Modal dialog for editing task information with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { UPDATE_TASK_MUTATION } from '../graphql/mutations'
import { TASKS_QUERY, PROJECTS_QUERY, USERS_QUERY, TAGS_QUERY } from '../graphql/queries'
import ModalWrapper from './ModalWrapper'
import FormErrorMessage from './FormErrorMessage'
import FormActions from './FormActions'
import EditTaskFormFields from './EditTaskFormFields'

interface Tag {
  id: string
  name: string
  description?: string
  category?: string
}

interface Task {
  id: string
  uuid: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  projectId: string
  assignedTo: string | null
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

interface EditTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditTaskFormData {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  projectId: string
  assignedTo: string
}

/**
 * EditTaskModal Component
 * Renders a modal form for editing task information with validation
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param task - Task object to edit (null when closed)
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when task is successfully updated
 * @returns JSX element containing edit task modal
 */
const EditTaskModal = ({ task, isOpen, onClose, onSuccess }: EditTaskModalProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const { data: projectsData } = useQuery<{ projects: Array<{ id: string; name: string }> }>(
    PROJECTS_QUERY,
    { skip: !isOpen }
  )
  const { data: usersData } = useQuery<{ users: Array<{ id: string; firstName: string; lastName: string }> }>(
    USERS_QUERY,
    { skip: !isOpen }
  )
  const { data: tagsData } = useQuery<{ tags: Tag[] }>(TAGS_QUERY, { skip: !isOpen })

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EditTaskFormData>({
    mode: 'onBlur',
    defaultValues: { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: '', assignedTo: '' },
  })

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: [{ query: TASKS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => setError(err.message || 'Failed to update task.'),
  })

  /**
   * Initialize form data and tags when task changes
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useEffect(() => {
    if (task) {
      let formattedDueDate = ''
      if (task.dueDate) {
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
            formattedDueDate = task.dueDate
          } else {
            const date = new Date(task.dueDate)
            if (!isNaN(date.getTime())) {
              formattedDueDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
            }
          }
        } catch {
          formattedDueDate = ''
        }
      }
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: formattedDueDate,
        projectId: task.projectId,
        assignedTo: task.assignedTo || '',
      })
      setSelectedTagIds(task.tags?.map((tag) => tag.id) || [])
    }
  }, [task, reset])

  /**
   * Handle tag selection change
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleTagsChange = async (tagIds: string[]) => {
    setSelectedTagIds(tagIds)
  }

  /**
   * Handle form submission with validated data
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const onSubmit = async (data: EditTaskFormData) => {
    if (!task) return
    setError('')
    try {
      await updateTask({
        variables: {
          id: task.id,
          input: {
            title: data.title.trim(),
            description: data.description.trim(),
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate || null,
            projectId: data.projectId,
            assignedTo: data.assignedTo || null,
            tagIds: selectedTagIds,
          },
        },
      })
      await showToast('Task updated successfully', 'success', 7000)
      await onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update task.')
    }
  }

  /**
   * Handle modal close and reset state
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleClose = () => {
    reset()
    setError('')
    setSelectedTagIds([])
    onClose()
  }

  if (!isOpen || !task) return null

  return (
    /* Edit Task Modal Container */
    <ModalWrapper isOpen={isOpen} title="Edit Task" onClose={handleClose}>
      {/* Task Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <EditTaskFormFields
          register={register}
          errors={errors}
          projects={projectsData?.projects || []}
          users={usersData?.users || []}
          tags={tagsData?.tags || []}
          selectedTagIds={selectedTagIds}
          onTagsChange={handleTagsChange}
        />
        <FormErrorMessage message={error} />
        <FormActions
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          submitLabel="Update Task"
          submittingLabel="Updating..."
        />
      </form>
    </ModalWrapper>
  )
}

export default EditTaskModal
