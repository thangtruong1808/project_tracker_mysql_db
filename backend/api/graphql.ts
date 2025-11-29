/**
 * Vercel Serverless Function for GraphQL API
 * Exports Express app as serverless function for Vercel deployment
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from '../src/schema'
import { resolvers } from '../src/resolvers'

// Import environment loader
import '../src/utils/loadEnv'

let apolloServer: ApolloServer | null = null

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
  const server = await initApolloServer()

  // Create Express app for this request
  const app = express()

  // Parse cookies from requests
  app.use(cookieParser())

  // Configure CORS options - allow all origins in production
  app.use(cors({
    origin: true,
    credentials: true,
  }))

  // Apply GraphQL middleware
  app.use(
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res }
      },
    })
  )

  // Handle the request using Express
  return new Promise<void>((resolve) => {
    app(req as Request, res as Response, () => {
      resolve()
    })
  })
}

