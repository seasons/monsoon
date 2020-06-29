import { ExecutionContext, createParamDecorator } from "@nestjs/common"

export const Analytics = createParamDecorator(
  (data, context: ExecutionContext): any => {
    const ctx = context.getArgByIndex(2)
    return ctx.analytics
  }
)
