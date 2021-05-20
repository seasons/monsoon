import { SCALAR_LIST_FIELD_NAMES } from "@app/prisma/prisma.service"
import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { PrismaSelect } from "@paljs/plugins"
import graphqlFields from "graphql-fields"
import { isEmpty } from "lodash"

import { getReturnTypeFromInfo } from "./utils"

export const Select = createParamDecorator(
  (data, context: ExecutionContext): any => {
    const [obj, args, ctx, info] = context.getArgs()
    const modelName = getReturnTypeFromInfo(info)

    const select = infoToSelect(info, modelName, ctx.modelFieldsByModelName)
    return select
  }
)

const infoToSelect = (info, modelName, modelFieldsByModelName) => {
  const prismaSelect = new PrismaSelect(info)
  let fields = graphqlFields(info)

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
              fieldSelect = infoToSelect(
                {
                  fieldNodes: [subFieldNodes],
                  returnType: field.type,
                  fragments: info.fragments,
                },
                field.type,
                modelFieldsByModelName
              )
            } else {
              // field is coming from one or more fragments. get the field nodes accordingly
              const returnType = getReturnTypeFromInfo(info)
              const parentFragments = Object.keys(info.fragments)
                .filter(
                  k => info.fragments[k].typeCondition.name.value === returnType
                )
                .map(k2 => info.fragments[k2])
              fieldSelect = parentFragments.reduce(
                (accumulatedFieldSelect: any, currentFragment: any) => {
                  const currentFieldNodes = currentFragment.selectionSet.selections.find(
                    a => a.name.value === field.name
                  )
                  const currentFieldSelect = infoToSelect(
                    {
                      fieldNodes: [currentFieldNodes],
                      returnType: field.type,
                      fragments: info.fragments,
                    },
                    field.type,
                    modelFieldsByModelName
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

  return select
}
