/**
 * Vercel Serverless Function for GraphQL API
 * Handles GraphQL requests for Vercel deployment
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
let app: express.Application | null = null

/**
 * Initialize Apollo Server and Express app
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
async function initializeApp() {
  if (app && apolloServer) return { app, server: apolloServer }

  // Initialize Apollo Server
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  })

  await apolloServer.start()

  // Create Express app
  app = express()

  // Parse cookies
  app.use(cookieParser())

  // Configure CORS - allow all origins in production
  app.use(cors({
    origin: true,
    credentials: true,
  }))

  // Handle root path
  app.get('/', (req, res) => {
    res.json({ message: 'GraphQL API is running. Use /graphql endpoint.' })
  })

  // Apply GraphQL middleware
  app.use(
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        return { req, res }
      },
    })
  )

  return { app, server: apolloServer }
}

/**
 * Vercel serverless function handler
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { app: expressApp } = await initializeApp()

  // Convert Vercel request/response to Express format
  return new Promise<void>((resolve) => {
    expressApp!(req as any, res as any, () => {
      resolve()
    })
  })
}

