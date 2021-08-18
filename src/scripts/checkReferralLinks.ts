import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { get, head } from "lodash"

import { AppModule } from "../app.module"
import { AuthService } from "../modules/User/services/auth.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const custID = "ckr0n6sum565921yoiyvzl9k5"

  const app = await NestFactory.createApplicationContext(AppModule)
  const auth = app.get(AuthService)
  const customers = await ps.client.customer.findMany({
    select: {
      id: true,
      referralLink: true,
      user: {
        select: {
          firstName: true,
          id: true,
        },
      },
    },
  })
  // const c = await ps.client.customer.findUnique{
  //     where: {}
  // }

  let count = 0
  for (const c of customers) {
    if (!c.referralLink) {
      count++
      //   await auth.updateCustomerWithReferrerData(c.user, c, null)
      //   console.log("c", c)
    }
  }

  console.log("count", count)
}
run()
