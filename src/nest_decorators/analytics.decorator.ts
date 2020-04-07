import { createParamDecorator } from "@nestjs/common"

export const Analytics = createParamDecorator(
  (data, [root, args, ctx, info]): any => {
    return ctx.analytics
  }
)
