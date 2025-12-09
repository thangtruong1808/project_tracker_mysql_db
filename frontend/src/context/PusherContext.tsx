/**
 * PusherContext
 * Provides Pusher client initialization at app level
 * Ensures stable connection across component re-renders
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { getPusherClient, isPusherAvailable } from '../lib/pusher'

interface PusherContextValue {
  isConnected: boolean
}

const PusherContext = createContext<PusherContextValue>({ isConnected: false })

interface PusherProviderProps {
  children: ReactNode
}

/**
 * PusherProvider Component
 * Initializes Pusher connection once at app startup
 * @author Thang Truong
 * @date 2025-12-09
 */
export const PusherProvider = ({ children }: PusherProviderProps): JSX.Element => {
  const initialized = useRef(false)
  const isConnected = useRef(false)

  /**
   * Initialize Pusher connection on mount
   * Only initializes once to prevent multiple connections
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initPusher = async (): Promise<void> => {
      if (isPusherAvailable()) {
        const client = getPusherClient()
        client.connection.bind('connected', () => {
          isConnected.current = true
        })
        client.connection.bind('disconnected', () => {
          isConnected.current = false
        })
      }
    }

    initPusher()
  }, [])

  return (
    /* Pusher context provider wrapper */
    <PusherContext.Provider value={{ isConnected: isConnected.current }}>
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

