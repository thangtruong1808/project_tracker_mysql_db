/**
 * Vercel Serverless Function for GraphQL API
 * Exports Express app as serverless function for Vercel deployment
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from '../src/schema'
import { resolvers } from '../src/resolvers'

// Import environment loader
import '../src/utils/loadEnv'

let apolloServer: ApolloServer | null = null
let handlerPromise: Promise<void> | null = null

/**
 * Initialize Apollo Server
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
async function initApolloServer() {
  if (apolloServer) return apolloServer

  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  })

  await apolloServer.start()
  return apolloServer
}

/**
 * Vercel serverless function handler
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Apollo Server
  const server = await initApolloServer()

  // Create Express app
  const app = express()

  // Parse cookies
  app.use(cookieParser())

  // Configure CORS - allow all origins in production
  app.use(cors({
    origin: true,
    credentials: true,
  }))

  // Apply GraphQL middleware
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res }
      },
    })
  )

  // Handle root path
  app.get('/', (req, res) => {
    res.json({ message: 'GraphQL API is running. Use /graphql endpoint.' })
  })

  // Execute Express app
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

