import { createParamDecorator } from "@nestjs/common"
import { prisma, User as PrismaUser } from "../prisma"

export const User = createParamDecorator(
  async (data, [root, args, ctx, info]): Promise<PrismaUser> => {
    if (!ctx.req.user) return null
    const auth0Id = ctx.req?.user?.sub?.split("|")[1] // e.g "auth0|5da61ffdeef18b0c5f5c2c6f"
    return auth0Id ? await prisma.user({ auth0Id }) : null
  }
)
