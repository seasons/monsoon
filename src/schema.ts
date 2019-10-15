import resolvers from "./resolvers"
import { makeExecutableSchema } from "graphql-tools"
import { importSchema } from "graphql-import"
import { directiveResolvers } from "./auth/directives"

const typeDefs = importSchema("./src/schema.graphql")
export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    directiveResolvers,
})
