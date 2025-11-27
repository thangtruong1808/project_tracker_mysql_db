/**
 * ForgotPasswordForm Component
 * Handles password reset functionality with GraphQL mutation
 * 
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import Logo from './Logo'
import { useToast } from '../hooks/useToast'
import ForgotPasswordSuccess from './ForgotPasswordSuccess'
import ForgotPasswordFormFields from './ForgotPasswordFormFields'
import { RESET_PASSWORD_MUTATION } from '../graphql/auth'

/**
 * ForgotPasswordForm - Password reset form with actual DB update
 * @author Thang Truong
 * @date 2025-11-27
 */
const ForgotPasswordForm = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  /** Reset password mutation - @author Thang Truong @date 2025-11-27 */
  const [resetPassword, { loading: isLoading }] = useMutation(RESET_PASSWORD_MUTATION)

  /** Simulate initial load for skeleton - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 500)
    return () => clearTimeout(timer)
  }, [])

  /**
   * Handles form submission for password reset
   * Validates input and calls GraphQL mutation to update password
   * @author Thang Truong
   * @date 2025-11-27
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const result = await resetPassword({ variables: { email, newPassword: password } })
      if (result.data?.resetPassword) {
        setSuccess(true)
        await showToast('Password updated successfully!', 'success', 7000)
        setTimeout(() => navigate('/login'), 100)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    }
  }

  if (success) return <ForgotPasswordSuccess />

  if (isInitializing) {
    return (
      /* Loading skeleton for slow network */
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100 animate-pulse">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
            <div className="space-y-5">
              <div><div className="h-4 bg-gray-200 rounded w-16 mb-2"></div><div className="h-12 bg-gray-200 rounded"></div></div>
              <div><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-12 bg-gray-200 rounded"></div></div>
              <div><div className="h-4 bg-gray-200 rounded w-32 mb-2"></div><div className="h-12 bg-gray-200 rounded"></div></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    /* Password reset form container */
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-md w-full">
        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
          {/* Header with logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4"><Logo size="large" /></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
            <p className="text-gray-600">Enter your email address and create a new password for your account.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <ForgotPasswordFormFields
              email={email} password={password} confirmPassword={confirmPassword}
              showPassword={showPassword} showConfirmPassword={showConfirmPassword}
              onEmailChange={setEmail} onPasswordChange={setPassword} onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>Resetting password...</>
              ) : 'Reset password'}
            </button>
          </form>

          {/* Navigation links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">Remember your password? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign in</Link></p>
            <p className="text-sm text-gray-600">Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign up</Link></p>
          </div>
        </div>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
