import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { Prisma as PrismaClient, prisma } from "./"
import { Prisma as PrismaBinding } from "./prisma.binding"
import { PrismaClient as PrismaClient2 } from '@prisma/client'
import { PrismaSelect } from "@paljs/plugins"
import { isArray, isEmpty } from "lodash"
import graphqlFields from "graphql-fields"

const SCALAR_LIST_FIELD_NAMES = {
  "Brand": ["styles"],
  "Collection": ["descriptions", "placements"],
  "Product": ["outerMaterials", "innerMaterials", "styles"],
  "ProductSeason": ["wearableSeasons"],
  "ShopifyShop": ["scope"],
  "PhysicalProductQualityReport": ["damageTypes"],
  "SmsReceipt": ["mediaUrls"],
  "FitPic": ["products"],
  "User": ["roles"],
  "StylePreferences": ["styles", "patterns", "colors", "brands"],
  "CustomerDetail": ["weight", "topSizes", "waistSizes", "styles"],
  "ProductVariantFeedbackQuestion": ["options", "responses"],
  "ProductRequest": ["images"]
}

@Injectable()
export class PrismaService implements UpdatableConnection {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false, 
  })
  client: PrismaClient = prisma
  client2: PrismaClient2 = new PrismaClient2()

  infoToSelect(info, modelName) {
    const prismaSelect = new PrismaSelect(info)
    const fields = graphqlFields(info)

    // TODO: Cache this in a class
    const modelFields = prismaSelect.dataModel.find(a => a.name === modelName)
      .fields
    if (isEmpty(modelFields)) {
      throw new Error (`Invalid record type: ${modelName}`)
    }

    let select = { select: {} }
    Object.values(modelFields).forEach((field, index) => {
      console.log(field.name, field.type)
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
              const subFieldNodes = info.fieldNodes[0].selectionSet.selections.find(a => a.name.value === field.name)
              fieldSelect = this.infoToSelect({fieldNodes: [subFieldNodes], returnType: field.type}, field.type)
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

  /* While transitioning from prisma1 to prisma2, we are not able to
  directly query scalar lists in prisma2. This is a helper function that
  allows us to bridge the gap */
  sanitizeScalarLists(payload: any, modelName: string) {
    const scalarListFieldNames = SCALAR_LIST_FIELD_NAMES[modelName] || []

    if (isArray(payload)) {
      return payload.map(a => this.sanitizeScalarLists(a, modelName))
    }
    
    // Sanitize scalar lists on the top level of the object
    let returnPayload = {...payload}
    scalarListFieldNames.forEach((fieldName) => {
      returnPayload[fieldName] = payload?.[fieldName]?.map(a => a.value)
    })

    // Sanitize nested scalar lists
    const dataModel = new PrismaSelect(null).dataModel
    const model = dataModel.find(a => a.name === modelName)
    model.fields.forEach((field) => {
      const fieldInPayload = !!payload[field.name]
      const fieldIsNotScalarList = !scalarListFieldNames.includes(field.name)
      if (fieldInPayload && field.kind === "object" && fieldIsNotScalarList) {
        returnPayload[field.name] = this.sanitizeScalarLists(payload[field.name], field.type)
      }
    })

    return returnPayload
  }

  updateConnection({ secret, endpoint }: { secret: string; endpoint: string }) {
    this.binding = new PrismaBinding({
      secret,
      endpoint,
      debug: false,
    })
    this.client = new PrismaClient({
      secret,
      endpoint,
      debug: false,
    })

  }
}