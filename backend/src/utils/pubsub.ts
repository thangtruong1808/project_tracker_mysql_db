/**
 * PubSub Utility
 * Simple event emitter for GraphQL subscriptions
 * Also publishes events to Pusher for real-time communication
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { publishPusherEvent } from './pusher'

type EventMap = { [key: string]: ((payload: unknown) => void)[] }

/**
 * Extract Pusher event name from internal event name
 * Removes the trailing ID and converts to lowercase
 * Examples:
 *   COMMENT_CREATED_1 -> comment_created
 *   COMMENT_LIKE_UPDATED_1 -> comment_like_updated
 *   NOTIFICATION_CREATED_123 -> notification_created
 *
 * @author Thang Truong
 * @date 2025-12-09
 * @param eventName - Internal event name with ID suffix
 * @returns Pusher event name without ID
 */
const extractPusherEventName = (eventName: string): string => {
  const parts = eventName.split('_')
  if (parts.length <= 1) return eventName.toLowerCase()
  const lastPart = parts[parts.length - 1]
  const isIdSuffix = /^\d+$/.test(lastPart)
  if (isIdSuffix) {
    return parts.slice(0, -1).join('_').toLowerCase()
  }
  return eventName.toLowerCase()
}

class PubSub {
  private events: EventMap = {}

  /**
   * Publish an event to all subscribers and Pusher
   * Publishes to both local subscribers and Pusher channels
   *
   * @author Thang Truong
   * @date 2025-12-09
   * @param eventName - Event name (e.g., 'COMMENT_CREATED_1')
   * @param payload - Event payload data
   */
  async publish(eventName: string, payload: unknown): Promise<void> {
    if (!this.events[eventName]) this.events[eventName] = []
    this.events[eventName].forEach((callback) => callback(payload))
    const channelName = 'project-tracker'
    const pusherEvent = extractPusherEventName(eventName)
    try {
      await publishPusherEvent(channelName, pusherEvent, { eventName, data: payload })
    } catch {
      // Silently handle Pusher errors
    }
  }

  /**
   * Subscribe to an event
   * @author Thang Truong
   * @date 2025-12-09
   */
  subscribe(eventName: string, callback: (payload: unknown) => void): () => void {
    if (!this.events[eventName]) this.events[eventName] = []
    this.events[eventName].push(callback)
    return () => {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback)
      if (this.events[eventName].length === 0) delete this.events[eventName]
    }
  }

  /**
   * Async iterator for GraphQL subscriptions
   * @author Thang Truong
   * @date 2025-12-09
   */
  asyncIterator<T>(eventName: string): AsyncIterable<T> {
    const pullQueue: Array<(value: IteratorResult<T>) => void> = []
    const pushQueue: T[] = []
    let listening = true
    const pushValue = (value: unknown) => {
      if (pullQueue.length !== 0) pullQueue.shift()?.({ value: value as T, done: false })
      else pushQueue.push(value as T)
    }
    const pullValue = (): Promise<IteratorResult<T>> => {
      return new Promise((resolve) => {
        if (pushQueue.length !== 0) resolve({ value: pushQueue.shift() as T, done: false })
        else pullQueue.push(resolve)
      })
    }
    const emptyQueue = () => {
      if (listening) {
        listening = false
        unsubscribe()
        pullQueue.forEach((resolve) => resolve({ value: undefined as T, done: true }))
        pullQueue.length = 0
        pushQueue.length = 0
      }
    }
    const unsubscribe = this.subscribe(eventName, pushValue)
    const iterator: AsyncIterator<T, T, undefined> = {
      next() { return listening ? pullValue() : Promise.resolve({ value: undefined as T, done: true }) },
      return() { emptyQueue(); return Promise.resolve({ value: undefined as T, done: true }) },
      throw(error: unknown) { emptyQueue(); return Promise.reject(error) },
    }
    return { [Symbol.asyncIterator]() { return iterator }, ...iterator } as AsyncIterable<T>
  }
}

export const pubsub = new PubSub()

