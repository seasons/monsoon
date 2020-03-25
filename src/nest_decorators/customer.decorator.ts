import { createParamDecorator } from "@nestjs/common"
import { Customer as PrismaCustomer } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const prisma = new PrismaService()

export const Customer = createParamDecorator(
  async (data, [root, args, ctx, info]): Promise<PrismaCustomer> => {
    if (!!ctx.customer || ctx.customer === null) {
      return ctx.customer
    }

    const { id: userId } = ctx.req.user ? ctx.req.user : { id: "" }
    const customerArray = await prisma.client.customers({
      where: { user: { id: userId } },
    })
    const customer = customerArray.length > 0 ? customerArray[0] : null
    ctx.customer = customer

    return customer
  }
)
