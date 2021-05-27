import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { addFragmentToInfo } from "graphql-binding"

import { getReturnTypeFromInfo } from "./utils"

export interface SelectParams {
  withFragment?: ((args, ctx, info) => string) | string
}

export const Select: (
  params?: SelectParams
) => ParameterDecorator = createParamDecorator(
  (options: SelectParams = {}, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    const modelName = getReturnTypeFromInfo(info)

    let _info = info
    const { withFragment } = options
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
      modelName,
      ctx.modelFieldsByModelName
    )
    return select
  }
)
