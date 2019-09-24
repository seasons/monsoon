import { HttpLink } from "apollo-link-http"
import fetch from "node-fetch"
import { makeRemoteExecutableSchema } from "graphql-tools"
import { ApolloLink } from "apollo-link"
import { importSchema } from "graphql-import"

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

const typeDefs = importSchema("./src/mist/mist.graphql")

export const schema = makeRemoteExecutableSchema({
  schema: typeDefs,
  link: middlewareLink.concat(link),
})
