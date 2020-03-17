import { customerMock, detailsMock, userMock } from "../mocks"

export const createPrismaMock = ({ user }) => {
  return {
    user: jest.fn(() => user || userMock),

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
