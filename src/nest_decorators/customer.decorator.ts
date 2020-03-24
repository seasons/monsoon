import { createParamDecorator } from "@nestjs/common"
import { Customer as PrismaCustomer } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const prisma = new PrismaService()

export const Customer = createParamDecorator(
  async (data, [root, args, ctx, info]): Promise<PrismaCustomer> => {
    const { id: userId } = ctx.req.user ? ctx.req.user : { id: "" }
    const customerArray = await prisma.client.customers({
      where: { user: { id: userId } },
    })
    return customerArray.length > 0 ? customerArray[0] : null
  }
)
