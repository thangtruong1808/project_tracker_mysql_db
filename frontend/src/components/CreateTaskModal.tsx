/**
 * CreateTaskModal Component
 * Modal dialog for creating a new task with react-hook-form validation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { CREATE_TASK_MUTATION } from '../graphql/mutations'
import { TASKS_QUERY, PROJECTS_QUERY, USERS_QUERY, TAGS_QUERY } from '../graphql/queries'
import ModalWrapper from './ModalWrapper'
import FormErrorMessage from './FormErrorMessage'
import FormActions from './FormActions'
import CreateTaskFormFields from './CreateTaskFormFields'

interface Tag {
  id: string
  name: string
  description?: string
  category?: string
}

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CreateTaskFormData {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  projectId: string
  assignedTo: string
}

/**
 * CreateTaskModal Component
 * Renders a modal form for creating a new task with validation
 *
 * @author Thang Truong
 * @date 2025-12-09
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param onSuccess - Callback when task is successfully created
 * @returns JSX element containing create task modal
 */
const CreateTaskModal = ({ isOpen, onClose, onSuccess }: CreateTaskModalProps) => {
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

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateTaskFormData>({
    mode: 'onBlur',
    defaultValues: { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: '', assignedTo: '' },
  })

  const [createTask] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: [{ query: TASKS_QUERY }],
    awaitRefetchQueries: true,
    onError: (err) => setError(err.message || 'Failed to create task.'),
  })

  /**
   * Reset form when modal closes
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  useEffect(() => {
    if (!isOpen) {
      reset()
      setError('')
      setSelectedTagIds([])
    }
  }, [isOpen, reset])

  /**
   * Handle tag selection change
   *
   * @author Thang Truong
   * @date 2025-12-09
   */
  const handleTagsChange = async (tagIds: string[]) => {
    setSelectedTagIds(tagIds)
  }

  /**
   * Handle form submission with validated data
   *
   * @author Thang Truong
   * @date 2025-12-09
   */
  const onSubmit = async (data: CreateTaskFormData) => {
    setError('')
    try {
      const result = await createTask({
        variables: {
          input: {
            title: data.title.trim(),
            description: data.description.trim(),
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate || null,
            projectId: data.projectId,
            assignedTo: data.assignedTo || null,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : null,
          },
        },
      })
      const mutationErrors = result.errors?.filter(Boolean) || []
      const createdTask = result.data?.createTask
      if (mutationErrors.length > 0 || !createdTask) {
        const firstErrorMessage = mutationErrors[0]?.message || 'Failed to create task.'
        throw new Error(firstErrorMessage)
      }
      await showToast('Task created successfully', 'success', 7000)
      reset()
      setSelectedTagIds([])
      await onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task.')
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

  if (!isOpen) return null

  return (
    /* Create Task Modal Container */
    <ModalWrapper isOpen={isOpen} title="Create New Task" onClose={handleClose}>
      {/* Task Creation Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <CreateTaskFormFields
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
          submitLabel="Create Task"
          submittingLabel="Creating..."
        />
      </form>
    </ModalWrapper>
  )
}

export default CreateTaskModal
