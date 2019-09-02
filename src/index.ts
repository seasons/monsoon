import { GraphQLServerLambda } from "graphql-yoga"
import { prisma } from "./generated/prisma-client"
import resolvers from "./resolvers"
import { makeExecutableSchema, mergeSchemas } from "graphql-tools"
import makeShopifySchema from "./shopify/schema"
import { importSchema } from "graphql-import"

export const init = async () => {
  const typeDefs = importSchema("./src/schema.graphql")
  console.log(typeDefs)
  const localSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const shopifySchema = await makeShopifySchema()
  const schema = mergeSchemas({
    schemas: [localSchema, shopifySchema],
  })

  const lambda = new GraphQLServerLambda({
    schema,
    context: request => ({
      ...request,
      prisma,
    }),
  })
  // server.start(() => console.log(`Server is running on http://localhost:4000`))

  return {
    server: lambda.graphqlHandler,
    playground: lambda.playgroundHandler,
  }
}
