import { schema } from "./schema"
import { prisma } from "./generated/prisma-client"

const defaultQuery = `{
    products(first: 10) {
      edges {
        node {
          id
          title
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
  mocks: true,
}
