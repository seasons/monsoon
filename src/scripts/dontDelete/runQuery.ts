import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const customerID = "ckixg05o306ze0750gl0pi46k"
  const x = await ps.client2.customer.findUnique({
    where: { id: "ck2pbxqti003x0703lqn4vo30" },
    select: {
      reservations: {
        select: { id: true },
        where: { id: "ckl8b3m5x2s330709513rberu" },
      },
    },
  })
  console.log(x)
}
run()
