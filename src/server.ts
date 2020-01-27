import { schema } from "./schema"
import { prisma } from "./prisma"
import { Prisma } from "prisma-binding"
import Analytics from "analytics-node"
import { createConnection } from "typeorm"

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

export const createServerOptions = async () => {
  const typeorm = await createConnection({
    type: "postgres",
    url: process.env.DB_URL,
  })

  return {
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      prisma,
      db,
      /* track events on segment */
      analytics,
      typeorm,
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
  }
}
