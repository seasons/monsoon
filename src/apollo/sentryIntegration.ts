import * as Sentry from "@sentry/node"
import { ApolloServerPlugin } from "apollo-server-plugin-base"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

export const apolloServerSentryPlugin = {
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
