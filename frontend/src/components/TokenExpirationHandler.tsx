/**
 * TokenExpirationHandler Component
 * Handles refresh token expiration dialog and user confirmation
 * Shows confirmation dialog when refresh token is about to expire
 * Extends refresh token when user confirms
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { refreshAccessToken } from '../utils/tokenRefresh'
import TokenExpirationDialog from './TokenExpirationDialog'

const TokenExpirationHandler = () => {
  const { showExpirationDialog, setShowExpirationDialog, logout, user, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  /**
   * Handles user confirmation to extend refresh token
   * Calls refresh token mutation with extendSession=true to force refresh token rotation
   * 
   * @author Thang Truong
   * @date 2024-12-24
   */
  const handleConfirm = async () => {
    // Pass extendSession=true to force refresh token rotation when user clicks "Yes"
    const result = await refreshAccessToken(true)
    if (result && result.accessToken && user) {
      // Update access token in context (refresh token is rotated in backend and set as cookie)
      await login(user, result.accessToken)
      setShowExpirationDialog(false)
      await showToast('Session extended successfully.', 'success', 7000)
    } else {
      // Refresh token extension failed, logout user
      await showToast('Failed to extend session. Please log in again.', 'error', 7000)
      await logout()
      navigate('/login')
    }
  }

  /**
   * Handles timeout - logs out user when refresh token expires
   * Clears dialog state before logout to prevent dialog from showing again
   * 
   * @author Thang Truong
   * @date 2024-12-24
   */
  const handleTimeout = async () => {
    // Clear dialog immediately to prevent it from showing again
    setShowExpirationDialog(false)
    // Logout first to clear authentication state
    await logout()
    // Show toast after logout
    await showToast('Session expired. Please log in again.', 'error', 7000)
    // Navigate to login page
    navigate('/login')
  }

  if (!showExpirationDialog) {
    return null
  }

  return <TokenExpirationDialog onConfirm={handleConfirm} onTimeout={handleTimeout} />
}

export default TokenExpirationHandler
