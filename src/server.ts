import { schema } from "./schema"
import { prisma } from "./prisma"

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
