import { GraphQLServer } from "graphql-yoga"
import { prisma } from "./generated/prisma-client"
import resolvers from "./resolvers"
import { makeExecutableSchema, mergeSchemas } from "graphql-tools"
import makeShopifySchema from "./shopify/schema"
import { importSchema } from "graphql-import"

const init = async () => {
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

  const server = new GraphQLServer({
    schema,
    context: request => ({
      ...request,
      prisma,
    }),
  })
  server.start(() => console.log(`Server is running on http://localhost:4000`))
}

try {
  init()
} catch (err) {
  console.error(err)
}
