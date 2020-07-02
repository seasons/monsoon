import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"

import { LoaderParams } from "../dataloader.types"
import {
  DataLoaderInterceptor,
  GET_LOADER_CONTEXT_KEY,
} from "../interceptors/dataloader.interceptor"

export const Loader: (
  params: LoaderParams
) => ParameterDecorator = createParamDecorator(
  (data: LoaderParams, context: ExecutionContext) => {
    const [obj, args, ctx, info] = context.getArgs()
    if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
      throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
      `)
    }

    return ctx[GET_LOADER_CONTEXT_KEY](data)
  }
)
