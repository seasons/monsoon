import resolvers from "./resolvers"
import { makeExecutableSchema, mergeSchemas } from "graphql-tools"
import { schema as mistSchema } from "./mist"
import { importSchema } from "graphql-import"

const typeDefs = importSchema("./src/schema.graphql")
const localSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export const schema = mergeSchemas({
  schemas: [localSchema, mistSchema],
})
