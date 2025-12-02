/**
 * Pusher Client Configuration
 * Initializes Pusher client for real-time subscriptions
 * Uses environment variables for configuration
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import Pusher from 'pusher-js'

/**
 * Get Pusher configuration from environment variables
 * Supports both VITE_PUSHER_* and VITE_* variable names
 * Falls back to hardcoded values if env vars not set (for development)
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Pusher configuration object
 */
const getPusherConfig = () => {
  // Try VITE_ prefixed variables first (Vite convention)
  // Support both VITE_PUSHER_KEY and VITE_KEY for flexibility
  const key = import.meta.env.VITE_PUSHER_KEY || 
              import.meta.env.VITE_KEY || 
              import.meta.env.PUSHER_KEY || 
              '1dac263b7c59217e7602'
  
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || 
                  import.meta.env.VITE_CLUSTER || 
                  import.meta.env.PUSHER_CLUSTER || 
                  'mt1'

  // Clean configuration values (remove quotes if present)
  const cleanKey = key.trim().replace(/^["']|["']$/g, '')
  const cleanCluster = cluster.trim().replace(/^["']|["']$/g, '')

  return {
    key: cleanKey,
    cluster: cleanCluster,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'] as ('ws' | 'wss')[],
  }
}

/**
 * Pusher client instance
 * Singleton instance for the application
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let pusherClient: Pusher | null = null

/**
 * Get or create Pusher client instance
 * Returns singleton instance, creating it if it doesn't exist
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Pusher client instance
 */
export const getPusherClient = (): Pusher => {
  if (pusherClient) {
    return pusherClient
  }

  try {
    const config = getPusherConfig()
    pusherClient = new Pusher(config.key, {
      cluster: config.cluster,
      forceTLS: config.forceTLS,
      enabledTransports: config.enabledTransports,
    })
    return pusherClient
  } catch (error) {
    // If Pusher initialization fails, create a mock client
    // This allows the app to continue without Pusher
    return {
      subscribe: () => ({
        bind: () => {},
        unbind: () => {},
        unbind_all: () => {},
      }),
      unsubscribe: () => {},
      disconnect: () => {},
    } as any
  }
}

/**
 * Subscribe to Pusher channel and event
 * Wrapper function for subscribing to Pusher events
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param channel - Channel name
 * @param event - Event name
 * @param callback - Callback function to handle event data
 * @returns Unsubscribe function
 */
export const subscribeToPusherEvent = (
  channel: string,
  event: string,
  callback: (data: any) => void
): (() => void) => {
  try {
    const pusher = getPusherClient()
    const pusherChannel = pusher.subscribe(channel)
    
    pusherChannel.bind(event, callback)

    // Return unsubscribe function
    return () => {
      pusherChannel.unbind(event, callback)
    }
  } catch (error) {
    // Return no-op unsubscribe function if subscription fails
    return () => {}
  }
}

/**
 * Unsubscribe from Pusher channel
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param channel - Channel name to unsubscribe from
 */
export const unsubscribeFromPusherChannel = (channel: string): void => {
  try {
    const pusher = getPusherClient()
    pusher.unsubscribe(channel)
  } catch (error) {
    // Silently handle unsubscribe errors
  }
}

export default getPusherClient

