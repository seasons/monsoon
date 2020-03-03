import { createParamDecorator } from "@nestjs/common"

export const User = createParamDecorator((data, [root, args, ctx, info]) => {
  if (!ctx.req.user) return null
  return {
    id: ctx.req.user.id,
    email: ctx.req.user.email,
    lastName: ctx.req.user.lastName,
    firstName: ctx.req.user.firstName,
    auth0Id: ctx.req.user.auth0Id,
    createdAt: ctx.req.user.createdAt,
    role: ctx.req.user.role,
    updatedAt: ctx.req.user.updatedAt,
  }
})
