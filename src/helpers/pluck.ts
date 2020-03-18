import { buildInfo } from "graphql-binding"
import { Operation } from "graphql-binding/dist/types"
import { FieldNode, GraphQLResolveInfo, GraphQLSchema } from "graphql"

/**
 * Get the named fields from the selection of info's root field
 */
function getFieldsByName(name: string, info: GraphQLResolveInfo): FieldNode[] {
  const infoField = info.fieldNodes[0]
  const { selectionSet } = infoField
  if (!selectionSet)
    throw new Error(`Field '${infoField.name.value}' have no selection.`)

  const { selections } = selectionSet
  const found = selections.filter(
    field => field.kind === "Field" && field.name.value === name
  ) as FieldNode[]

  if (found.length > 0) return found

  throw new Error(
    `Field '${name}' not found in '${infoField.name.value}' selection`
  )
}

function flatMap<T, U>(
  array: T[],
  mapper: (value: T, index: number, array: T[]) => U[]
): U[] {
  return [].concat(...array.map(mapper))
}

export function pluck(
  rootFieldName: string,
  operation: Operation,
  schema: GraphQLSchema,
  fieldName: string,
  info: GraphQLResolveInfo,
  required?: string
): GraphQLResolveInfo {
  const fields = getFieldsByName(fieldName, info)
  const oldSelections = flatMap(fields, (field: FieldNode) =>
    [].concat(field.selectionSet.selections)
  )

  const newInfo = buildInfo(rootFieldName, operation, schema, required)
  const { selectionSet } = newInfo.fieldNodes[0]

  if (required) {
    selectionSet.selections = selectionSet.selections.concat(oldSelections)
  } else {
    selectionSet.selections = oldSelections
  }

  return newInfo
}
