import { ExecutionContext, createParamDecorator } from "@nestjs/common"

export type ApplicationType = "harvest" | "flare" | "spring" | "unknown"

export const Application = createParamDecorator(
  (data, context: ExecutionContext): ApplicationType => {
    const [obj, args, ctx, info] = context.getArgs()
    return ctx.req.headers?.application || "unknown"
  }
)
