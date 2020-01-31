import { schema } from "./schema"
import { prisma } from "./prisma"
import { Prisma } from "prisma-binding"
import Analytics from "analytics-node"
import { apolloServerSentryPlugin } from "./apollo/sentryIntegration"

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
