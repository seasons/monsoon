import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const x = await ps.client.customer.findFirst({
    where: { user: { email: "markchristopherz@gmail.com" } },
    select: {
      membership: {
        select: {
          pauseRequests: { select: { pauseType: true, createdAt: true } },
        },
      },
    },
  })
  console.log(x)
}
run()
