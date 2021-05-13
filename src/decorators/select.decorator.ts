import { PrismaService } from "@app/prisma/prisma.service"
import { ExecutionContext, createParamDecorator } from "@nestjs/common"

export const Select = createParamDecorator(
  // TODO: Change any to proper select type
  (data, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    const modelName = info.returnType.name
    const ps = new PrismaService()

    const select = ps.infoToSelect(info, modelName)
    return select
  }
)
