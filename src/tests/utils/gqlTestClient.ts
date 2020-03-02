import { graphql } from "graphql"
import { schema } from "../../schema"
import {
  userMock,
  customerMock,
  detailsMock
 } from '../mocks'

export async function graphqlTestCall(
  query: any,
  variables?: any,
  user = userMock,
) {
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

function createPrismaMock({ user }) {
  return {
    user: jest.fn(() => user),

    customer: jest.fn(() => ({
      ...customerMock,
      detail: jest.fn(() => detailsMock),
    })),
    customers: jest.fn(() => [customerMock]),

    updateCustomerDetail: jest.fn(() => Promise.resolve()),
    updateCustomer: jest.fn(() => Promise.resolve()),

    $exists: {
      user: jest.fn(() => true),
    },
  }
}