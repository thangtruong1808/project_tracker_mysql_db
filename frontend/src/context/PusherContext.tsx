/**
 * PusherContext
 * Initializes Pusher connection and ensures channel is subscribed
 * Provides connection state to child components
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { getPusherClient, isPusherAvailable, getSharedChannel } from '../lib/pusher'

interface PusherContextValue {
  isConnected: boolean
  channelReady: boolean
}

const PusherContext = createContext<PusherContextValue>({ isConnected: false, channelReady: false })

interface PusherProviderProps {
  children: ReactNode
}

/**
 * PusherProvider Component
 * Initializes Pusher connection and channel subscription once at app startup
 * @author Thang Truong
 * @date 2025-12-09
 */
export const PusherProvider = ({ children }: PusherProviderProps): JSX.Element => {
  const initialized = useRef(false)
  const [isConnected, setIsConnected] = useState(false)
  const [channelReady, setChannelReady] = useState(false)

  /**
   * Initialize Pusher connection and channel on mount
   * Only initializes once to prevent multiple connections
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initPusher = async (): Promise<void> => {
      if (!isPusherAvailable()) return

      const client = getPusherClient()

      /**
       * Wait for connection before subscribing to channel
       * @author Thang Truong
       * @date 2025-12-09
       */
      const waitForConnection = (): Promise<void> => {
        return new Promise((resolve) => {
          const state = client.connection.state
          if (state === 'connected') {
            setIsConnected(true)
            resolve()
            return
          }

          const onConnected = (): void => {
            setIsConnected(true)
            client.connection.unbind('connected', onConnected)
            resolve()
          }

          client.connection.bind('connected', onConnected)

          if (state === 'disconnected' || state === 'failed') {
            client.connect()
          } else if (state === 'connecting') {
            // Already connecting, just wait
          }
        })
      }

      try {
        await waitForConnection()

        /**
         * Subscribe to channel after connection is established
         * @author Thang Truong
         * @date 2025-12-09
         */
        const channel = getSharedChannel()
        channel.bind('pusher:subscription_succeeded', () => {
          setChannelReady(true)
        })

        // If already subscribed, mark as ready
        if (channel.subscribed) {
          setChannelReady(true)
        }
      } catch {
        // Connection failed - components will use mock client
      }
    }

    initPusher()
  }, [])

  return (
    /* Pusher context provider wrapper */
    <PusherContext.Provider value={{ isConnected, channelReady }}>
      {children}
    </PusherContext.Provider>
  )
}

/**
 * Hook to access Pusher context
 * @author Thang Truong
 * @date 2025-12-09
 */
export const usePusher = (): PusherContextValue => useContext(PusherContext)

export default PusherProvider
