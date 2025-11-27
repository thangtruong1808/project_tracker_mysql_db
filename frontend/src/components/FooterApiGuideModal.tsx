/**
 * FooterApiGuideModal Component
 * Modal displaying API testing guide with Postman examples
 * Shows sample requests for login, fetching projects, and search
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

interface FooterApiGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * FooterApiGuideModal Component
 * Displays comprehensive API testing guide with Postman instructions
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @returns JSX element containing the API guide modal
 */
const FooterApiGuideModal = ({ isOpen, onClose }: FooterApiGuideModalProps) => {
  if (!isOpen) return null

  /**
   * Handle backdrop click to close modal
   * Closes modal when clicking outside the content area
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const handleBackdropClick = async (e: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    /* Modal overlay backdrop */
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal content container */}
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">API Testing Guide</h2>
            <p className="text-sm text-gray-500">Using Postman to test Project Tracker endpoints</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Getting Started Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Getting Started
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <p>1. Download and install <a href="https://www.postman.com/downloads/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Postman</a></p>
              <p>2. Set the base URL: <code className="bg-gray-200 px-2 py-0.5 rounded">http://localhost:4000/graphql</code></p>
              <p>3. Set Content-Type header: <code className="bg-gray-200 px-2 py-0.5 rounded">application/json</code></p>
            </div>
          </section>

          {/* User Login Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              User Login
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap">{`POST /graphql

{
  "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { accessToken user { id email firstName lastName role } } }",
  "variables": {
    "email": "user@example.com",
    "password": "yourpassword"
  }
}`}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">Save the accessToken from response for authenticated requests.</p>
          </section>

          {/* Fetch All Projects Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Fetch All Projects
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap">{`POST /graphql
Authorization: Bearer <accessToken>

{
  "query": "query { projects { id name description status owner { id firstName lastName } createdAt updatedAt } }"
}`}</pre>
            </div>
          </section>

          {/* Fetch Project by ID Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Fetch Project by ID
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap">{`POST /graphql
Authorization: Bearer <accessToken>

{
  "query": "query GetProject($id: ID!) { project(id: $id) { id name description status owner { id firstName lastName email } tasks { id title status } createdAt } }",
  "variables": {
    "id": "1"
  }
}`}</pre>
            </div>
          </section>

          {/* Search by Project Status Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Search by Project Status
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap">{`POST /graphql
Authorization: Bearer <accessToken>

{
  "query": "query Search($query: String, $projectStatuses: [String!]) { search(query: $query, projectStatuses: $projectStatuses) { projects { id name status description } tasks { id title status } } }",
  "variables": {
    "query": "",
    "projectStatuses": ["active", "completed"]
  }
}`}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">Available statuses: planning, active, on_hold, completed, cancelled</p>
          </section>

          {/* Tips Section */}
          <section className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use Postman Collections to organize your API requests</li>
              <li>• Set up environment variables for base URL and tokens</li>
              <li>• Enable "Automatically follow redirects" in Postman settings</li>
              <li>• Check the Network tab in browser DevTools for real queries</li>
            </ul>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}

export default FooterApiGuideModal

