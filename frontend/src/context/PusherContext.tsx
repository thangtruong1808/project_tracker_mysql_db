/**
 * PusherContext
 * Initializes Pusher connection and ensures channel is subscribed
 * Monitors connection state and handles reconnection
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
 * Monitors connection state and handles reconnection
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
       * Track connection state changes and handle reconnection
       * @author Thang Truong
       * @date 2025-12-09
       */
      const onConnected = async (): Promise<void> => {
        setIsConnected(true)
        try {
          await getSharedChannel()
          setChannelReady(true)
        } catch {
          setChannelReady(false)
        }
      }

      const onDisconnected = (): void => {
        setIsConnected(false)
        setChannelReady(false)
      }

      const onError = (): void => {
        setIsConnected(false)
        setChannelReady(false)
        if (client.connection.state === 'disconnected' || client.connection.state === 'failed') {
          setTimeout(() => {
            client.connect()
          }, 1000)
        }
      }

      client.connection.bind('connected', onConnected)
      client.connection.bind('disconnected', onDisconnected)
      client.connection.bind('error', onError)

      if (client.connection.state === 'connected') {
        await onConnected()
      } else if (client.connection.state === 'disconnected' || client.connection.state === 'failed') {
        client.connect()
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
