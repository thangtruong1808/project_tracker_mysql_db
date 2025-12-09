/**
 * Login Page
 * Handles login form and success notification
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import LoginForm from '../components/LoginForm'

/**
 * Login Component
 * Renders the login page with form and handles successful authentication
 *
 * @author Thang Truong
 * @date 2025-12-09
 * @returns JSX element containing the login form
 */
const Login = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  /**
   * Handles successful login
   * Shows success toast message and navigates to home
   * @author Thang Truong
   * @date 2025-12-09
   */
  const handleLoginSuccess = async (): Promise<void> => {
    await showToast('Logged in successfully! Welcome back.', 'success', 7000)
    setTimeout(async () => { await navigate('/') }, 100)
  }

  /* Login page - renders LoginForm component with success callback */
  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}

export default Login
