import { prisma } from "./prisma"
import { ApolloServer } from "apollo-server-lambda"
import { makeSchemaAndPlugin } from "postgraphile-apollo-server"
import { Pool } from "pg"

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function createServer() {
  const { schema, plugin } = await makeSchemaAndPlugin(
    pgPool,
    "app_public", // PostgreSQL schema to use
    {
      // PostGraphile options, see:
      // https://www.graphile.org/postgraphile/usage-library/
    }
  )

  return new ApolloServer({
    schema,
    context: request => ({
      ...request,
      prisma,
    }),
    plugins: [plugin],
  })
}

export async function graphql(event, context, callback) {
  const server = await createServer()
  context.callbackWaitsForEmptyEventLoop = false
  const handler = await server.createHandler()

  return handler(event, context, callback)
}
