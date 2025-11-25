/**
 * Shared comment-related TypeScript interfaces
 * Keeps component files concise and reusable
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface ProjectComment {
  id: string
  uuid: string
  content: string
  taskId: string
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export type { ProjectMember, ProjectOwner } from './project'

