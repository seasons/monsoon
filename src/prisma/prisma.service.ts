import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { Prisma as PrismaClient, prisma } from "./"
import { Prisma as PrismaBinding } from "./prisma.binding"
import { PrismaClient as PrismaClient2 } from '@prisma/client'
import { PrismaSelect } from "@paljs/plugins"
import { isArray, isEmpty } from "lodash"

export const SCALAR_LIST_FIELD_NAMES = {
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
  private prismaSelect = new PrismaSelect(null)

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
    const dataModel = this.prismaSelect.dataModel
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