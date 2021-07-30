import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { Customer as PrismaCustomer } from "@prisma/client"

import { PrismaService, readClient } from "../prisma/prisma.service"

export const Customer = createParamDecorator(
  async (data, context: ExecutionContext): Promise<PrismaCustomer> => {
    const [obj, args, ctx, info] = context.getArgs()
    if (!!ctx.customer || ctx.customer === null) {
      return ctx.customer
    }

    const req = ctx.req

    const { id: userId } = req.user ? req.user : { id: "" }
    const customerArray = await readClient.customer.findMany({
      where: { user: { id: userId } },
    })
    const customer = customerArray.length > 0 ? customerArray[0] : null
    ctx.customer = customer

    return customer
  }
)
