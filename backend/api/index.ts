/**
 * Vercel Serverless Function Handler
 * Exports Express app as serverless function for Vercel
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import '../src/utils/loadEnv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from '../src/schema'
import { resolvers } from '../src/resolvers'

const app = express()

// Parse cookies from requests
app.use(cookieParser())

/**
 * Configure CORS options for Vercel
 * Allows frontend to connect from Vercel domains
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type'],
}

// Apply CORS middleware
app.use(cors(corsOptions))

/**
 * Apollo Server configuration
 * Handles GraphQL queries and mutations
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
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
})

// Initialize Apollo Server
let serverStarted = false

/**
 * Initialize server and setup routes
 * Called once when first request arrives
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
async function initializeServer(): Promise<void> {
  if (serverStarted) {
    return
  }

  await server.start()

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
   * Handle OPTIONS preflight requests
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  app.options('/graphql', cors(corsOptions))

  /**
   * GraphQL endpoint
   * express.json() must come before expressMiddleware to parse request body
   * CORS middleware ensures proper headers for cross-origin requests
   *
   * @author Thang Truong
   * @date 2025-01-27
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

  serverStarted = true
}

/**
 * Vercel serverless function handler
 * Exports Express app for Vercel
 * Handles all routes including /graphql
 * Properly processes requests in serverless context
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    // Ensure server is initialized
    await initializeServer()
    
    // Handle favicon.ico requests to prevent 404 errors
    if (req.url === '/favicon.ico') {
      res.status(204).end()
      return
    }
    
    // Delegate to Express app
    // Wrap in Promise to handle async Express middleware
    return new Promise<void>((resolve, reject) => {
      app(req, res, (err?: any) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  } catch (error) {
    // Error handled silently - only index.ts server entry may use console.log
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

