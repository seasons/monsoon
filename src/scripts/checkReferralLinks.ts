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
    where: {
      referralLink: {
        equals: null,
      },
    },
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
      // await new Promise(r => setTimeout(r, 1000))
      // await auth.updateCustomerWithReferrerData(c.user, c, null)
      //   console.log("c", c)
      console.log(count)
    }
  }

  console.log("count fixed: ", count)
}

const test = async () => {
  const ps = new PrismaService()
  const custID = "ckr0n6sum565921yoiyvzl9k5"

  const app = await NestFactory.createApplicationContext(AppModule)
  const auth = app.get(AuthService)

  const customersWithSameFirstName = await ps.client.customer.findMany({
    where: {
      user: { firstName: "Ryan" },
      referralLink: {
        equals: null,
      },
    },
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

  let count = 0
  for (const c of customersWithSameFirstName) {
    if (!c.referralLink) {
      count++
      console.log(count)
    }
  }

  console.log(customersWithSameFirstName)
  // console.log(customersWithSameFirstName.length)
}

test()
