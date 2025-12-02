/**
 * usePusherSubscription Hook
 * Custom hook for subscribing to Pusher events
 * Replaces GraphQL subscriptions with Pusher for real-time updates
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useEffect, useRef } from 'react'
import { subscribeToPusherEvent, unsubscribeFromPusherChannel } from '../lib/pusher'

interface UsePusherSubscriptionOptions {
  channel: string
  event: string
  onEvent: (data: any) => Promise<void> | void
  enabled?: boolean
}

/**
 * Subscribe to Pusher channel and event
 * Automatically unsubscribes on unmount or when dependencies change
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param options - Subscription options
 * @param options.channel - Pusher channel name
 * @param options.event - Event name to listen for
 * @param options.onEvent - Callback function when event is received
 * @param options.enabled - Whether subscription is enabled (default: true)
 */
export const usePusherSubscription = ({
  channel,
  event,
  onEvent,
  enabled = true,
}: UsePusherSubscriptionOptions): void => {
  const callbackRef = useRef(onEvent)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Subscribe to Pusher event
    const unsubscribe = subscribeToPusherEvent(channel, event, async (data: any) => {
      // Call the latest callback
      await callbackRef.current(data)
    })

    unsubscribeRef.current = unsubscribe

    // Cleanup on unmount or when dependencies change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [channel, event, enabled])
}

/**
 * Subscribe to multiple Pusher events
 * Convenience hook for subscribing to multiple events on the same channel
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param channel - Pusher channel name
 * @param events - Array of event names and their callbacks
 * @param enabled - Whether subscriptions are enabled
 */
export const usePusherSubscriptions = (
  channel: string,
  events: Array<{ event: string; onEvent: (data: any) => Promise<void> | void }>,
  enabled = true
): void => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const unsubscribes: Array<() => void> = []

    // Subscribe to all events
    events.forEach(({ event, onEvent }) => {
      const unsubscribe = subscribeToPusherEvent(channel, event, async (data: any) => {
        await onEvent(data)
      })
      unsubscribes.push(unsubscribe)
    })

    // Cleanup all subscriptions
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
      unsubscribeFromPusherChannel(channel)
    }
  }, [channel, enabled, JSON.stringify(events)])
}

