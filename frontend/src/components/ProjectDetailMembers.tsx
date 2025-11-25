/**
 * ProjectDetailMembers Component
 * Displays list of members associated with a project
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface ProjectMember {
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

interface ProjectDetailMembersProps {
  members: ProjectMember[]
}

/**
 * Get role badge color
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const getRoleColor = (role: string): string => {
  switch (role.toUpperCase()) {
    case 'OWNER':
      return 'bg-purple-100 text-purple-700'
    case 'EDITOR':
      return 'bg-blue-100 text-blue-700'
    case 'VIEWER':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * ProjectDetailMembers Component
 * Renders a section displaying project members
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectDetailMembers = ({ members }: ProjectDetailMembersProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Members ({members.length})
      </h2>
      {members.length === 0 ? (
        <p className="text-sm text-gray-500">No members found for this project.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {member.memberName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.memberName}</h3>
                    <p className="text-xs text-gray-500">{member.memberEmail}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(member.role)}`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectDetailMembers

