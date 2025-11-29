/**
 * Shared comment-related TypeScript interfaces
 * Keeps component files concise and reusable
 *
 * @author Thang Truong
 * @date 2025-11-27
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
  projectId: string | null
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export type { ProjectMember, ProjectOwner } from './project'

