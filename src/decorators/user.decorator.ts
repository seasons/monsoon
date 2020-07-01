import { ExecutionContext, createParamDecorator } from "@nestjs/common"

import { User as PrismaUser } from "../prisma"

export const User = createParamDecorator(
  (data, context: ExecutionContext): PrismaUser => {
    const [obj, args, ctx, info] = context.getArgs()
    if (!ctx.req.user) return null
    return ctx.req.user
  }
)
