/**
 * Authentication Constants
 * Centralized constants for token expiration and refresh token management
 * All constants are defined here - change them in one place only
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Access token expiration time
 * Format: '20s', '1m', '1h', '7d', etc.
 */
export const ACCESS_TOKEN_EXPIRY = '5m'

/**
 * Refresh token expiration time
 * Format: '40s', '1h', '7d', etc.
 */
export const REFRESH_TOKEN_EXPIRY = '60m'

/**
 * Threshold (in seconds) for showing expiration dialog
 * Dialog appears when refresh token has this many seconds remaining
 */
export const REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS = 30

/**
 * Safety margin (in seconds) for rotation threshold calculation
 * Prevents rotation when refresh token is within (DIALOG_THRESHOLD + ACCESS_TOKEN_EXPIRY + SAFETY_MARGIN) seconds of expiration
 * This ensures the refresh token can reach the dialog threshold without being rotated
 * Formula: REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS + ACCESS_TOKEN_EXPIRY (in seconds) + ROTATION_SAFETY_MARGIN_SECONDS
 */
export const ROTATION_SAFETY_MARGIN_SECONDS = 30
