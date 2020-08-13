import qs from "querystring"

import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { isUndefined } from "lodash"
import sha1 from "sha1"

import { DataloaderContext, LoaderParams } from "../dataloader.types"
import { DataLoaderInterceptor } from "../interceptors/dataloader.interceptor"

export const Loader: (
  params: LoaderParams
) => ParameterDecorator = createParamDecorator(
  (data: LoaderParams, context: ExecutionContext) => {
    const [obj, args, ctx, info]: [
      any,
      any,
      DataloaderContext,
      any
    ] = context.getArgs()

    if (isUndefined(ctx.dataloaders)) {
      throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
      `)
    }

    const { operationName, variables } = ctx.req.body

    const key = createKey(data.type, operationName, variables, data.params)

    const adjustedData = {
      ...data,
      name: key,
    }

    // If needed, get the info from the context
    if (data.includeInfo === true) {
      adjustedData.params.info = info
    }

    return ctx.getDataLoader(adjustedData)
  }
)

const createKey = (type, operationName, variables, params) => {
  const name = `${type}-${
    params ? params.query : ""
  }-${operationName}-${qs.stringify(variables)}`

  let paramString = ""
  for (const key of Object.keys(params || {})) {
    paramString += paramToString(params[key])
  }

  return `${name}-${sha1(paramString)}` // hash param string for brevity
}

const paramToString = p => {
  return p.toString().replace(/ /g, "").replace(/\n/g, "")
}
