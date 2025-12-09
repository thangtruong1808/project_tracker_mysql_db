/**
 * Pusher Configuration Utility
 * Initializes and exports Pusher instance for real-time events
 * Uses environment variables for configuration
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import Pusher from 'pusher'

/** Track if Pusher is configured @author Thang Truong @date 2025-12-09 */
let isPusherConfigured = false

/**
 * Get Pusher configuration from environment variables
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Pusher configuration object or null if not configured
 */
const getPusherConfig = (): { appId: string; key: string; secret: string; cluster: string; useTLS: boolean } | null => {
  const appId = process.env.PUSHER_APP_ID || process.env.APP_ID
  const key = process.env.PUSHER_KEY || process.env.KEY
  const secret = process.env.PUSHER_SECRET || process.env.SECRET
  const cluster = process.env.PUSHER_CLUSTER || process.env.CLUSTER || 'ap4'
  if (!appId || !key || !secret) return null
  return {
    appId: String(appId).trim().replace(/^["']|["']$/g, ''),
    key: String(key).trim().replace(/^["']|["']$/g, ''),
    secret: String(secret).trim().replace(/^["']|["']$/g, ''),
    cluster: String(cluster).trim().replace(/^["']|["']$/g, ''),
    useTLS: true,
  }
}

/** Singleton Pusher instance @author Thang Truong @date 2025-12-09 */
let pusherInstance: Pusher | null = null

/**
 * Get or create Pusher instance
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Pusher instance or mock if not configured
 */
export const getPusher = (): Pusher => {
  if (pusherInstance) return pusherInstance
  const config = getPusherConfig()
  if (!config) {
    isPusherConfigured = false
    return { trigger: async () => {} } as unknown as Pusher
  }
  try {
    pusherInstance = new Pusher(config)
    isPusherConfigured = true
    return pusherInstance
  } catch {
    isPusherConfigured = false
    return { trigger: async () => {} } as unknown as Pusher
  }
}

/**
 * Check if Pusher is configured
 * @author Thang Truong
 * @date 2025-12-09
 */
export const isPusherAvailable = (): boolean => {
  if (!pusherInstance) getPusher()
  return isPusherConfigured
}

/**
 * Publish event to Pusher channel
 * @author Thang Truong
 * @date 2025-12-09
 * @param channel - Pusher channel name
 * @param event - Event name
 * @param data - Event data payload
 */
export const publishPusherEvent = async (channel: string, event: string, data: unknown): Promise<void> => {
  try {
    const pusher = getPusher()
    await pusher.trigger(channel, event, data)
  } catch {
    // Silently handle Pusher errors
  }
}

export default getPusher

