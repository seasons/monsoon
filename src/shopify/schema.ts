import { HttpLink } from "apollo-link-http"
import fetch from "node-fetch"
import {
  makeRemoteExecutableSchema,
  transformSchema,
  FilterTypes,
} from "graphql-tools"
import { ApolloLink } from "apollo-link"
import { importSchema } from "graphql-import"

const { SHOPIFY_GRAPHQL_API, SHOPIFY_ACCESS_TOKEN } = process.env

const link = new HttpLink({
  uri: SHOPIFY_GRAPHQL_API,
  fetch,
})

const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
  })
  return forward(operation)
})

export default () => {
  const typeDefs = importSchema("./src/shopify/shopify.graphql")
  const executableSchema = makeRemoteExecutableSchema({
    schema: typeDefs,
    link: middlewareLink.concat(link),
  })

  const transformedSchema = transformSchema(executableSchema, [
    // new FilterRootFields((_, name) => {
    //   return ["collection", "product", "products"].includes(name)
    // }),
    new FilterTypes(filter => {
      return filter.toString() !== "Job"
    }),
  ])

  return transformedSchema
}
