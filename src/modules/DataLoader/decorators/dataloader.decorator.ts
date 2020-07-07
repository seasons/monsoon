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

    const adjustedData = {
      ...data,
      name: createName(data.type, data.generateParams),
    }
    if (adjustedData.generateParams?.info === "FROM_CONTEXT") {
      adjustedData.generateParams.info = info
    }
    return ctx[GET_LOADER_CONTEXT_KEY](adjustedData)
  }
)

const createName = (type, generateParams) => {
  let name = type
  for (const key of Object.keys(generateParams)) {
    name += paramToString(generateParams[key])
  }
  return name
}

const paramToString = p => {
  return p.toString().replace(/ /g, "").replace(/\n/g, "")
}
