/**
 * ProjectDetail Page
 * Displays detailed information about a project including tasks and members
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { PROJECT_QUERY } from '../graphql/queries'
import { LIKE_PROJECT_MUTATION } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ProjectDetailHeader from '../components/ProjectDetailHeader'
import ProjectDetailTasks from '../components/ProjectDetailTasks'
import ProjectDetailMembers from '../components/ProjectDetailMembers'
import ProjectDetailComments from '../components/ProjectDetailComments'
import ProjectDetailLoading from '../components/ProjectDetailLoading'
import ProjectDetailError from '../components/ProjectDetailError'
import { ProjectTask, ProjectMember, ProjectOwner } from '../types/project'
import { ProjectComment } from '../types/comments'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  owner: ProjectOwner | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
  tasks: ProjectTask[]
  members: ProjectMember[]
  comments: ProjectComment[]
  createdAt: string
  updatedAt: string
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isAuthenticated, accessToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, loading, error, refetch } = useQuery<{ project: Project }>(PROJECT_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  })

  /**
   * Refetch project when authentication token becomes available
   * Backend checks DB for user likes, so we need fresh data after auth is ready
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const hasRefetchedRef = useRef(false)
  useEffect(() => {
    const refetchProject = async (): Promise<void> => {
      if (accessToken && id && !hasRefetchedRef.current) {
        hasRefetchedRef.current = true
        try {
          await refetch({ fetchPolicy: 'network-only' })
        } catch {
          // Error handling is done in the error handling below
        }
      } else if (!accessToken) {
        hasRefetchedRef.current = false
      }
    }
    refetchProject()
  }, [accessToken, id, refetch])

  const [likeProject] = useMutation(LIKE_PROJECT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id } }],
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to like project. Please try again.', 'error', 7000)
    },
  })

  /**
   * Handle back button click to navigate to projects list
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleBack = async (): Promise<void> => {
    await navigate('/projects')
  }

  /**
   * Handle like button click - toggles like/unlike
   * Backend checks DB and returns updated isLiked status
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleLike = async (): Promise<void> => {
    if (!isAuthenticated) {
      await showToast(
        'Please log in to like projects. Authentication is required to show your appreciation!',
        'info',
        7000
      )
      return
    }
    if (!id) return
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await likeProject({ variables: { projectId: id } })
      if (result.data?.likeProject?.success) {
        await showToast(result.data.likeProject.message || 'Project liked successfully!', 'success', 7000)
        await refetch()
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

  if (error) {
    return <ProjectDetailError onBack={handleBack} />
  }

  if (loading || !data?.project) {
    return <ProjectDetailLoading />
  }

  const project = data.project

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Projects
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <ProjectDetailHeader
            name={project.name}
            status={project.status}
            owner={project.owner}
            likesCount={project.likesCount}
            commentsCount={project.commentsCount}
            isLiked={project.isLiked}
            onLike={handleLike}
          />
          {project.description && <p className="text-gray-700 leading-relaxed mb-6">{project.description}</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProjectDetailTasks tasks={project.tasks} members={project.members} owner={project.owner} />
            <ProjectDetailMembers members={project.members} />
          </div>
          <ProjectDetailComments comments={project.comments} projectId={project.id} members={project.members} owner={project.owner} onRefetch={async () => { await refetch() }} />
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail

