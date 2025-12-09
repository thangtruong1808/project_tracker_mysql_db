/**
 * Pusher Client Configuration
 * Uses HTTP transport for better Vercel compatibility
 * Ensures connection and channel are ready before use
 * Handles reconnection and maintains stable subscriptions
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import Pusher from 'pusher-js'

let isPusherConfigured = false
let pusherClient: Pusher | null = null
let sharedChannel: ReturnType<Pusher['subscribe']> | null = null
let channelPromise: Promise<ReturnType<Pusher['subscribe']>> | null = null
const eventBindings: Map<string, Array<(data: unknown) => void>> = new Map()
const CHANNEL_NAME = 'project-tracker'

/**
 * Retrieves Pusher configuration from environment variables
 * @author Thang Truong
 * @date 2025-12-09
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
      /** Prefer secure WebSocket; Pusher will retry as needed */
      enabledTransports: ['ws', 'wss'],
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
 * Rebind all events after channel reconnection
 * @author Thang Truong
 * @date 2025-12-09
 */
const rebindAllEvents = (): void => {
  if (!sharedChannel) return
  eventBindings.forEach((callbacks, event) => {
    callbacks.forEach((callback) => {
      sharedChannel?.bind(event, callback)
    })
  })
}

/**
 * Gets or creates shared channel instance
 * Waits for connection and subscription before returning
 * Handles reconnection automatically
 * @author Thang Truong
 * @date 2025-12-09
 */
export const getSharedChannel = async (): Promise<ReturnType<Pusher['subscribe']>> => {
  if (sharedChannel && sharedChannel.subscribed) return sharedChannel
  if (channelPromise) return channelPromise

  channelPromise = (async () => {
    await waitForConnection()
    const pusher = getPusherClient()
    if (!sharedChannel) {
      sharedChannel = pusher.subscribe(CHANNEL_NAME)
      sharedChannel.bind('pusher:subscription_succeeded', rebindAllEvents)
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
 * Binds immediately - Pusher queues events if channel not ready
 * Tracks bindings for reconnection handling
 * @author Thang Truong
 * @date 2025-12-09
 */
export const subscribeToPusherEvent = (
  _channel: string,
  event: string,
  callback: (data: unknown) => void
): (() => void) => {
  let isUnsubscribed = false
  if (!eventBindings.has(event)) {
    eventBindings.set(event, [])
  }
  eventBindings.get(event)!.push(callback)

  /**
   * Bind event immediately - Pusher will queue if channel not ready
   * @author Thang Truong
   * @date 2025-12-09
   */
  const bindEvent = (channel: ReturnType<Pusher['subscribe']>): void => {
    if (isUnsubscribed) return
    channel.bind(event, callback)
  }

  if (sharedChannel) {
    bindEvent(sharedChannel)
  } else {
    getSharedChannel().then(bindEvent)
  }

  return () => {
    isUnsubscribed = true
    const callbacks = eventBindings.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        eventBindings.delete(event)
      }
    }
    if (sharedChannel) {
      sharedChannel.unbind(event, callback)
    }
  }
}

/**
 * Unsubscribes from Pusher channel
 * @author Thang Truong
 * @date 2025-12-09
 */
export const unsubscribeFromPusherChannel = (_channel: string): void => {
  if (pusherClient && sharedChannel) {
    pusherClient.unsubscribe(CHANNEL_NAME)
    sharedChannel = null
    channelPromise = null
    eventBindings.clear()
  }
}

export default getPusherClient
