/**
 * PubSub Utility
 * Simple event emitter for GraphQL subscriptions
 * Also publishes events to Pusher for real-time communication
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { publishPusherEvent } from './pusher'

type EventMap = {
  [key: string]: any[]
}

class PubSub {
  private events: EventMap = {}

  /**
   * Publish an event to all subscribers and Pusher
   * Publishes to both local subscribers and Pusher channels
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param eventName - Event name (e.g., 'COMMENT_CREATED_1')
   * @param payload - Event payload data
   */
  publish(eventName: string, payload: any): void {
    // Publish to local subscribers
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].forEach((callback) => {
      callback(payload)
    })

    // Publish to Pusher for real-time communication
    // Extract channel and event from eventName
    // Format: EVENT_TYPE_ID -> channel: 'project-tracker', event: 'event_type'
    const channelName = 'project-tracker'
    const parts = eventName.split('_')
    const pusherEvent = parts.length >= 2 
      ? `${parts[0]}_${parts[1]}`.toLowerCase() // e.g., 'COMMENT_CREATED_1' -> 'comment_created'
      : eventName.toLowerCase()
    
    // Publish to Pusher asynchronously (don't await to avoid blocking)
    publishPusherEvent(channelName, pusherEvent, {
      eventName,
      data: payload,
    }).catch(() => {
      // Silently handle Pusher errors
    })
  }

  /**
   * Subscribe to an event
   * @author Thang Truong
   * @date 2025-01-27
   */
  subscribe(eventName: string, callback: (payload: any) => void): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(callback)

    return () => {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback)
      if (this.events[eventName].length === 0) {
        delete this.events[eventName]
      }
    }
  }

  /**
   * Async iterator for GraphQL subscriptions
   * @author Thang Truong
   * @date 2025-01-27
   */
  asyncIterator<T>(eventName: string): AsyncIterable<T> {
    const pullQueue: Array<(value: IteratorResult<T>) => void> = []
    const pushQueue: T[] = []
    let listening = true

    const pushValue = (value: T) => {
      if (pullQueue.length !== 0) {
        pullQueue.shift()?.({ value, done: false })
      } else {
        pushQueue.push(value)
      }
    }

    const pullValue = (): Promise<IteratorResult<T>> => {
      return new Promise((resolve) => {
        if (pushQueue.length !== 0) {
          const value = pushQueue.shift()
          resolve({ value: value as T, done: false })
        } else {
          pullQueue.push(resolve)
        }
      })
    }

    const emptyQueue = () => {
      if (listening) {
        listening = false
        unsubscribe()
        pullQueue.forEach((resolve) => resolve({ value: undefined as any, done: true }))
        pullQueue.length = 0
        pushQueue.length = 0
      }
    }

    const unsubscribe = this.subscribe(eventName, pushValue)

    const iterator: AsyncIterator<T, any, undefined> = {
      next() {
        return listening ? pullValue() : Promise.resolve({ value: undefined as any, done: true })
      },
      return() {
        emptyQueue()
        return Promise.resolve({ value: undefined as any, done: true })
      },
      throw(error: any) {
        emptyQueue()
        return Promise.reject(error)
      },
    }

    return {
      [Symbol.asyncIterator]() {
        return iterator
      },
      ...iterator,
    } as AsyncIterable<T>
  }
}

export const pubsub = new PubSub()

