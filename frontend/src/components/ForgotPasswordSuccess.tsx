/**
 * ForgotPasswordSuccess Component
 * Displays success message after password reset
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { Link } from 'react-router-dom'

/**
 * ForgotPasswordSuccess Component
 * Renders success message after password reset
 * 
 * @returns JSX element containing success message
 */
const ForgotPasswordSuccess = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Password updated!
            </h2>
            <p className="text-gray-600">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 text-center">
              You can now sign in with your new password.
            </p>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to login
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="mr-2 h-4 w-4"
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
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordSuccess

