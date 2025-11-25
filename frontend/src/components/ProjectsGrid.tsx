/**
 * ProjectsGrid Component
 * Displays projects in a grid layout with pagination
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import ProjectCard from './ProjectCard'
import ProjectsGridPagination from './ProjectsGridPagination'

interface ProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  owner: ProjectOwner | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectsGridProps {
  projects: Project[]
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => Promise<void>
}

/**
 * ProjectsGrid Component
 * Renders projects in a responsive grid layout with pagination
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsGrid = ({
  projects,
  currentPage,
  itemsPerPage,
  onPageChange,
}: ProjectsGridProps) => {
  /**
   * Validate projects array is not empty
   * Returns early if no projects to display
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  if (!projects || projects.length === 0) {
    return null
  }

  /**
   * Calculate pagination values
   * Determines which projects to display on current page
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = projects.slice(startIndex, endIndex)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            name={project.name}
            description={project.description}
            status={project.status}
            owner={project.owner}
            likesCount={project.likesCount}
            commentsCount={project.commentsCount}
            isLiked={project.isLiked}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <ProjectsGridPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={projects.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}

export default ProjectsGrid

