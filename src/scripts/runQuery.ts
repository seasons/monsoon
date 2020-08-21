import "module-alias/register"

import { groupBy } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allActiveCustomers = await ps.binding.query.customers(
    {
      where: { status: "Active" },
    },
    `{
      id
      detail {
        topSizes
        waistSizes
      }
      user {
        firstName
        lastName
      }
      reservations {
        id
      }
    }`
  )
  const totalActiveCustomers = allActiveCustomers.length
  const activeCustomersWithSizeData = []
  const activeCustomersWithoutSizeData = []
  const activeCustomersWithoutSizeDataOrReservations = []
  for (const cust of allActiveCustomers) {
    const hasSizes =
      cust.detail.topSizes.length > 0 && cust.detail.waistSizes.length > 0
    const hasReservation = cust.reservations?.length > 0
    if (hasSizes) {
      activeCustomersWithSizeData.push(cust)
    }
    if (!hasSizes) {
      activeCustomersWithoutSizeData.push(cust)
      if (!hasReservation) {
        activeCustomersWithoutSizeDataOrReservations.push(cust)
        console.log(
          `cust without sizes or reservation data: ${cust.id}, ${
            cust.user.firstName + cust.user.lastName
          }`
        )
      }
    }
  }
  console.log(
    `Percentage of active customers without size data: ${
      activeCustomersWithoutSizeData.length / totalActiveCustomers
    }`
  )
  console.log(
    `Percentage of active customers without size data or reservations: ${
      activeCustomersWithoutSizeDataOrReservations.length / totalActiveCustomers
    }`
  )
}

run()
