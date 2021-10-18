import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const activeAllAccessCustomers = await ps.client.customer.findMany({
    where: {
      membership: { plan: { name: { contains: "All Access" } } },
      status: "Active",
    },
    select: {
      id: true,
      user: { select: { email: true } },
      membership: {
        select: { id: true, grandfathered: true, creditBalance: true },
      },
    },
  })
  console.dir(activeAllAccessCustomers, { depth: null })

  // for (const cust of activeAllAccessCustomers) {
  //   await ps.client.customerMembership.update({
  //     where: { id: cust.membership.id },
  //     data: { grandfathered: true },
  //   })
  // }
}
run()

/*
For each customer, get all invoices created after 9.20 and their most recent invoice prior to 9.20. 
Calculate the amount of credits they SHOULD have:
  -> prorated amount for the last rental invoice prior to 9.20
  -> Full amount * 1.15 for any invoices since 9.20
  -> Minus any rental charges from rental invoices they've been charged

Compare this to the credits they actually have. If the value on file is incorrect, flag it for correction.
*/
