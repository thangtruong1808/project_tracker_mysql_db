/**
 * LoginForm Component
 * Handles user authentication with email and password using react-hook-form validation
 * Uses GraphQL mutation for login
 *
 * @author Thang Truong
 * @date 2024-12-24
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

  // Initialize react-hook-form with validation rules
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // GraphQL login mutation hook
  const [loginMutation, { loading: isLoading }] = useMutation(LOGIN_MUTATION, {
    onError: (err) => {
      setError(err.message || 'Login failed. Please try again.')
    },
  })

  /**
   * Handles form submission with validated data
   * Authenticates user and stores tokens upon successful validation
   * @param data - Form data containing email and password
   */
  const onSubmit = async (data: LoginFormData) => {
    setError('') // Clear previous errors

    try {
      // Execute login mutation with validated form data
      const { data: mutationData } = await loginMutation({
        variables: { email: data.email, password: data.password },
      })

      if (mutationData?.login) {
        const { accessToken, user } = mutationData.login

        // Format user data for AuthContext
        const userData = {
          ...user,
          name: `${user.firstName} ${user.lastName}`,
          initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
        }

        // Store access token in memory and user data in AuthContext
        // Refresh token is sent as HTTP-only cookie by server (not in response)
        await login(userData, accessToken)

        // Execute optional success callback
        if (onLoginSuccess) {
          onLoginSuccess()
        }

        // Navigate to home page
        navigate('/')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <button
                type="button"
                onClick={async (): Promise<void> => {
                  // Handle logo click to navigate to home page
                  // @author Thang Truong
                  // @date 2025-01-27
                  await navigate('/')
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Go to home page"
              >
                <Logo size="large" />
              </button>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to continue to Project Tracker</p>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">thangtruong1808@gmail.com</span>
                  </p>
                  <p>
                    <span className="font-medium">Password:</span>{' '}
                    <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">UserTest123!&lt;&gt;</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <LoginFormFields
              register={register}
              errors={errors}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading || isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default LoginForm
