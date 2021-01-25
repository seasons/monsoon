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
          {
            user: {
              emails_none: { emailId: "TwentyFourHourAuthorizationFollowup" },
            },
          },
          {
            user: {
              emails_none: { emailId: "DaySixAuthorizationFollowup" },
            },
          },
          {
            admissions: {
              authorizationWindowClosesAt_lte: new Date(2021, 0, 26),
            },
          },
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
  // console.log(sortedCustomers.length)
  // for (const c of sortedCustomers) {
  //   console.log(c)
  // }
  const a = sortedCustomers.map(a => a.user.email)
  for (const b of a) {
    console.log(b)
  }
  // console.log(util.inspect(a, { depth: null, showHidden: true }))
  console.log(sortedCustomers.length)
}

run()
