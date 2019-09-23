import { prisma } from "./generated/prisma-client"
import { ApolloServer } from "apollo-server-lambda"
import { schema } from "./schema"
import { graphile } from "./graphile"

const defaultQuery = `{
  products(first: 10) {
    edges {
      node {
        id
        title
      }
    }
  }
}
`

const server = new ApolloServer({
  schema,
  context: request => ({
    ...request,
    prisma,
  }),
  playground: {
    settings: {
      "editor.theme": "dark",
    },
    tabs: [
      {
        endpoint: "/",
        query: defaultQuery,
      },
    ],
  },
  mocks: true,
})

export function graphql(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  const handler = server.createHandler()

  return handler(event, context, callback)
}

export function postgraphile(event, context, callback) {
  return graphile(event, context, callback)
}
