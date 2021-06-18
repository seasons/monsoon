import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Injectable } from "@nestjs/common"
import {
  makeOrderByPrisma2Compatible,
  makeWherePrisma2Compatible,
} from "@prisma/binding-argument-transform"
import { Prisma } from "@prisma/client"
import {
  PrismaService,
  SCALAR_LIST_FIELD_NAMES,
  SINGLETON_RELATIONS_POSING_AS_ARRAYS,
} from "@prisma1/prisma.service"
import { GraphQLResolveInfo } from "graphql"
import graphqlFields from "graphql-fields"
import {
  cloneDeep,
  get,
  isArray,
  isEmpty,
  lowerFirst,
  merge,
  pick,
} from "lodash"

interface InfoToSelectParams {
  info: GraphQLResolveInfo | any
  modelName: Prisma.ModelName | "Me"
  modelFieldsByModelName: any
}

@Injectable()
export class QueryUtilsService {
  constructor(private readonly prisma: PrismaService) {
    QueryUtilsService.fieldCache.clear()
  }

  // e.g {GetBrowseProducts: {brands: ..., products: ...}}
  private static fieldCache = new Map() as Map<string, Map<string, any>>

  static getQuerykey = info => {
    let queryKey = info.path.key
    let level = info.path
    while (!!level.prev) {
      level = level.prev
      queryKey = level.key
    }
    return queryKey
  }

  static infoToSelect(params: InfoToSelectParams): any {
    const { info, modelName, modelFieldsByModelName } = params

    // Parse the fields object
    let fields = graphqlFields(info)

    // Depending on whether or not we're analyzing at the level of a top-level query key,
    // either cache the fields object or deepmerge with the relevant cached fields object
    const opName = info.operation?.name?.value || info.operation // TODO: How to handle queries without operation names?
    const queryKey = this.getQuerykey(info)
    const isTopLevelkeyInOperation = !info.path.prev

    if (isTopLevelkeyInOperation) {
      const fieldCache = this.fieldCache.get(opName) || new Map()
      fieldCache.set(queryKey, fields)
      this.fieldCache.set(opName, fieldCache)
    } else {
      fields = this.deepMergeWithFieldsFromQueryKey(
        fields,
        info,
        opName,
        queryKey
      )
    }

    // We run select on "Me" only to cache the fields object for selects calculated
    // further down the selection set hierarchy. So exit early.
    if (["Me", "Homepage"].includes(modelName)) {
      return null
    }

    const select = this.fieldsToSelect(
      fields,
      modelFieldsByModelName,
      modelName as Prisma.ModelName
    )

    return select
  }

  static fieldsToSelect(
    fields,
    modelFieldsByModelName,
    modelName: Prisma.ModelName,
    { callType } = { callType: "initial" }
  ) {
    let fieldsToParse = fields
    let _modelName = modelName

    // If it's a connection, grab the fields at edges.node
    if (modelName.includes("Connection")) {
      _modelName = modelName.replace("Connection", "") as Prisma.ModelName
      fieldsToParse = fields.edges?.node
      if (!fieldsToParse) {
        return null
      }
    }

    const modelFields = modelFieldsByModelName[_modelName]
    if (isEmpty(modelFields)) {
      throw new Error(`Invalid record type: ${modelName}`)
    }

    let select = { select: {} }
    const requestedFields = new Set(Object.keys(fieldsToParse))
    modelFields.forEach(field => {
      if (!requestedFields.has(field.name)) {
        return
      }

      switch (field.kind) {
        case "scalar":
          select.select[field.name] = true
          break
        case "object":
          // If it's a scalar list, return true
          if (SCALAR_LIST_FIELD_NAMES[modelName]?.includes(field.name)) {
            select.select[field.name] = true
          } else {
            // Otherwise recurse down
            select.select[field.name] = this.fieldsToSelect(
              fieldsToParse[field.name],
              modelFieldsByModelName,
              field.type,
              { callType: "recursive" }
            )
          }
      }
    })

    return callType === "initial" ? select.select : select
  }

  static deepMergeWithFieldsFromQueryKey(fields, info, opName, queryKey) {
    let newFields = cloneDeep(fields)

    const cachedFieldsForQueryKey = this.fieldCache.get(opName)?.get(queryKey)
    if (!cachedFieldsForQueryKey) {
      throw new Error(
        `Query key ${queryKey} on operation ${opName} not in fieldCache`
      )
    }

    // Use path object to construct a get string
    let level = info.path
    const pathKeys = []
    while (!!level.prev && level.key !== "node") {
      if (typeof level.key === "string") {
        pathKeys.push(level.key)
      }
      level = level.prev
    }
    if (pathKeys.length < 1) {
      throw new Error(`Can not deep merge with fields if path has length 0`)
    }
    const getString = pathKeys.reverse().join(".")

    // Get the select at this level
    const fieldsToMerge = get(cachedFieldsForQueryKey, getString)

    newFields = merge(fieldsToMerge, newFields)

    return newFields
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
        ...where,
        AND: returnWhere.AND.map(a =>
          QueryUtilsService.sanitizeWhere(a, modelName)
        ),
      }
    }
    if (!!returnWhere["OR"]) {
      return {
        ...where,
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
  private static notNullToNotUndefined = (obj: any) => {
    // Base case
    if (typeof obj !== "object") {
      return obj
    }

    if (isArray(obj)) {
      return obj.map(QueryUtilsService.notNullToNotUndefined)
    }

    const returnObj = { ...obj }
    for (const key of Object.keys(returnObj)) {
      if (returnObj[key] === null) {
        returnObj[key] = undefined
      } else if (typeof returnObj[key] === "object") {
        returnObj[key] = QueryUtilsService.notNullToNotUndefined(returnObj[key])
      }
    }

    return returnObj
  }

  prismaOneToPrismaTwoMutateArgs(
    prismaOneArgs,
    record: { id: string },
    modelName: Prisma.ModelName,
    type: "create" | "update"
  ) {
    const scalarListFieldNames = SCALAR_LIST_FIELD_NAMES[modelName]

    let args = cloneDeep(prismaOneArgs)
    const mutateKeys = Object.keys(prismaOneArgs)

    // Translate scalar list fields
    scalarListFieldNames.forEach(field => {
      if (!mutateKeys.includes(field) || !args[field]) {
        return
      }
      args[field] = this.createScalarListMutateInput(
        args[field]["set"],
        record.id,
        type
      )
    })

    // Change nulls to undefined
    mutateKeys.forEach(k => {
      if (args[k] === null) {
        args[k] = undefined
      }
    })

    return args
  }

  async resolveFindMany<T>(
    findManyArgs,
    modelName: Prisma.ModelName
  ): Promise<T[]> {
    const modelClient = this.prisma.client2[lowerFirst(modelName)]
    const data = await modelClient.findMany({
      ...findManyArgs,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, modelName)

    return sanitizedData
  }

  createScalarListMutateInput<T>(
    values: string[],
    nodeId: string,
    type: "create" | "update"
  ): T {
    if (!values) {
      return undefined
    }
    if (type === "create") {
      return {
        createMany: {
          data: values.map((val, idx) => ({
            position: (idx + 1) * 1000, // 1000, 2000, 3000
            value: val,
          })),
          skipDuplicates: true,
        },
      } as any
    }
    if (type === "update") {
      return {
        upsert: values.map((value, idx) => ({
          where: {
            nodeId_position: {
              nodeId: nodeId || "",
              position: (idx + 1) * 1000, // 1000, 2000, 3000
            },
          },
          create: { position: (idx + 1) * 1000, value },
          update: { value },
        })),
        // If we're updating the list to have fewer values than before,
        // we need to remove some values. If the new list has 2 values,
        // this would say to delete all values with position > 3000 for
        // the given nodeId
        deleteMany: {
          nodeId: nodeId || "",
          position: { gte: (values.length + 1) * 1000 },
        },
      } as any
    }
  }
  async resolveFindUnique<T>(
    findUniqueArgs: { where: any; select?: any; include?: any },
    modelName: Prisma.ModelName
  ): Promise<T> {
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
      skip?: number
    },
    modelName: Prisma.ModelName
  ) {
    const { where, orderBy } = QueryUtilsService.prismaOneToPrismaTwoArgs(
      queryArgs,
      modelName
    )

    const modelClient = this.prisma.client2[lowerFirst(modelName)]
    const findManyArgs = { where, orderBy, select: queryArgs.select }
    if (!!queryArgs.skip) {
      findManyArgs["skip"] = queryArgs.skip
    }
    const result = await findManyCursorConnection(
      async args => {
        const data = await modelClient.findMany({
          ...args,
          ...findManyArgs,
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
