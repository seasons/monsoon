import qs from "querystring"

import { getReturnTypeFromInfo } from "@app/decorators/utils"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaLoader } from "@app/prisma/prisma.loader"
import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { makeOrderByPrisma2Compatible } from "@prisma/binding-argument-transform"
import { addFragmentToInfo } from "graphql-binding"
import { cloneDeep, isUndefined, omit } from "lodash"
import sha1 from "sha1"

import {
  DataloaderContext,
  LoaderParams,
  PrismaGenerateParams,
} from "../dataloader.types.d"
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

    // If includeInfo from context, ensure we key dataloaders using the origin query information, and prevent
    // stale results from data based on loader params alone, as the underlying prisma query will be different.
    //
    // `fieldNodes` captures the set of selected fields in the query, and we omit other info data (e.g. schema)
    // as it's expected to be the same across all queries and useless for hashing the result key.
    //
    // `loc` is omitted from the `fieldNode` as it indicates the "line of code" on which the field selection
    // can be found, and may result in otherwise identical queries being keyed differently.
    const keyData = {
      ...data,
      ...(data.includeInfo
        ? data.params.infoFragment
          ? {
              fieldNodes: addFragmentToInfo(
                info,
                data.params.infoFragment
              ).fieldNodes.map(node => omit(node, ["loc"])),
            }
          : { fieldNodes: info.fieldNodes.map(node => omit(node, ["loc"])) }
        : {}),
    }
    adjustedOptions.name = createKey(type, operationName, variables, keyData)

    // If needed, get the info from the context
    if (data.includeInfo === true) {
      let adjustedInfo = info as any
      if (!!adjustedOptions.params.infoFragment) {
        adjustedInfo = addFragmentToInfo(
          info,
          adjustedOptions.params.infoFragment
        )
      }
      const modelName = getReturnTypeFromInfo(info)
      ;(adjustedOptions.params as PrismaGenerateParams).select = QueryUtilsService.infoToSelect(
        {
          info: adjustedInfo,
          modelName,
          modelFieldsByModelName: ctx.modelFieldsByModelName,
        }
      )
    }

    // If needed, get the orderBy from the context
    if (data.includeOrderBy === true) {
      ;(adjustedOptions.params as PrismaGenerateParams).orderBy = makeOrderByPrisma2Compatible(
        args.orderBy
      )
    }

    if (!!adjustedOptions.params) {
      adjustedOptions.params.ctx = ctx
    }
    return ctx.getDataLoader(adjustedOptions)
  }
)

const createKey = (type, operationName, variables, data) => {
  const { params } = data
  const name = `${type}-${
    params ? params.model : ""
  }-${operationName}-${qs.stringify(variables)}`

  let paramString = ""
  for (const key of Object.keys(data || {})) {
    paramString += paramToString(data[key])
  }
  if (!!data?.params?.formatWhere) {
    paramString += data.params.formatWhere.toString()
  }
  if (!!data?.params?.getKeys) {
    paramString += data.params.getKeys.toString()
  }

  return `${name}-${sha1(paramString)}` // hash param string for brevity
}

const paramToString = p => {
  const s = JSON.stringify(p)
  const sWithoutSpacesOrNewLines = s.replace(/\s+/g, "").replace(/\\n/g, "")
  return sWithoutSpacesOrNewLines
}
