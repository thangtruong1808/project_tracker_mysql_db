/**
 * Vercel Serverless Function for GraphQL API
 * Handles GraphQL requests for Vercel deployment
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

// @ts-ignore - Vercel types may not be available during build
import type { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'

// Import environment loader first
import '../src/utils/loadEnv'

/**
 * GraphQL context interface
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
interface Context {
  req: express.Request
  res: express.Response
}

let apolloServer: ApolloServer<Context> | null = null
let app: express.Application | null = null

/**
 * Initialize Apollo Server and Express app
 * Lazy loads schema and resolvers to avoid database connection at module load
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
async function initializeApp() {
  if (app && apolloServer) return { app, server: apolloServer }

  try {
    // Lazy import schema and resolvers to avoid database connection at module load
    const { typeDefs } = await import('../src/schema')
    const { resolvers } = await import('../src/resolvers')

    // Initialize Apollo Server
    const server = new ApolloServer<Context>({
      typeDefs,
      resolvers,
    })

    await server.start()
    apolloServer = server

    // Create Express app
    app = express()

    // Parse cookies
    app.use(cookieParser())

    // Configure CORS - allow all origins in production
    app.use(cors({
      origin: true,
      credentials: true,
    }))

    // Handle root path - must be before GraphQL middleware
    app.get('/', (req: express.Request, res: express.Response) => {
      res.json({ message: 'GraphQL API is running. Use /graphql endpoint.' })
    })

    // Apply GraphQL middleware only to /graphql path
    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }: { req: express.Request; res: express.Response }) => {
          return { req, res }
        },
      })
    )

    return { app, server: apolloServer }
  } catch (error: any) {
    // Return error response if initialization fails
    throw new Error(`Failed to initialize server: ${error.message}`)
  }
}

/**
 * Vercel serverless function handler
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { app: expressApp } = await initializeApp()

    // Handle root path directly if request is for root
    if (req.url === '/' || req.url === '') {
      res.status(200).json({ message: 'GraphQL API is running. Use /graphql endpoint.' })
      return
    }

    // Convert Vercel request/response to Express format
    return new Promise<void>((resolve, reject) => {
      expressApp!(req as any, res as any, (err: any) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  } catch (error: any) {
    // Return error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred',
    })
  }
}

