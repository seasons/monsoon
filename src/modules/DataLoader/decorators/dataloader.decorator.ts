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

    // If the info property is an object, that means the original
    // value was FROM_CONTEXT. Use it to get the loader's name.
    const originalGenerateParams = { ...data.generateParams }
    if (typeof originalGenerateParams === "object") {
      originalGenerateParams.info = "FROM_CONTEXT"
    }
    const adjustedData = {
      ...data,
      name: createName(data.type, originalGenerateParams),
    }

    // If needed, get the info from the context
    if (adjustedData.generateParams?.info === "FROM_CONTEXT") {
      adjustedData.generateParams.info = info
    }

    return ctx[GET_LOADER_CONTEXT_KEY](adjustedData)
  }
)

const createName = (type, generateParams) => {
  let name = type
  for (const key of Object.keys(generateParams || {})) {
    name += paramToString(generateParams[key])
  }
  return name
}

const paramToString = p => {
  return p.toString().replace(/ /g, "").replace(/\n/g, "")
}
