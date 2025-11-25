/**
 * Project-related shared TypeScript interfaces
 * Centralizes owner, task, tag, and member shapes across components
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export interface ProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface ProjectMember {
  id: string
  projectId: string
  projectName: string
  userId: string
  memberName: string
  memberEmail: string
  role: string
  createdAt: string
  updatedAt: string
}

/**
 * Tag interface for task tags
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export interface ProjectTag {
  id: string
  name: string
  description?: string
  category?: string
}

export interface ProjectTask {
  id: string
  uuid: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  projectId: string
  assignedTo: string | null
  owner: ProjectOwner | null
  tags?: ProjectTag[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

