/**
 * Register Page
 * Renders the RegisterForm component and handles successful registration actions
 * Displays a toast notification upon successful registration
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import { useToast } from '../hooks/useToast'

const Register = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  /**
   * Handles successful registration by displaying a toast and navigating to the home page
   */
  const handleRegisterSuccess = async () => {
    await showToast('Account created successfully! Welcome to Project Tracker.', 'success', 7000)
    // Small delay to ensure toast is visible before navigation
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
}

export default Register
