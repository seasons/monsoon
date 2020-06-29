import { createParamDecorator } from "@nestjs/common"

import { Customer as PrismaCustomer } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"
import { SeasonsExectionContext } from "./decorators"

const prisma = new PrismaService()

export const Customer = createParamDecorator(
  async (data, context: SeasonsExectionContext): Promise<PrismaCustomer> => {
    const ctx = context.getArgByIndex(2)
    if (!!ctx.customer || ctx.customer === null) {
      return ctx.customer
    }

    const req = ctx.req

    const { id: userId } = req.user ? req.user : { id: "" }
    const customerArray = await prisma.client.customers({
      where: { user: { id: userId } },
    })
    const customer = customerArray.length > 0 ? customerArray[0] : null
    ctx.customer = customer

    return customer
  }
)
