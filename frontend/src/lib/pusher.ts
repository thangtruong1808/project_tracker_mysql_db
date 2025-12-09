/**
 * Pusher Client Configuration
 * Initializes Pusher client for real-time subscriptions
 * Uses environment variables for configuration
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import Pusher from 'pusher-js'

/**
 * Retrieves Pusher configuration from environment variables
 * Supports VITE_PUSHER_* variable names for Vite compatibility
 * Returns null if required variables are missing
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Pusher configuration object or null if not configured
 */
const getPusherConfig = (): { key: string; cluster: string; forceTLS: boolean; enabledTransports: ('ws' | 'wss')[] } | null => {
  const key = import.meta.env.VITE_PUSHER_KEY || import.meta.env.VITE_KEY
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || import.meta.env.VITE_CLUSTER || 'mt1'

  if (!key) {
    return null
  }

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
 * Singleton Pusher client instance
 * @author Thang Truong
 * @date 2025-12-04
 */
let pusherClient: Pusher | null = null

/**
 * Gets or creates singleton Pusher client instance
 * Creates mock client if configuration missing or initialization fails
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Pusher client instance or mock client
 */
export const getPusherClient = (): Pusher => {
  if (pusherClient) {
    return pusherClient
  }

  try {
    const config = getPusherConfig()
    if (!config) {
      return createMockPusherClient()
    }
    pusherClient = new Pusher(config.key, {
      cluster: config.cluster,
      forceTLS: config.forceTLS,
      enabledTransports: config.enabledTransports,
    })
    return pusherClient
  } catch {
    return createMockPusherClient()
  }
}

/**
 * Creates mock Pusher client for graceful degradation
 * Allows app to function without Pusher configuration
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Mock Pusher client object
 */
const createMockPusherClient = (): Pusher => {
  return {
    subscribe: () => ({
      bind: () => {},
      unbind: () => {},
      unbind_all: () => {},
    }),
    unsubscribe: () => {},
    disconnect: () => {},
  } as unknown as Pusher
}

/**
 * Subscribes to Pusher channel and event
 * Returns unsubscribe function for cleanup
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param channel - Pusher channel name
 * @param event - Event name to listen for
 * @param callback - Handler function for event data
 * @returns Cleanup function to unsubscribe
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
    return () => {
      pusherChannel.unbind(event, callback)
    }
  } catch {
    return () => {}
  }
}

/**
 * Unsubscribes from Pusher channel
 * Silently handles errors for graceful degradation
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param channel - Channel name to unsubscribe from
 */
export const unsubscribeFromPusherChannel = (channel: string): void => {
  try {
    const pusher = getPusherClient()
    pusher.unsubscribe(channel)
  } catch {
    // Silent error handling for graceful degradation
  }
}

export default getPusherClient

