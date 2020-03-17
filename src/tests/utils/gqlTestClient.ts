import { graphql } from "graphql"
import { createPrismaMock } from "./createPrismaMock"
import { schema } from "../../schema"
import { userMock } from "../mocks"

// add context to this when we have authentication in place
export const graphqlTestCall = async (
  query: any,
  variables?: any,
  user = userMock
) => {
  const prisma = createPrismaMock({ user })
  return graphql(
    schema,
    query,
    undefined,
    {
      prisma,
      db: {
        query: prisma,
      },
      req: {
        user,
      },
    },
    variables
  )
}
