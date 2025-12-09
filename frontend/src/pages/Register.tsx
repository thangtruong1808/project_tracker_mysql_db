/**
 * Register Page
 * Renders the RegisterForm component and handles successful registration actions
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import { useToast } from '../hooks/useToast'

/**
 * Register Component
 * Renders the registration page with form and handles successful account creation
 *
 * @author Thang Truong
 * @date 2025-12-09
 * @returns JSX element containing the register form
 */
const Register = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  /**
   * Handles successful registration by displaying a toast and navigating to home
   * @author Thang Truong
   * @date 2025-12-09
   */
  const handleRegisterSuccess = async (): Promise<void> => {
    await showToast('Account created successfully! Welcome to Project Tracker.', 'success', 7000)
    setTimeout(async () => { await navigate('/') }, 100)
  }

  /* Register page - renders RegisterForm component with success callback */
  return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
}

export default Register
