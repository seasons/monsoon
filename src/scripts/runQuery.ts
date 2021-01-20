import "module-alias/register"

import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)

  const unhandledCustomers = await ps.binding.query.customers(
    {
      where: {
        AND: [
          { status: "Authorized" },
          { user: { emails_none: { emailId: "Rewaitlisted" } } },
          { admissions: { authorizationWindowClosesAt_lte: new Date() } },
          { user: { createdAt_gte: new Date(2020, 9, 5) } },
        ],
      },
    },
    `{
    id
    user {
      email
      createdAt
    }
  }`
  )
  let sortedCustomers = unhandledCustomers.sort(
    (a, b) => utils.dateSort(a.user.createdAt, b.user.createdAt) * -1
  )
  console.log(sortedCustomers.length)
  for (const c of sortedCustomers) {
    console.log(c)
  }
}

run()
