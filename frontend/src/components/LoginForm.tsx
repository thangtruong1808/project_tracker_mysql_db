/**
 * LoginForm Component
 * Handles user authentication with email and password using react-hook-form validation
 * Uses GraphQL mutation for login with async/await pattern
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { LOGIN_MUTATION } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import LoginFormFields from './LoginFormFields'
import Logo from './Logo'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

interface LoginFormData {
  email: string
  password: string
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const [loginMutation, { loading: isLoading }] = useMutation(LOGIN_MUTATION)

  /**
   * Handles form submission with validated data
   * Authenticates user and stores tokens upon successful validation
   * @author Thang Truong
   * @date 2025-12-09
   * @param data - Form data containing email and password
   */
  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setError('')
    try {
      const result = await loginMutation({
        variables: { email: data.email, password: data.password },
      })
      const loginData = result?.data?.login
      if (!loginData || !loginData.accessToken || !loginData.user) {
        setError('Login failed. Invalid response from server.')
        return
      }
      const { accessToken, user } = loginData
      const firstName = String(user.firstName || '')
      const lastName = String(user.lastName || '')
      const userData = {
        id: String(user.id || ''),
        uuid: String(user.uuid || ''),
        firstName,
        lastName,
        email: String(user.email || ''),
        role: String(user.role || ''),
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
      }
      await login(userData, String(accessToken))
      if (onLoginSuccess) {
        await Promise.resolve(onLoginSuccess())
      }
      await navigate('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(errorMessage)
    }
  }

  /* Login form container - Main authentication page with form and demo credentials */
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-md w-full">
        {/* Login card with logo and form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
          {/* Header section with logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <button type="button" onClick={async () => await navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" aria-label="Go to home page">
                <Logo size="large" />
              </button>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to continue to Project Tracker</p>
          </div>
          {/* Demo credentials info box */}
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><span className="font-medium">Email:</span> <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">thangtruong1808@gmail.com</span></p>
                  <p><span className="font-medium">Password:</span> <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">UserTest123!&lt;&gt;</span></p>
                </div>
              </div>
            </div>
          </div>
          {/* Login form with email and password fields */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <LoginFormFields register={register} errors={errors} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
            {/* Error message display */}
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
            {/* Submit button with loading state */}
            <button type="submit" disabled={isLoading || isSubmitting} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              {isLoading || isSubmitting ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Signing in...</>) : ('Sign in')}
            </button>
          </form>
          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Don&apos;t have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign up</Link></p>
          </div>
        </div>
        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
