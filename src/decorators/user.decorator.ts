import { createParamDecorator } from "@nestjs/common"

import { User as PrismaUser } from "../prisma"
import { SeasonsExectionContext } from "./decorators"

export const User = createParamDecorator(
  (data, context: SeasonsExectionContext): PrismaUser => {
    const ctx = context.getArgByIndex(2)
    if (!ctx.req.user) return null
    return ctx.req.user
  }
)
