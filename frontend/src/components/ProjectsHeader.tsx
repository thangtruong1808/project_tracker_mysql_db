/**
 * ProjectsHeader Component
 * Displays a friendly and professional header message for the projects page
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

/**
 * ProjectsHeader Component
 * Renders header with welcome message and project overview
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectsHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
          <svg
            className="w-7 h-7 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your projects in one place
          </p>
        </div>
      </div>
      <div className="ml-15 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          Welcome to your project management hub! Here you can explore all your projects organized in an intuitive grid layout. 
          Use the filters below to quickly find projects by status or creation date. Each card provides a quick overview of your project's 
          current status and recent updates. Click on any project card to view more details or manage your project.
        </p>
      </div>
    </div>
  )
}

export default ProjectsHeader

