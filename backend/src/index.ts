/**
 * Server Entry Point
 * Initializes Express and Apollo GraphQL server with CORS support
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import './utils/loadEnv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { createServer } from 'http'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { db } from './db'
import { ensureActivityLogTargetUsers } from './utils/activityLogMaintenance'

const app = express()
const httpServer = createServer(app)

// Parse cookies from requests (needed for HTTP-only refresh token cookies)
app.use(cookieParser())

/**
 * Configure CORS options
 * Allows frontend to connect from localhost:3000 or production frontend URL
 * Frontend URL can be set via FRONTEND_URL environment variable
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[], // Remove undefined values
  credentials: true,
}

// Apply CORS middleware to all routes
app.use(cors(corsOptions))

let wsServerCleanup: any = null

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            if (wsServerCleanup) {
              await wsServerCleanup.dispose()
            }
          },
        }
      },
    },
  ],
})

/**
 * Start the server and initialize database connection
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
async function startServer(): Promise<void> {
  try {
    await server.start()

    /**
     * GraphQL endpoint with CORS support
     * Handles all GraphQL queries and mutations
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    app.use(
      '/graphql',
      cors(corsOptions),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }: { req: Request; res: Response }) => {
          return { req, res }
        },
      })
    )

    const PORT = process.env.PORT || 4000

    /**
     * Start HTTP server and listen on specified port
     * Must be done before WebSocket server setup
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    await new Promise<void>((resolve, reject) => {
      httpServer.listen(PORT, () => {
        // Server started successfully
        console.log(`Server is running on port ${PORT}`)
        resolve()
      })
      httpServer.on('error', reject)
    })

    /**
     * WebSocket server for GraphQL subscriptions
     * Set up after HTTP server is listening
     * Handles real-time comment updates
     * Setup is optional - HTTP server will work even if WebSocket fails
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    try {
      /**
       * Import WebSocket dependencies using require for CommonJS compatibility
       * WebSocket setup is optional - HTTP server continues if this fails
       * Use package exports path which maps to CommonJS file automatically
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ws = require('ws')
      // Use package exports path - Node.js will resolve to correct CommonJS file
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const graphqlWsUseWs = require('graphql-ws/use/ws')
      const { useServer } = graphqlWsUseWs
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { executableSchema } = require('./schemaExecutable') as { executableSchema: any }

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
       * @date 2025-01-27
       */
      wsServerCleanup = useServer(
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
              const { verifyAccessToken } = await import('./utils/auth')
              
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
    } catch (wsError: any) {
      // WebSocket setup failed - log but don't crash HTTP server
      console.error('WebSocket server setup failed (HTTP server still running):', wsError?.message || wsError)
    }

    /**
     * Test database connection on startup
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    try {
      await db.query('SELECT 1')
      await ensureActivityLogTargetUsers()
      // Database connection successful
    } catch (error) {
      // Database connection failed
      console.error('Database connection failed', error)
      process.exit(1)
    }
  } catch (error) {
    // Failed to start server
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

/**
 * Handle server startup errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
startServer().catch((error) => {
  // Failed to start server
  console.error('Failed to start server:', error)
  process.exit(1)
})

