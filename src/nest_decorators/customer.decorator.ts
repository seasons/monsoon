import { createParamDecorator } from "@nestjs/common"
import { PrismaClientService } from "../prisma/client.service"

const prisma = new PrismaClientService()

export const Customer = createParamDecorator(
  async (data, [root, args, ctx, info]) => {
    const { id: userId } = ctx.req.user ? ctx.req.user : { id: "" }
    const customerArray = await prisma.client.customers({
      where: { user: { id: userId } },
    })
    return customerArray.length > 0 ? customerArray[0] : null
  }
)
