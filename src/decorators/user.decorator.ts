import { createParamDecorator } from "@nestjs/common"

import { User as PrismaUser } from "../prisma"

export const User = createParamDecorator(
  (data, [root, args, ctx, info]): PrismaUser => {
    if (!ctx.req.user) return null
    return ctx.req.user
  }
)
