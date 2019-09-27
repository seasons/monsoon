import { schema } from "./schema"
import { prisma } from "./generated/prisma-client"

const defaultQuery = `{
  allProducts {
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

export const serverOptions = {
  schema,
  context: request => ({
    ...request,
    prisma,
  }),
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
