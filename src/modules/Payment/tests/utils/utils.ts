import { PrismaService } from "@app/prisma/prisma.service"
import { Customer, Prisma } from "@prisma/client"
import { merge } from "lodash"
import moment from "moment"

import { CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT } from "../../services/rental.service"

export type TestCustomerWithId = Pick<Customer, "id">

export type PrismaDateUpdateInput = Date | string | null

export const getCustWithData = async (
  testCustomer: TestCustomerWithId,
  {
    prisma,
    select = {},
  }: { prisma: PrismaService; select: Prisma.CustomerSelect }
): Promise<any> => {
  const defaultSelect = {
    membership: {
      select: {
        rentalInvoices: {
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        },
      },
    },
  }

  return await prisma.client.customer.findFirst({
    where: { id: testCustomer.id },
    select: merge(defaultSelect, select),
  })
}

export const setCustomerSubscriptionStatus = async (
  testCustomer: TestCustomerWithId,
  status: string,
  { prisma }: { prisma: PrismaService }
) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: { membership: { update: { subscription: { update: { status } } } } },
  })
}

// TODO: Refactor to use luxon
export const expectTimeToEqual = (time, expectedValue) => {
  if (!expectedValue) {
    expect(time).toBe(expectedValue)
  }
  expect(moment(time).format("ll")).toEqual(moment(expectedValue).format("ll"))
}

export const setCustomerSubscriptionNextBillingAt = async (
  testCustomer: TestCustomerWithId,
  nextBillingAt: PrismaDateUpdateInput,
  { prisma }: { prisma: PrismaService }
) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: {
      membership: { update: { subscription: { update: { nextBillingAt } } } },
    },
  })
}
