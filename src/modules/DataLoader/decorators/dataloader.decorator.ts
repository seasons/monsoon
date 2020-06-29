import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"

import {
  DataLoaderInterceptor,
  GET_LOADER_CONTEXT_KEY,
} from "../interceptors/dataloader.interceptor"

export const Loader: (
  type: string
) => ParameterDecorator = createParamDecorator(
  (type: string, context: ExecutionContext) => {
    const ctx = context.getArgByIndex(2)
    if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
      throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
      `)
    }

    return ctx[GET_LOADER_CONTEXT_KEY](type)
  }
)
