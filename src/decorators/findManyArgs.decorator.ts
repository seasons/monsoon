import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { ExecutionContext, createParamDecorator } from "@nestjs/common"

import { getReturnTypeFromInfo } from "./utils"

export interface FindManyArgsParams {
  transformArgs?: (args: any) => any
}

export const FindManyArgs: (
  params: FindManyArgsParams
) => ParameterDecorator = createParamDecorator(
  (options: FindManyArgsParams, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    let modelName = getReturnTypeFromInfo(info)
    if (modelName.includes("Connection")) {
      modelName = modelName.replace("Connection", "") // e.g BlogPostConnection => BlogPost
    }

    const { transformArgs = args => args } = options
    const transformedArgs = transformArgs(args)
    return QueryUtilsService.prismaOneToPrismaTwoArgs(
      transformedArgs,
      modelName
    )
  }
)
