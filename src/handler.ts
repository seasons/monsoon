import { ApolloServer } from "apollo-server-lambda"
import { serverOptions } from "./server"

const server = new ApolloServer(serverOptions)

export function graphql(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  const handler = server.createHandler()

  return handler(event, context, callback)
}
