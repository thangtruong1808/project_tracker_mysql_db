/**
 * WebSocket Server Setup
 * Sets up WebSocket server for GraphQL subscriptions
 * Optional - HTTP server continues if WebSocket setup fails
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { Server } from 'http'

/**
 * Setup WebSocket server for GraphQL subscriptions
 * Set up after HTTP server is listening
 * Handles real-time comment updates
 * Setup is optional - HTTP server will work even if WebSocket fails
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param httpServer - HTTP server instance to attach WebSocket to
 * @returns WebSocket server cleanup function or null if setup fails
 */
export const setupWebSocketServer = (httpServer: Server): any => {
  try {
    /**
     * Import WebSocket dependencies using require for CommonJS compatibility
     * WebSocket setup is optional - HTTP server continues if this fails
     * Use package exports path which maps to CommonJS file automatically
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require('ws')
    // Use package exports path - Node.js will resolve to correct CommonJS file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const graphqlWsUseWs = require('graphql-ws/use/ws')
    const { useServer } = graphqlWsUseWs
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { executableSchema } = require('../schemaExecutable') as { executableSchema: any }

    const { WebSocketServer } = ws

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    })

    /**
     * WebSocket server cleanup handler
     * Properly disposes WebSocket connections on server shutdown
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    const wsServerCleanup = useServer(
      {
        schema: executableSchema as any,
        context: async (ctx: any) => {
          // Extract token from connectionParams for subscription authentication
          const authToken = (ctx.connectionParams?.authorization || ctx.connectionParams?.authToken) as string
          let userId: number | null = null
          
          if (authToken) {
            // Remove 'Bearer ' prefix if present
            const token = authToken.startsWith('Bearer ') ? authToken.substring(7) : authToken
            
            // Import verifyAccessToken dynamically
            const { verifyAccessToken } = await import('../utils/auth')
            
            try {
              const decoded = verifyAccessToken(token)
              if (decoded && decoded.userId) {
                userId = decoded.userId
              }
            } catch (error) {
              // Handle invalid token for subscriptions - allow connection but userId will be null
            }
          }
          
          return {
            req: ctx.extra.request,
            userId,
          }
        },
      },
      wsServer
    )

    return wsServerCleanup
  } catch (wsError: any) {
    // WebSocket setup failed - HTTP server continues running
    // Error logging removed per requirements (only index.ts can have console.log)
    return null
  }
}

