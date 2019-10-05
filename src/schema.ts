import resolvers from "./resolvers"
import { makeExecutableSchema } from "graphql-tools"
import { importSchema } from "graphql-import"

const typeDefs = importSchema("./src/schema.graphql")
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
