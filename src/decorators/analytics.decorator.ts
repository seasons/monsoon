import { ExecutionContext, createParamDecorator } from "@nestjs/common"

export const Analytics = createParamDecorator(
  (data, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    return ctx.analytics
  }
)
