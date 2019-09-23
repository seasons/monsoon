import { HttpLink } from "apollo-link-http"
import fetch from "node-fetch"
import { makeRemoteExecutableSchema, introspectSchema } from "graphql-tools"
import { ApolloLink } from "apollo-link"

const { MIST_URL } = process.env

const link = new HttpLink({
  uri: MIST_URL,
  fetch,
})

const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      "Content-Type": "application/json",
    },
  })
  return forward(operation)
})

export default async () => {
  return makeRemoteExecutableSchema({
    schema: await introspectSchema(link),
    link: middlewareLink.concat(link),
  })
}
