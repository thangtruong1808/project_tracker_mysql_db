/**
 * Executable GraphQL Schema
 * Creates executable schema for WebSocket subscriptions
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'

export const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
