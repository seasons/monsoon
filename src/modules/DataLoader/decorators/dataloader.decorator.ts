import qs from "querystring"

import { PrismaLoader } from "@app/prisma/prisma.loader"
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
  (
    { type = PrismaLoader.name, ...data }: LoaderParams,
    context: ExecutionContext
  ) => {
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

    const key = createKey(type, operationName, variables, data)

    const adjustedData = {
      ...{ type, ...data },
      name: key,
    }

    // If needed, get the info from the context
    if (data.includeInfo === true) {
      adjustedData.params.info = info
    }

    // If needed, get the orderBy from the context
    if (data.includeOrderBy === true) {
      adjustedData.params.orderBy = args.orderBy
    }

    return ctx.getDataLoader(adjustedData)
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
