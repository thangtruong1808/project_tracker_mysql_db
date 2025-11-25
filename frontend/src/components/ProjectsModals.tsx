/**
 * ProjectsModals Component
 * Manages all project-related modals in one component
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import EditProjectModal from './EditProjectModal'
import DeleteProjectDialog from './DeleteProjectDialog'
import CreateProjectModal from './CreateProjectModal'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface ProjectsModalsProps {
  selectedProject: Project | null
  isEditModalOpen: boolean
  isDeleteDialogOpen: boolean
  isCreateModalOpen: boolean
  onCloseEdit: () => void
  onCloseDelete: () => void
  onCloseCreate: () => void
  onSuccess: () => Promise<void>
}

/**
 * ProjectsModals Component
 * Renders all project modals (edit, delete, create)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsModals = ({
  selectedProject,
  isEditModalOpen,
  isDeleteDialogOpen,
  isCreateModalOpen,
  onCloseEdit,
  onCloseDelete,
  onCloseCreate,
  onSuccess
}: ProjectsModalsProps) => {
  return (
    <>
      <EditProjectModal
        project={selectedProject}
        isOpen={isEditModalOpen}
        onClose={onCloseEdit}
        onSuccess={onSuccess}
      />
      <DeleteProjectDialog
        project={selectedProject}
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDelete}
        onSuccess={onSuccess}
      />
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreate}
        onSuccess={onSuccess}
      />
    </>
  )
}

export default ProjectsModals

