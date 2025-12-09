/**
 * Pusher Client Configuration
 * Uses HTTP transport for better Vercel compatibility
 * Provides channel access after connection is established
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import Pusher from 'pusher-js'

/** Track configuration state @author Thang Truong @date 2025-12-09 */
let isPusherConfigured = false

/** Singleton Pusher client @author Thang Truong @date 2025-12-09 */
let pusherClient: Pusher | null = null

/** Shared channel instance @author Thang Truong @date 2025-12-09 */
let sharedChannel: ReturnType<Pusher['subscribe']> | null = null

/** Channel name constant @author Thang Truong @date 2025-12-09 */
const CHANNEL_NAME = 'project-tracker'

/**
 * Retrieves Pusher configuration from environment variables
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Pusher configuration object or null if not configured
 */
const getPusherConfig = (): { key: string; cluster: string } | null => {
  const key = import.meta.env.VITE_PUSHER_KEY || import.meta.env.VITE_KEY
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || import.meta.env.VITE_CLUSTER || 'mt1'
  if (!key || typeof key !== 'string') return null
  const cleanKey = String(key).trim().replace(/^["']|["']$/g, '')
  const cleanCluster = String(cluster).trim().replace(/^["']|["']$/g, '')
  if (!cleanKey) return null
  return { key: cleanKey, cluster: cleanCluster }
}

/**
 * Creates mock Pusher client for graceful degradation
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Mock Pusher client object
 */
const createMockPusherClient = (): Pusher => {
  return {
    subscribe: () => ({ bind: () => {}, unbind: () => {}, unbind_all: () => {} }),
    unsubscribe: () => {},
    disconnect: () => {},
    connection: { bind: () => {}, state: 'disconnected', connect: () => {} },
  } as unknown as Pusher
}

/**
 * Gets or creates singleton Pusher client instance
 * Forces HTTP transport for better Vercel compatibility
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Pusher client instance
 */
export const getPusherClient = (): Pusher => {
  if (pusherClient) return pusherClient
  const config = getPusherConfig()
  if (!config) {
    isPusherConfigured = false
    return createMockPusherClient()
  }
  try {
    pusherClient = new Pusher(config.key, {
      cluster: config.cluster,
      forceTLS: true,
      /**
       * Use HTTP streaming/polling instead of WebSocket
       * WebSocket connections can fail on Vercel edge network
       * @author Thang Truong
       * @date 2025-12-09
       */
      disabledTransports: ['ws', 'wss'],
      enabledTransports: ['xhr_streaming', 'xhr_polling'],
    })
    isPusherConfigured = true
    return pusherClient
  } catch {
    isPusherConfigured = false
    return createMockPusherClient()
  }
}

/**
 * Gets or creates shared channel instance
 * Subscribes to channel if not already subscribed
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Shared channel object
 */
export const getSharedChannel = (): ReturnType<Pusher['subscribe']> => {
  if (sharedChannel) return sharedChannel
  const pusher = getPusherClient()
  sharedChannel = pusher.subscribe(CHANNEL_NAME)
  return sharedChannel
}

/**
 * Check if Pusher is configured
 * @author Thang Truong
 * @date 2025-12-09
 */
export const isPusherAvailable = (): boolean => {
  getPusherClient()
  return isPusherConfigured
}

/**
 * Subscribes to Pusher event on shared channel
 * @author Thang Truong
 * @date 2025-12-09
 * @param _channel - Channel name (uses shared channel)
 * @param event - Event name to listen for
 * @param callback - Handler function for event data
 * @returns Cleanup function to unbind event
 */
export const subscribeToPusherEvent = (
  _channel: string,
  event: string,
  callback: (data: unknown) => void
): (() => void) => {
  const channel = getSharedChannel()
  channel.bind(event, callback)
  return () => {
    channel.unbind(event, callback)
  }
}

/**
 * Unsubscribes from Pusher channel
 * @author Thang Truong
 * @date 2025-12-09
 * @param _channel - Channel name to unsubscribe from
 */
export const unsubscribeFromPusherChannel = (_channel: string): void => {
  if (pusherClient && sharedChannel) {
    pusherClient.unsubscribe(CHANNEL_NAME)
    sharedChannel = null
  }
}

export default getPusherClient
