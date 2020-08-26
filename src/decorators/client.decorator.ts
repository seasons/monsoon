import { ExecutionContext, createParamDecorator } from "@nestjs/common"

export type ClientType = "Harvest" | "Flare" | "Unknown"

export const Client = createParamDecorator(
  (data, context: ExecutionContext): ClientType => {
    const [obj, args, ctx, info] = context.getArgs()
    return ctx.req.headers?.client || "Unknown"
  }
)
