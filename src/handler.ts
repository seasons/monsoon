import { prisma } from "./generated/prisma-client"
import { ApolloServer } from "apollo-server-lambda"
import { schema } from "./schema"

const server = new ApolloServer({
  schema,
  context: request => ({
    ...request,
    prisma,
  }),
  playground: {
    settings: {
      'editor.theme': 'dark',
    },
    tabs: [
      {
        endpoint: "/",
        query: `{
          products(first: 10){
            edges {
              node {
                id
                title
              }
            }
          }
        }`,
      },
    ],
  },
})

export function graphql(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  const handler = server.createHandler()

  return handler(event, context, callback)
}
