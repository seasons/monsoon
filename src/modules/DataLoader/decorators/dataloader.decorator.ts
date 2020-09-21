import qs from "querystring"

import { PrismaLoader } from "@app/prisma/prisma.loader"
import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { cloneDeep, isUndefined } from "lodash"
import sha1 from "sha1"

import { DataloaderContext, LoaderParams } from "../dataloader.types"
import { DataLoaderInterceptor } from "../interceptors/dataloader.interceptor"

export const Loader: (
  params: LoaderParams
) => ParameterDecorator = createParamDecorator(
  (options: LoaderParams, context: ExecutionContext) => {
    const { type = PrismaLoader.name, ...data } = options

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

    const adjustedOptions = cloneDeep({ type, ...data })
    adjustedOptions.name = createKey(type, operationName, variables, data)

    // If needed, get the info from the context
    if (data.includeInfo === true) {
      adjustedOptions.params.info = info
    }

    // If needed, get the orderBy from the context
    if (data.includeOrderBy === true) {
      adjustedOptions.params.orderBy = args.orderBy
    }

    return ctx.getDataLoader(adjustedOptions)
  }
)

const createKey = (type, operationName, variables, data) => {
  const { params } = data
  const name = `${type}-${
    params ? params.query : ""
  }-${operationName}-${qs.stringify(variables)}`

  let paramString = ""
  for (const key of Object.keys(data || {})) {
    paramString += paramToString(data[key])
  }

  return `${name}-${sha1(paramString)}` // hash param string for brevity
}

const paramToString = p => {
  const s = JSON.stringify(p)
  const sWithoutSpacesOrNewLines = s.replace(/\s+/g, "").replace(/\\n/g, "")
  return sWithoutSpacesOrNewLines
}
