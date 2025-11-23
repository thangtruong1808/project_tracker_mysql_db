import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { createServer } from 'http'
import dotenv from 'dotenv'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { db } from './db'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

async function startServer() {
  await server.start()

  app.use('/graphql', express.json(), expressMiddleware(server))

  const PORT = process.env.PORT || 4000

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  })

  // Test database connection
  try {
    await db.query('SELECT 1')
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
})

