/**
 * Pusher Client Configuration
 * Uses HTTP transport for better Vercel compatibility
 * Ensures connection and channel are ready before use
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

/** Channel subscription promise @author Thang Truong @date 2025-12-09 */
let channelPromise: Promise<ReturnType<Pusher['subscribe']>> | null = null

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
 * Waits for Pusher connection to be established
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Promise that resolves when connected
 */
const waitForConnection = (): Promise<void> => {
  return new Promise((resolve) => {
    const client = getPusherClient()
    const state = client.connection.state
    if (state === 'connected') {
      resolve()
      return
    }
    const onConnected = (): void => {
      client.connection.unbind('connected', onConnected)
      resolve()
    }
    client.connection.bind('connected', onConnected)
    if (state === 'disconnected' || state === 'failed') {
      client.connect()
    }
  })
}

/**
 * Waits for channel subscription to complete
 * @author Thang Truong
 * @date 2025-12-09
 * @param channel - Channel to wait for
 * @returns Promise that resolves when subscribed
 */
const waitForChannelSubscription = (channel: ReturnType<Pusher['subscribe']>): Promise<void> => {
  return new Promise((resolve) => {
    if (channel.subscribed) {
      resolve()
      return
    }
    const onSubscribed = (): void => {
      channel.unbind('pusher:subscription_succeeded', onSubscribed)
      resolve()
    }
    channel.bind('pusher:subscription_succeeded', onSubscribed)
  })
}

/**
 * Gets or creates shared channel instance
 * Waits for connection and subscription before returning
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Promise that resolves to shared channel object
 */
export const getSharedChannel = async (): Promise<ReturnType<Pusher['subscribe']>> => {
  if (sharedChannel && sharedChannel.subscribed) return sharedChannel
  if (channelPromise) return channelPromise

  channelPromise = (async () => {
    await waitForConnection()
    const pusher = getPusherClient()
    if (!sharedChannel) {
      sharedChannel = pusher.subscribe(CHANNEL_NAME)
    }
    await waitForChannelSubscription(sharedChannel)
    return sharedChannel
  })()

  return channelPromise
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
 * Waits for channel to be ready before binding
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
  let isUnsubscribed = false
  let channel: ReturnType<Pusher['subscribe']> | null = null

  getSharedChannel().then((ch) => {
    if (isUnsubscribed) return
    channel = ch
    channel.bind(event, callback)
  })

  return () => {
    isUnsubscribed = true
    if (channel) {
      channel.unbind(event, callback)
    }
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
    channelPromise = null
  }
}

export default getPusherClient
