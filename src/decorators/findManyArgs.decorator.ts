import { SINGLETON_RELATIONS_POSING_AS_ARRAYS } from "@app/prisma/prisma.service"
import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import {
  makeOrderByPrisma2Compatible,
  makeWherePrisma2Compatible,
} from "@prisma/binding-argument-transform"
import { isArray } from "lodash"

import { getReturnTypeFromInfo } from "./utils"

export const FindManyArgs = createParamDecorator(
  (data, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    const modelName = getReturnTypeFromInfo(info)

    const { where, orderBy, skip, first, last, after, before } = args

    const prisma2Where = makeWherePrisma2Compatible(where)
    const sanitizedPrisma2Where = sanitizeWhere(prisma2Where, modelName)

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
)

const sanitizeWhere = (where: any, modelName: string) => {
  let returnWhere = { ...where }

  if (!!returnWhere["AND"]) {
    return { AND: returnWhere.AND.map(a => sanitizeWhere(a, modelName)) }
  }
  if (!!returnWhere["OR"]) {
    return { OR: returnWhere.OR.map(a => sanitizeWhere(a, modelName)) }
  }

  const singleRelationFieldNames =
    SINGLETON_RELATIONS_POSING_AS_ARRAYS[modelName] || []
  singleRelationFieldNames.forEach(fieldName => {
    const fieldInWhere = !!where[fieldName]
    if (!!fieldInWhere) {
      returnWhere[fieldName] = { every: where[fieldName] }
    }
  })

  return notNullToNotUndefined(returnWhere)
}

// The @prisma/binding-argument-transform library has a bug in it
// in which {not: null} should be translated to {not: undefined},
// but isn't. So we clean it up ex post facto for now. If prisma
// doesn't fix it, we may fork the library and fix it ourselves later.
const notNullToNotUndefined = (obj: any) => {
  const returnObj = { ...obj }

  if (isArray(returnObj)) {
    return returnObj.map(notNullToNotUndefined)
  }

  for (const key of Object.keys(returnObj)) {
    if (key === "not" && returnObj[key] === null) {
      returnObj[key] = undefined
    } else if (typeof returnObj[key] === "object") {
      returnObj[key] = notNullToNotUndefined(returnObj[key])
    }
  }

  return returnObj
}
