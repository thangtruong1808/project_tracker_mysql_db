/**
 * WebSocket Error Suppression
 * Suppresses WebSocket connection errors to prevent console spam
 * Must run before any Apollo/GraphQL imports
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalWindowError = window.onerror

/**
 * Check if error message is WebSocket-related and should be suppressed
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param message - Error message to check
 * @returns True if message should be suppressed
 */
const suppressWebSocketLogs = (message: string): boolean => {
  const msg = String(message || '').toLowerCase()
  return (
    (msg.includes('websocket') ||
      msg.includes('ws://localhost:4000') ||
      msg.includes('graphql-ws') ||
      msg.includes('ws://')) &&
    (msg.includes('failed') ||
      msg.includes('error') ||
      msg.includes('warning') ||
      msg.includes('connection'))
  )
}

/**
 * Override window.onerror to catch WebSocket errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
window.onerror = (message, source, lineno, colno, error) => {
  const errorMessage = String(message || '')
  if (suppressWebSocketLogs(errorMessage)) return true
  if (originalWindowError) {
    return originalWindowError.call(window, message, source, lineno, colno, error) || false
  }
  return false
}

/**
 * Override console.error to suppress WebSocket errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
console.error = (...args: unknown[]) => {
  const errorMessage = args.map((arg) => String(arg || '')).join(' ')
  if (suppressWebSocketLogs(errorMessage)) return
  originalConsoleError.apply(console, args)
}

/**
 * Override console.warn to suppress WebSocket warnings
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
console.warn = (...args: unknown[]) => {
  const errorMessage = args.map((arg) => String(arg || '')).join(' ')
  if (suppressWebSocketLogs(errorMessage)) return
  originalConsoleWarn.apply(console, args)
}

export { suppressWebSocketLogs }

