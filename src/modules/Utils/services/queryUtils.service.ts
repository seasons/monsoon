import { getReturnTypeFromInfo } from "@app/decorators/utils"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Injectable } from "@nestjs/common"
import { PrismaSelect } from "@paljs/plugins"
import {
  makeOrderByPrisma2Compatible,
  makeWherePrisma2Compatible,
} from "@prisma/binding-argument-transform"
import {
  PrismaService,
  SCALAR_LIST_FIELD_NAMES,
  SINGLETON_RELATIONS_POSING_AS_ARRAYS,
} from "@prisma1/prisma.service"
import graphqlFields from "graphql-fields"
import { isArray, isEmpty, lowerFirst, pick } from "lodash"

@Injectable()
export class QueryUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  static infoToSelect(
    info,
    modelName,
    modelFieldsByModelName,
    callType: "initial" | "recursive" = "initial"
  ) {
    const prismaSelect = new PrismaSelect(info)
    let fields = graphqlFields(info)

    // Fields that we'll need to pass in for recursive calls so that
    // the PrismaSelect library can properly parse the info. Not all
    // are *definitely* needed, but we err on the side of caution
    const globalInfoFields = pick(info, [
      "fragments",
      "operation",
      "schema",
      "variableValues",
    ])

    // If it's a Connection query, get the select for the node on the edges
    if (modelName.includes("Connection")) {
      const edgesSelection = info.fieldNodes[0].selectionSet.selections.find(
        a => a.name.value === "edges"
      )
      const nodeSelection = edgesSelection?.selectionSet?.selections?.find(
        a => a.name.value === "node"
      )
      const returnType = modelName.replace("Connection", "")
      return this.infoToSelect(
        {
          ...globalInfoFields,
          fieldNodes: [nodeSelection],
          returnType,
        },
        returnType,
        modelFieldsByModelName
      )
    }

    const modelFields = modelFieldsByModelName[modelName]
    if (isEmpty(modelFields)) {
      throw new Error(`Invalid record type: ${modelName}`)
    }

    let select = { select: {} }
    modelFields.forEach(field => {
      let fieldSelect
      switch (field.kind) {
        // If it's a scalar, valueOf works great, so we run it.
        case "scalar":
          fieldSelect = prismaSelect.valueOf(field.name, field.type)
          break
        // If it's an object, valueOf would break if there's a
        // scalar list in the object. So we handle it differently
        case "object":
          // Is the field in the selection set?
          const fieldInSelectionSet = Object.keys(fields).includes(field.name)

          // If so...
          if (fieldInSelectionSet) {
            // If it's a scalar list, return true
            if (SCALAR_LIST_FIELD_NAMES[modelName]?.includes(field.name)) {
              fieldSelect = true
            } else {
              // Otherwise recurse down
              let subFieldNodes = info.fieldNodes[0].selectionSet.selections.find(
                a => a.name.value === field.name
              )
              if (!!subFieldNodes) {
                fieldSelect = this.infoToSelect(
                  {
                    fieldNodes: [subFieldNodes],
                    returnType: field.type,
                    ...globalInfoFields,
                  },
                  field.type,
                  modelFieldsByModelName,
                  "recursive"
                )
              } else {
                // field is coming from one or more fragments. get the field nodes accordingly
                const returnType = getReturnTypeFromInfo(info)
                const parentFragments = Object.keys(info.fragments)
                  .filter(
                    k =>
                      info.fragments[k].typeCondition.name.value === returnType
                  )
                  .map(k2 => info.fragments[k2])
                fieldSelect = parentFragments.reduce(
                  (accumulatedFieldSelect: any, currentFragment: any) => {
                    const currentFieldNodes = currentFragment.selectionSet.selections.find(
                      a => a.name.value === field.name
                    )
                    const currentFieldSelect = this.infoToSelect(
                      {
                        fieldNodes: [currentFieldNodes],
                        returnType: field.type,
                        ...globalInfoFields,
                      },
                      field.type,
                      modelFieldsByModelName,
                      "recursive"
                    )
                    return PrismaSelect.mergeDeep(
                      currentFieldSelect,
                      accumulatedFieldSelect
                    )
                  },
                  {}
                )
              }
            }
          }
          break
        default:
          throw new Error(`unknown kind: ${field.kind}`)
      }

      if (typeof fieldSelect === "object" && isEmpty(fieldSelect)) {
        return
      }

      if (!!fieldSelect) {
        select = PrismaSelect.mergeDeep(
          { select: { [field.name]: fieldSelect } },
          select
        )
      }
    })

    const finalReturnValue = isEmpty(select.select) ? null : select.select
    return callType === "recursive" ? select : finalReturnValue
  }

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
      select: {},
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
    // Base case
    if (typeof obj !== "object") {
      return
    }

    if (isArray(obj)) {
      return obj.map(QueryUtilsService.notNullToNotUndefined)
    }

    const returnObj = { ...obj }
    for (const key of Object.keys(returnObj)) {
      if (key === "not" && returnObj[key] === null) {
        returnObj[key] = undefined
      } else if (typeof returnObj[key] === "object") {
        returnObj[key] = QueryUtilsService.notNullToNotUndefined(returnObj[key])
      }
    }

    return returnObj
  }

  async resolveFindMany(findManyArgs, modelName) {
    const modelClient = this.prisma.client2[lowerFirst(modelName)]
    const data = await modelClient.findMany(findManyArgs)
    const sanitizedData = this.prisma.sanitizePayload(data, modelName)

    return sanitizedData
  }

  async resolveFindUnique(
    findUniqueArgs: { where: any; select?: any; include?: any },
    modelName
  ) {
    const modelClient = this.prisma.client2[lowerFirst(modelName)]
    const data = await modelClient.findUnique(findUniqueArgs)
    const sanitizedData = this.prisma.sanitizePayload(data, modelName)

    return sanitizedData
  }

  async resolveConnection(
    queryArgs: {
      where?: any
      orderBy?: any
      first?: number
      last?: number
      before?: string
      after?: string
      select?: any
    },
    modelName
  ) {
    const { where, orderBy } = QueryUtilsService.prismaOneToPrismaTwoArgs(
      queryArgs,
      modelName
    )

    const modelClient = this.prisma.client2[lowerFirst(modelName)]
    const result = await findManyCursorConnection(
      async args => {
        const data = await modelClient.findMany({
          ...args,
          where,
          orderBy,
          select: queryArgs.select,
        })
        return this.prisma.sanitizePayload(data, modelName)
      },
      () => modelClient.count({ where }),
      pick(queryArgs, ["first", "last", "after", "before"])
    )

    const sanitizedResult = this.prisma.sanitizeConnection(result)
    return sanitizedResult
  }
}
