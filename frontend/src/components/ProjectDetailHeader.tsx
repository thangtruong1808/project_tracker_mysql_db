/**
 * ProjectDetailHeader Component
 * Displays project header with title, status, owner, likes, and comments count
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import StatusBadge from './StatusBadge'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProjectDetailHeaderProps {
  name: string
  status: string
  owner: User | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
  onLike: () => Promise<void>
}

/**
 * ProjectDetailHeader Component
 * Renders project header section
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectDetailHeader = ({
  name,
  status,
  owner,
  likesCount,
  commentsCount,
  isLiked,
  onLike,
}: ProjectDetailHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={status} type="project" />
          {owner && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{owner.firstName} {owner.lastName}</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              aria-label={`Like project ${name}`}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'text-blue-600 fill-blue-600' : 'text-gray-400 hover:text-blue-500'
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
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  )
}

export default ProjectDetailHeader

