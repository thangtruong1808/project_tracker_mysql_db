/**
 * ProjectsTableModals Component
 * Consolidates all modals for the projects table page
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

interface ProjectsTableModalsProps {
  selectedProject: Project | null
  isEditModalOpen: boolean
  isDeleteDialogOpen: boolean
  isCreateModalOpen: boolean
  onCloseEdit: () => Promise<void>
  onCloseDelete: () => Promise<void>
  onCloseCreate: () => Promise<void>
  onSuccess: () => Promise<void>
}

/**
 * ProjectsTableModals Component
 * Renders all project modals (edit, delete, create) for table view
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsTableModals = ({
  selectedProject,
  isEditModalOpen,
  isDeleteDialogOpen,
  isCreateModalOpen,
  onCloseEdit,
  onCloseDelete,
  onCloseCreate,
  onSuccess
}: ProjectsTableModalsProps) => {
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

export default ProjectsTableModals

