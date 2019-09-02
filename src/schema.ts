import resolvers from "./resolvers"
import { makeExecutableSchema, mergeSchemas } from "graphql-tools"
import makeShopifySchema from "./shopify/schema"
import { importSchema } from "graphql-import"

const typeDefs = importSchema("./src/schema.graphql")
const localSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const shopifySchema = makeShopifySchema()

export const schema = mergeSchemas({
  schemas: [localSchema, shopifySchema],
})
