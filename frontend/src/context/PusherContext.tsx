/**
 * PusherContext
 * Initializes Pusher connection and channel subscription at app level
 * Ensures everything is ready before components use Pusher
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
       * Track connection state changes
       * @author Thang Truong
       * @date 2025-12-09
       */
      const onConnected = (): void => {
        setIsConnected(true)
      }
      const onDisconnected = (): void => {
        setIsConnected(false)
        setChannelReady(false)
      }

      client.connection.bind('connected', onConnected)
      client.connection.bind('disconnected', onDisconnected)

      if (client.connection.state === 'connected') {
        setIsConnected(true)
      } else if (client.connection.state === 'disconnected' || client.connection.state === 'failed') {
        client.connect()
      }

      /**
       * Wait for connection then subscribe to channel
       * @author Thang Truong
       * @date 2025-12-09
       */
      try {
        await getSharedChannel()
        setChannelReady(true)
      } catch {
        // Channel subscription failed - components will handle gracefully
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
