import { prisma } from "./generated/prisma-client"
import { ApolloServer } from "apollo-server-lambda"
import { schema } from "./schema"

const server = new ApolloServer({
  schema,
  context: request => ({
    ...request,
    prisma,
  }),
})

export function graphql(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  const handler = server.createHandler()

  return handler(event, context, callback)
}
