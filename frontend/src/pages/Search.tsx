/**
 * Search Page
 * Presents a placeholder global search surface for quick navigation between resources.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */

import { useMemo } from 'react'

/**
 * Search component
 * Renders guidance content until full search functionality is implemented.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const Search = () => {
  /**
   * Sample search tips list
   * Provides suggested queries for users to start exploring.
   *
   * @author Thang Truong
   * @date 2025-11-24
   */
  const suggestions = useMemo(
    () => ['Projects: onboarding', 'Tasks: pending review', 'Users: design team', 'Activity: recent changes'],
    []
  )

  return (
    <div className="min-h-[50vh] bg-white shadow-sm rounded-lg mx-4 md:mx-auto md:max-w-4xl mt-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">Search</h1>
      <p className="text-gray-600 mb-6">
        Global search is coming soon. Use the suggestions below to navigate directly to the relevant dashboard sections.
      </p>
      <div className="space-y-3">
        {suggestions.map((tip) => (
          <div key={tip} className="border border-gray-200 rounded-md px-4 py-3 bg-gray-50 text-sm text-gray-700">
            {tip}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search


