/**
 * Pusher Client Configuration
 * Initializes Pusher client for real-time subscriptions
 * Uses environment variables for configuration
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import Pusher from 'pusher-js'

/** Track if Pusher is configured @author Thang Truong @date 2025-12-09 */
let isPusherConfigured = false

/**
 * Retrieves Pusher configuration from environment variables
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Pusher configuration object or null if not configured
 */
const getPusherConfig = (): { key: string; cluster: string } | null => {
  const key = import.meta.env.VITE_PUSHER_KEY || import.meta.env.VITE_KEY
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || import.meta.env.VITE_CLUSTER || 'ap4'
  if (!key || typeof key !== 'string') return null
  const cleanKey = String(key).trim().replace(/^["']|["']$/g, '')
  const cleanCluster = String(cluster).trim().replace(/^["']|["']$/g, '')
  if (!cleanKey) return null
  return { key: cleanKey, cluster: cleanCluster }
}

/** Singleton Pusher client @author Thang Truong @date 2025-12-09 */
let pusherClient: Pusher | null = null

/**
 * Gets or creates singleton Pusher client instance
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
    pusherClient = new Pusher(config.key, { cluster: config.cluster, forceTLS: true })
    isPusherConfigured = true
    return pusherClient
  } catch {
    isPusherConfigured = false
    return createMockPusherClient()
  }
}

/**
 * Check if Pusher is configured
 * @author Thang Truong
 * @date 2025-12-09
 */
export const isPusherAvailable = (): boolean => {
  if (pusherClient) return isPusherConfigured
  getPusherClient()
  return isPusherConfigured
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
  } as unknown as Pusher
}

/**
 * Subscribes to Pusher channel and event
 * @author Thang Truong
 * @date 2025-12-09
 * @param channel - Pusher channel name
 * @param event - Event name to listen for
 * @param callback - Handler function for event data
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToPusherEvent = (
  channel: string,
  event: string,
  callback: (data: unknown) => void
): (() => void) => {
  const pusher = getPusherClient()
  const pusherChannel = pusher.subscribe(channel)
  pusherChannel.bind(event, callback)
  return () => { pusherChannel.unbind(event, callback) }
}

/**
 * Unsubscribes from Pusher channel
 * @author Thang Truong
 * @date 2025-12-09
 * @param channel - Channel name to unsubscribe from
 */
export const unsubscribeFromPusherChannel = (channel: string): void => {
  const pusher = getPusherClient()
  pusher.unsubscribe(channel)
}

export default getPusherClient

