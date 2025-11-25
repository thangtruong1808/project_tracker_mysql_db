/**
 * ProjectDetailCommentsRestricted Component
 * Displays restricted access messages for comments section
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface ProjectDetailCommentsRestrictedProps {
  commentsCount: number
  isAuthenticated: boolean
}

/**
 * Authentication Required Message
 * @author Thang Truong
 * @date 2025-01-27
 */
const AuthRequiredMessage = ({ commentsCount }: { commentsCount: number }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    {/* Comments section header */}
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({commentsCount})</h2>
    {/* Authentication required message */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
      <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p className="text-sm text-gray-700 font-medium mb-1">Authentication Required</p>
      <p className="text-xs text-gray-600">Please log in to view and post comments on this project.</p>
    </div>
  </div>
)

/**
 * Membership Required Message
 * @author Thang Truong
 * @date 2025-01-27
 */
const MembershipRequiredMessage = ({ commentsCount }: { commentsCount: number }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    {/* Comments section header */}
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({commentsCount})</h2>
    {/* Membership required message */}
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
      <svg className="w-12 h-12 text-amber-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-sm text-gray-700 font-medium mb-1">Project Membership Required</p>
      <p className="text-xs text-gray-600">Only project members can view and post comments. Please join this project first.</p>
    </div>
  </div>
)

/**
 * ProjectDetailCommentsRestricted Component
 * Renders appropriate restricted access message
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectDetailCommentsRestricted = ({ commentsCount, isAuthenticated }: ProjectDetailCommentsRestrictedProps) => {
  if (!isAuthenticated) {
    return <AuthRequiredMessage commentsCount={commentsCount} />
  }
  return <MembershipRequiredMessage commentsCount={commentsCount} />
}

export default ProjectDetailCommentsRestricted

