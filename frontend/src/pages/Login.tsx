/**
 * Login Page
 * Handles login form and success notification
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import LoginForm from '../components/LoginForm'

const Login = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  /**
   * Handles successful login
   * Shows success toast message and navigates to home
   */
  const handleLoginSuccess = async () => {
    await showToast('Logged in successfully! Welcome back.', 'success', 7000)
    // Small delay to ensure toast is visible before navigation
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}

export default Login
