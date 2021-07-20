import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { Customer as PrismaCustomer } from "@prisma/client"

import { PrismaService } from "../prisma/prisma.service"

const prisma = new PrismaService()

export const Customer = createParamDecorator(
  async (data, context: ExecutionContext): Promise<PrismaCustomer> => {
    const [obj, args, ctx, info] = context.getArgs()
    if (!!ctx.customer || ctx.customer === null) {
      return ctx.customer
    }

    const req = ctx.req

    const { id: userId } = req.user ? req.user : { id: "" }
    const _customerArray = await prisma.client2.customer.findMany({
      where: { user: { id: userId } },
    })
    const customerArray = prisma.sanitizePayload(_customerArray, "Customer")
    const customer = customerArray.length > 0 ? customerArray[0] : null
    ctx.customer = customer

    return customer
  }
)
