import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Injectable } from "@nestjs/common"
import {
  makeOrderByPrisma2Compatible,
  makeWherePrisma2Compatible,
} from "@prisma/binding-argument-transform"
import {
  PrismaService,
  SINGLETON_RELATIONS_POSING_AS_ARRAYS,
} from "@prisma1/prisma.service"
import { get, head, isArray, lowerFirst, pick } from "lodash"

@Injectable()
export class QueryUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  static prismaOneToPrismaTwoArgs(args, modelName) {
    const {
      where,
      orderBy,
      skip,
      first: _first,
      last,
      after,
      before,
      count,
    } = args
    // to support count on e.g blogPosts query
    const first = count || _first

    const prisma2Where = makeWherePrisma2Compatible(where)
    const sanitizedPrisma2Where = this.sanitizeWhere(prisma2Where, modelName)

    const prisma2OrderBy = makeOrderByPrisma2Compatible(orderBy)

    const skipValue = skip || 0
    const prisma2Skip = Boolean(before) ? skipValue + 1 : skipValue

    const prisma2Take = Boolean(last) ? -last : first

    const prisma2Before = { id: before }

    const prisma2After = { id: after }

    const prisma2Cursor =
      !Boolean(before) && !Boolean(after)
        ? undefined
        : Boolean(before)
        ? prisma2Before
        : prisma2After

    return {
      where: sanitizedPrisma2Where,
      orderBy: prisma2OrderBy,
      skip: prisma2Skip,
      cursor: prisma2Cursor,
      take: prisma2Take,
    }
  }

  static sanitizeWhere = (where: any, modelName: string) => {
    if (!where) {
      return where
    }

    let returnWhere = { ...where }
    if (!!returnWhere["AND"]) {
      return {
        AND: returnWhere.AND.map(a =>
          QueryUtilsService.sanitizeWhere(a, modelName)
        ),
      }
    }
    if (!!returnWhere["OR"]) {
      return {
        OR: returnWhere.OR.map(a =>
          QueryUtilsService.sanitizeWhere(a, modelName)
        ),
      }
    }

    const singleRelationFieldNames =
      SINGLETON_RELATIONS_POSING_AS_ARRAYS[modelName] || []
    singleRelationFieldNames.forEach(fieldName => {
      const fieldInWhere = !!where[fieldName]
      if (!!fieldInWhere) {
        returnWhere[fieldName] = { every: where[fieldName] }
      }
    })

    return QueryUtilsService.notNullToNotUndefined(returnWhere)
  }

  // The @prisma/binding-argument-transform library has a bug in it
  // in which {not: null} should be translated to {not: undefined},
  // but isn't. So we clean it up ex post facto for now. If prisma
  // doesn't fix it, we may fork the library and fix it ourselves later.
  static notNullToNotUndefined = (obj: any) => {
    const returnObj = { ...obj }

    if (isArray(returnObj)) {
      return returnObj.map(QueryUtilsService.notNullToNotUndefined)
    }

    for (const key of Object.keys(returnObj)) {
      if (key === "not" && returnObj[key] === null) {
        returnObj[key] = undefined
      } else if (typeof returnObj[key] === "object") {
        returnObj[key] = QueryUtilsService.notNullToNotUndefined(returnObj[key])
      }
    }

    return returnObj
  }

  async resolveFindMany(findManyArgs, select, modelName) {
    const data = await this.prisma.client2[lowerFirst(modelName)].findMany({
      ...findManyArgs,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, modelName)

    return sanitizedData
  }

  async resolveFindUnique(where, select, modelName) {
    const data = await this.prisma.client2[lowerFirst(modelName)].findUnique({
      where,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, modelName)

    return sanitizedData
  }

  async resolveConnection(args, select, modelName) {
    const { where, orderBy } = QueryUtilsService.prismaOneToPrismaTwoArgs(
      args,
      modelName
    )

    const modelPrismaClient = this.prisma.client2[lowerFirst(modelName)]
    const result = await findManyCursorConnection(
      async args => {
        const data = await modelPrismaClient.findMany({
          ...args,
          ...select,
          where,
          orderBy,
        })
        return this.prisma.sanitizePayload(data, modelName)
      },
      () => modelPrismaClient.count({ where }),
      { ...args }
    )

    const sanitizedResult = this.prisma.sanitizeConnection(result)
    return sanitizedResult
  }
}
