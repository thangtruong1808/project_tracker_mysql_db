/**
 * Vercel Serverless Function Handler
 * Exports Express app as serverless function for Vercel
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import '../src/utils/loadEnv'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from '../src/schema'
import { resolvers } from '../src/resolvers'

const app = express()

/**
 * CORS configuration - allows all Vercel domains with credentials support
 * @author Thang Truong
 * @date 2025-12-09
 */
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const isVercel = origin.includes('.vercel.app') || origin.includes('vercel.app')
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
    if (isVercel || isLocal || origin === process.env.FRONTEND_URL) {
      callback(null, origin)
    } else {
      callback(null, origin)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}

// Apply middleware globally
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())

/** Apollo Server instance @author Thang Truong @date 2025-12-04 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => ({
    message: error.message || 'An error occurred',
    extensions: { code: error.extensions?.code || 'INTERNAL_SERVER_ERROR', ...error.extensions },
  }),
  introspection: true,
})

let serverStarted = false

/**
 * Initialize server and setup routes
 * @author Thang Truong
 * @date 2025-12-04
 */
async function initializeServer(): Promise<void> {
  if (serverStarted) return
  await server.start()

  /** Root endpoint @author Thang Truong @date 2025-12-04 */
  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'GraphQL API is running. Use /graphql endpoint.', graphql: '/graphql', status: 'online' })
  })

  /** OPTIONS preflight handler @author Thang Truong @date 2025-12-04 */
  app.options('*', cors(corsOptions))

  /** GraphQL endpoint @author Thang Truong @date 2025-12-04 */
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res }),
  }))

  serverStarted = true
}

/**
 * Vercel serverless function handler
 * @author Thang Truong
 * @date 2025-12-04
 */
export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await initializeServer()
    if (req.url === '/favicon.ico') { res.status(204).end(); return }
    return new Promise<void>((resolve, reject) => {
      app(req, res, ((err?: unknown) => {
        if (err) reject(err instanceof Error ? err : new Error(String(err)))
        else resolve()
      }) as NextFunction)
    })
  } catch {
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' })
  }
}
