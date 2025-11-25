/**
 * ProjectCard Component
 * Displays a single project card optimized for grid layout
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { LIKE_PROJECT_MUTATION } from '../graphql/mutations'
import { PROJECTS_QUERY } from '../graphql/queries'
import StatusBadge from './StatusBadge'
import { ProjectOwner } from '../types/project'

interface ProjectCardProps {
  id: string
  name: string
  description: string | null
  status: string
  owner: ProjectOwner | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
}

/**
 * ProjectCard Component
 * Displays project card with like functionality
 * Backend checks DB for user likes and returns isLiked status
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectCard = ({
  id,
  name,
  description,
  status,
  owner,
  likesCount,
  commentsCount,
  isLiked,
}: ProjectCardProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [likeProject] = useMutation(LIKE_PROJECT_MUTATION, {
    refetchQueries: [{ query: PROJECTS_QUERY }],
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to like project. Please try again.', 'error', 7000)
    },
  })

  /**
   * Handle card click to navigate to project detail page
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleCardClick = async (): Promise<void> => {
    await navigate(`/projects/${id}`)
  }

  /**
   * Handle like button click
   * Backend checks DB and returns updated isLiked status
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleLike = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (!isAuthenticated) {
      await showToast(
        'Please log in to like projects. Authentication is required to show your appreciation!',
        'info',
        7000
      )
      return
    }
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await likeProject({ variables: { projectId: id } })
      if (result.data?.likeProject?.success) {
        await showToast(result.data.likeProject.message || 'Project liked successfully!', 'success', 7000)
      } else {
        await showToast(result.data?.likeProject?.message || 'Unable to like project. Please try again.', 'info', 7000)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to like project. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className="group flex flex-col h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
    >
      {/* Project card container */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 leading-tight flex-1 min-w-0 line-clamp-2">
          {name}
        </h3>
        <div className="flex-shrink-0 scale-90 origin-top-right">
          <StatusBadge status={status} type="project" />
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed flex-grow">
          {description}
        </p>
      )}

      <div className="pt-3 mt-auto border-t border-gray-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2 min-w-0">
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="truncate text-gray-800 font-medium">
                {owner ? `${owner.firstName} ${owner.lastName}` : 'Owner not assigned'}
              </span>
              <span className="text-[11px] text-gray-500">
                {owner?.role || 'Role unavailable'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              aria-label={`Like project ${name}`}
            >
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-colors ${isLiked
                  ? 'text-blue-600 fill-blue-600'
                  : 'text-gray-400 hover:text-blue-500'
                  }`}
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span className="font-medium">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="font-medium">{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard

