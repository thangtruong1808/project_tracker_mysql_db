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
     * Test database connection on startup with retry logic
     * Hostinger databases may need multiple connection attempts
     * Extended timeout for Render free tier which may have slower network
     * Server starts even if DB connection is slow (non-blocking)
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    // Start database connection test in background (non-blocking)
    // This allows server to start even if database connection is slow
    const testDatabaseConnection = async (): Promise<void> => {
      const maxRetries = 10
      let lastError: any = null
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Test database connection with extended timeout for remote databases
          // Increased to 180 seconds to account for Render free tier network delays
          const connectionTest = Promise.race([
            db.query('SELECT 1'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection test timeout after 180 seconds')), 180000)
            )
          ])
          
          await connectionTest
          await ensureActivityLogTargetUsers()
          // Database connection successful
          console.log('Database connection established successfully')
          return
        } catch (error: any) {
          lastError = error
          const errorMessage = error?.message || 'Unknown database connection error'
          
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff with longer delays)
            const waitTime = attempt * 5000 // 5s, 10s, 15s, 20s, etc.
            console.error(`Database connection attempt ${attempt} failed. Retrying in ${waitTime}ms...`)
            console.error('Error:', errorMessage)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          } else {
            // Final attempt failed - log error but don't crash server
            // Server will continue running and retry on next request
            console.error(`Database connection failed after ${maxRetries} attempts:`)
            console.error('Error message:', errorMessage)
            if (error?.code) {
              console.error('Error code:', error.code)
            }
            if (error?.errno) {
              console.error('Error number:', error.errno)
            }
            if (error?.sqlState) {
              console.error('SQL State:', error.sqlState)
            }
            console.error('\nTroubleshooting steps:')
            console.error('1. Verify database credentials in Render environment variables')
            console.error('2. Check if Hostinger database allows external connections (Remote MySQL with % host)')
            console.error('3. Try setting DB_SSL_REJECT_UNAUTHORIZED=false in environment variables')
            console.error('4. Verify database host IP (82.180.142.51) and port (3306) are correct')
            console.error('5. Check if Hostinger firewall allows connections from Render IPs')
            console.error('6. Render free tier may have network restrictions - consider upgrading')
            console.error('\nServer is running but database connection failed. It will retry on next request.')
          }
        }
      }
    }
    
    // Start database connection test in background (non-blocking)
    // Server will be available even if database connection is slow
    testDatabaseConnection().catch((error) => {
      console.error('Database connection test error:', error)
      // Don't exit - let server continue running
    })
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

