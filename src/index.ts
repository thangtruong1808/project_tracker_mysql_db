/**
 * Server Entry Point
 * Initializes Express and Apollo GraphQL server with CORS support
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import './utils/loadEnv'
import express from 'express'
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
 * Allows frontend to connect from localhost:3000
 */
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}

// Apply CORS middleware to all routes
app.use(cors(corsOptions))

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

/**
 * Start the server and initialize database connection
 */
async function startServer() {
  await server.start()

  /**
   * GraphQL endpoint with CORS support
   * Handles all GraphQL queries and mutations
   */
  app.use(
    '/graphql',
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res }
      },
    })
  )

  const PORT = process.env.PORT || 4000

  /**
   * Start HTTP server and listen on specified port
   */
  httpServer.listen(PORT, () => {
    // Server started successfully
    console.log(`Server is running on port ${PORT}`)
  })

  /**
   * Test database connection on startup
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
}

/**
 * Handle server startup errors
 */
startServer().catch(() => {
  // Failed to start server
  console.error('Failed to start server')
  process.exit(1)
})

