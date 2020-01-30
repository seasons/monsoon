import { schema } from "./schema"
import { prisma } from "./prisma"
import { Prisma } from "prisma-binding"
import Analytics from "analytics-node"
import { ApolloServerPlugin } from "apollo-server-plugin-base"

// Set up Sentry, which automatically reports on uncaught exceptions
const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

var analytics = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)

const defaultQuery = `{
  products {
    id
    name
    description
    retailPrice
  }
}
`

export const db = new Prisma({
  typeDefs: "./src/prisma/prisma.graphql",
  endpoint: process.env.PRISMA_ENDPOINT || "http://localhost:4466",
  secret: process.env.PRISMA_SECRET,
})

const apolloServerSentryPlugin = {
  // For plugin definition see the docs: https://www.apollographql.com/docs/apollo-server/integrations/plugins/
  // This code was adapted from: https://gist.github.com/nodkz/d14b236d67251d2df5674cb446843732
  requestDidStart() {
    return {
      didEncounterErrors(rc) {
        Sentry.withScope(scope => {
          scope.addEventProcessor(event =>
            Sentry.Handlers.parseRequest(event, (rc.context as any).req)
          )

          rc.errors.forEach(error => {
            if (error.path || error.name !== "GraphQLError") {
              scope.setExtras({
                path: error.path,
              })
              Sentry.captureException(error)
            } else {
              scope.setExtras({})
              Sentry.captureMessage(`GraphQLWrongQuery: ${error.message}`)
            }
          })
        })
      },
    }
  },
} as ApolloServerPlugin

export const serverOptions = {
  schema,
  context: ({ req, res }) => ({
    req,
    res,
    prisma,
    db,
    /* track events on segment */
    analytics,
  }),
  introspection: true,
  formatError: error => {
    console.log(error)
    return error
  },
  playground: {
    settings: {
      "editor.theme": "dark" as any,
    },
    tabs: [
      {
        endpoint: "/",
        query: defaultQuery,
      },
    ],
  },
  plugins: [apolloServerSentryPlugin],
}
