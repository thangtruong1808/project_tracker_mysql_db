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
import { setupWebSocketServer } from './server/websocketSetup'
import { testDatabaseConnection } from './server/databaseConnection'

const app = express()
const httpServer = createServer(app)

// Parse cookies from requests (needed for HTTP-only refresh token cookies)
app.use(cookieParser())

/**
 * Configure CORS options
 * Allows frontend to connect from localhost:3000 or production frontend URL
 * Frontend URL can be set via FRONTEND_URL environment variable (Render frontend URL)
 * Also includes hardcoded production frontend URL as fallback
 * Render supports WebSockets, so subscriptions will work
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://project-tracker-frontend-ff0t.onrender.com', // Production frontend URL
    process.env.FRONTEND_URL, // Render frontend URL from environment variable
  ].filter(Boolean) as string[], // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
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
 * @date 2025-01-27
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
    /**
     * Root endpoint - provides API information
     *
     * @author Thang Truong
     * @date 2025-01-27
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
     * @date 2025-01-27
     */
    app.options('/graphql', cors(corsOptions))

    /**
     * GraphQL endpoint with CORS support
     * Handles all GraphQL queries and mutations
     * CORS middleware is already applied globally, but explicit application ensures proper headers
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

    const PORT = parseInt(process.env.PORT || '4000', 10)

    /**
     * Start HTTP server and listen on specified port
     * Render requires listening on 0.0.0.0 or the PORT environment variable
     * Must be done before WebSocket server setup
     *
     * @author Thang Truong
     * @date 2025-01-27
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
     * Render supports WebSockets, so subscriptions will work (unlike Vercel)
     * Setup is optional - HTTP server will work even if WebSocket fails
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    wsServerCleanup = setupWebSocketServer(httpServer)

    /**
     * Test database connection on startup with retry logic
     * FreeSQLDatabase may need multiple connection attempts
     * Extended timeout for Render free tier which may have slower network
     * Server starts even if DB connection is slow (non-blocking)
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
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

