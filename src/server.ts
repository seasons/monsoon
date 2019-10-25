import { schema } from "./schema"
import { prisma } from "./prisma"
import cors from "cors"
import { Prisma } from "prisma-binding"

const defaultQuery = `{
  products {
    edges {
      node {
        id
        name
        description
        retailPrice
      }
    }
  }
}
`

const db = new Prisma({
  typeDefs: "./src/prisma/prisma.graphql",
  endpoint: process.env.PRISMA_ENDPOINT || "http://localhost:4466",
})

export const serverOptions = {
  schema,
  context: ({ req, res }) => ({
    req,
    res,
    prisma,
    db,
  }),
  introspection: true,
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
