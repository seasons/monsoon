import { HttpLink } from "apollo-link-http"
import fetch from "node-fetch"
import {
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  FilterTypes,
  FilterRootFields,
} from "graphql-tools"
import { ApolloLink } from "apollo-link"

const { SHOPIFY_GRAPHQL_API, SHOPIFY_ACCESS_TOKEN } = process.env
console.log("graphQL API: ", SHOPIFY_GRAPHQL_API, SHOPIFY_ACCESS_TOKEN)

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

export default async () => {
  const schema = await introspectSchema(middlewareLink.concat(link))
  const transformedSchema = transformSchema(schema, [
    new FilterRootFields((_, name) => {
      return ["collection", "product"].includes(name)
    }),
    new FilterTypes(filter => {
      return filter.toString() !== "Job"
    }),
  ])

  const executableSchema = makeRemoteExecutableSchema({
    schema: transformedSchema,
    link,
  })

  return executableSchema
}
