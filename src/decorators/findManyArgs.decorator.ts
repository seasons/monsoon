import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { addFragmentToInfo } from "graphql-binding"

import { getReturnTypeFromInfo } from "./utils"

export interface FindManyArgsParams {
  transformArgs?: (args: any) => any
  withFragment?: ((args, ctx, info) => string) | string
}

export const FindManyArgs: (
  params?: FindManyArgsParams
) => ParameterDecorator = createParamDecorator(
  (options: FindManyArgsParams = {}, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    const _modelName = getReturnTypeFromInfo(info)
    let modelName = _modelName
    if (_modelName.includes("Connection")) {
      modelName = _modelName.replace("Connection", "")
    }

    const { transformArgs = args => args, withFragment } = options
    const transformedArgs = transformArgs(args)

    let _info = info
    if (!!withFragment) {
      _info = addFragmentToInfo(
        info,
        typeof withFragment === "string"
          ? withFragment
          : withFragment(args, ctx, info)
      )
    }

    let select = QueryUtilsService.infoToSelect(
      _info,
      _modelName, // Preserve "Connection" if it's there
      ctx.modelFieldsByModelName
    )
    const findManyArgs = QueryUtilsService.prismaOneToPrismaTwoArgs(
      transformedArgs,
      modelName // Without "Connection"
    )
    return {
      ...findManyArgs,
      select,
    }
  }
)
