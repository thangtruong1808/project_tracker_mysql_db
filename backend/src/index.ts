/**
 * Server Entry Point
 * Initializes Express and Apollo GraphQL server with CORS support
 *
 * @author Thang Truong
 * @date 2025-12-04
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
import { setupWebSocketServer } from './server/websocketSetup'
import { testDatabaseConnection } from './server/databaseConnection'
import { isPusherAvailable } from './utils/pusher'

const app = express()
const httpServer = createServer(app)

// Parse cookies from requests (needed for HTTP-only refresh token cookies)
app.use(cookieParser())

/**
 * Configure CORS options with credentials support for cross-origin cookies
 * Allows frontend to connect from localhost or Vercel domains
 * Uses dynamic origin to support cross-origin Set-Cookie headers
 *
 * @author Thang Truong
 * @date 2025-12-09
 */
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: string | boolean) => void) => {
    if (!origin) {
      callback(null, true)
      return
    }
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[]
    const isVercelDomain = origin.includes('.vercel.app') || origin.includes('vercel.app')
    if (allowedOrigins.includes(origin) || isVercelDomain) {
      callback(null, origin)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}

// Apply CORS middleware to all routes
app.use(cors(corsOptions))

let wsServerCleanup: any = null

/**
 * Apollo Server configuration
 * Handles GraphQL queries, mutations, and subscriptions
 * Includes error formatting for better client-side error messages
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // Format errors to provide helpful messages to the client
    // @author Thang Truong
    // @date 2025-01-27
    const message = error.message || 'An error occurred'
    const code = error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    
    return {
      message,
      extensions: {
        code,
        ...error.extensions,
      },
    }
  },
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
 * @date 2025-12-04
 */
async function startServer(): Promise<void> {
  try {
    await server.start()

    /**
     * GraphQL endpoint with CORS support
     * Handles all GraphQL queries and mutations
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    /**
     * Root endpoint - provides API information
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    app.get('/', (req: Request, res: Response) => {
      res.json({ 
        message: 'GraphQL API is running. Use /graphql endpoint.',
        graphql: '/graphql',
        status: 'online'
      })
    })

    /**
     * Handle OPTIONS preflight requests for GraphQL endpoint
     * CORS middleware already handles this, but explicit handler ensures compatibility
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    app.options('/graphql', cors(corsOptions))

    /**
     * GraphQL endpoint with CORS support
     * Handles all GraphQL queries and mutations
     * CORS middleware is already applied globally, but explicit application ensures proper headers
     * express.json() must come before expressMiddleware to parse request body correctly
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    app.use(
      '/graphql',
      cors(corsOptions),
      express.json({ limit: '10mb', type: 'application/json' }),
      expressMiddleware(server, {
        context: async ({ req, res }: { req: Request; res: Response }) => {
          return { req, res }
        },
      })
    )

    const PORT = parseInt(process.env.PORT || '4000', 10)

    /**
     * Start HTTP server and listen on specified port
     * Railway requires listening on 0.0.0.0 and uses PORT environment variable
     * Must be done before WebSocket server setup
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    await new Promise<void>((resolve, reject) => {
      // Render requires binding to 0.0.0.0, not just localhost
      httpServer.listen(PORT, '0.0.0.0', () => {
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
     * Railway supports WebSockets, but Vercel frontend cannot use them
     * Subscriptions will fall back to HTTP polling when accessed from Vercel
     * Setup is optional - HTTP server will work even if WebSocket fails
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    wsServerCleanup = setupWebSocketServer(httpServer)

    /**
     * Test database connection on startup with retry logic
     * FreeSQLDatabase may need multiple connection attempts
     * Extended timeout for Render free tier which may have slower network
     * Server starts even if DB connection is slow (non-blocking)
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    // Start database connection test in background (non-blocking)
    // Server will be available even if database connection is slow
    testDatabaseConnection().catch((error) => {
      console.error('Database connection test error:', error)
      // Don't exit - let server continue running
    })

    /**
     * Log Pusher configuration status for real-time features
     * @author Thang Truong
     * @date 2025-12-09
     */
    const pusherStatus = isPusherAvailable()
    console.log(`Pusher real-time: ${pusherStatus ? 'ENABLED' : 'DISABLED (check PUSHER_* env vars)'}`)
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
 * @date 2025-12-04
 */
startServer().catch((error) => {
  // Failed to start server
  console.error('Failed to start server:', error)
  process.exit(1)
})

