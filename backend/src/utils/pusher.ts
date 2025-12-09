/**
 * Pusher Configuration Utility
 * Initializes and exports Pusher instance for real-time events
 * Uses environment variables for configuration
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import Pusher from 'pusher'

/**
 * Get Pusher configuration from environment variables
 * Supports both PUSHER_* and non-prefixed variable names
 * Validates required environment variables are set
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Pusher configuration object
 * @throws Error if required environment variables are missing
 */
const getPusherConfig = () => {
  // Support both PUSHER_APP_ID and APP_ID for flexibility
  const appId = process.env.PUSHER_APP_ID || process.env.APP_ID
  const key = process.env.PUSHER_KEY || process.env.KEY
  const secret = process.env.PUSHER_SECRET || process.env.SECRET
  const cluster = process.env.PUSHER_CLUSTER || process.env.CLUSTER || 'mt1'

  if (!appId || !key || !secret) {
    throw new Error(
      'Pusher configuration missing. Please set PUSHER_APP_ID (or APP_ID), PUSHER_KEY (or KEY), and PUSHER_SECRET (or SECRET) in your .env file.'
    )
  }

  // Clean and validate configuration values
  const cleanAppId = appId.trim().replace(/^["']|["']$/g, '')
  const cleanKey = key.trim().replace(/^["']|["']$/g, '')
  const cleanSecret = secret.trim().replace(/^["']|["']$/g, '')
  const cleanCluster = cluster.trim().replace(/^["']|["']$/g, '')

  return {
    appId: cleanAppId,
    key: cleanKey,
    secret: cleanSecret,
    cluster: cleanCluster,
    useTLS: true,
  }
}

/**
 * Initialize Pusher instance
 * Creates singleton Pusher instance for publishing events
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Pusher instance or null if configuration is invalid
 */
let pusherInstance: Pusher | null = null

/**
 * Get or create Pusher instance
 * Returns singleton instance, creating it if it doesn't exist
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Pusher instance
 */
export const getPusher = (): Pusher => {
  if (pusherInstance) {
    return pusherInstance
  }

  try {
    const config = getPusherConfig()
    pusherInstance = new Pusher(config)
    return pusherInstance
  } catch (error) {
    // If Pusher initialization fails, return a mock object
    // This allows the app to continue without Pusher
    return {
      trigger: async () => {
        // Mock trigger - does nothing
      },
    } as any
  }
}

/**
 * Publish event to Pusher channel
 * Wrapper function for triggering Pusher events
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param channel - Pusher channel name
 * @param event - Event name
 * @param data - Event data payload
 */
export const publishPusherEvent = async (
  channel: string,
  event: string,
  data: any
): Promise<void> => {
  try {
    const pusher = getPusher()
    await pusher.trigger(channel, event, data)
  } catch (error) {
    // Silently handle Pusher errors to prevent app crashes
    // Events will be lost but app continues to function
  }
}

export default getPusher

