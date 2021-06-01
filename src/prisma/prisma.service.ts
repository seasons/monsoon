import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { Prisma as PrismaClient, prisma } from "./"
import { Prisma as PrismaBinding } from "./prisma.binding"
import { PrismaClient as PrismaClient2 } from '@prisma/client'
import { PrismaSelect } from "@paljs/plugins"
import { head, isArray, uniq } from "lodash"

export const SCALAR_LIST_FIELD_NAMES = {
  "BlogPost": ["tags"],
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

export const SINGLETON_RELATIONS_POSING_AS_ARRAYS = {
  "Product": ["materialCategory", "model"],
  "ProductVariant": ["product"],
  "ProductVariantFeedback": ["reservationFeedback"],
  "ProductVariantFeedbackQuestion": ["variantFeedback"],
  "PushNotificationReceipt": ["userPushNotification"],
  "ShopifyProductVariantSelectedOption": ["shopifyProductVariant"],
  "SmsReceipt": ["user"],
  "StylePreferences": ["customerDetail"],
  "UserPushNotificationInterest": ["UserPushNotification"],
  "AdminActionLog": ["interpretation"],
  "CustomerNotificationBarReceipt": ["customer"],
  "PhysicalProduct": ["productVariant"]
}

// What was stored and interpreted as JSON in prisma1 will look like
// a string to prisma2 until we complete the migration
const JSON_FIELD_NAMES = {
  "AdminActionLog": ["changedFields", "rowData"],
  "AdminActionLogInterpretation": ["data"],
  "PackageTransitEvent": ["data"],
  "Brand": ["logo"],
  "Category": ["image"]
}

const MODELS_TO_SANITIZE = uniq([...Object.keys(JSON_FIELD_NAMES), ...Object.keys(SINGLETON_RELATIONS_POSING_AS_ARRAYS), ...Object.keys(SCALAR_LIST_FIELD_NAMES)])

@Injectable()
export class PrismaService implements UpdatableConnection {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false, 
  })
  client: PrismaClient = prisma
  client2: PrismaClient2 = new PrismaClient2({ 
    log: ['query', 'info', 'warn', 'error']
  })

  private modelFieldsByModelName = new PrismaSelect(null).dataModel.reduce(
    (accumulator, currentModel) => {
      accumulator[currentModel.name] = currentModel.fields
      return accumulator
    },
    {}
  )

  sanitizeConnection(result) {
    result['aggregate'] = {count: result.totalCount}
    return result
  }

  /*
  Because we're migrating from prisma1 to prisma2 in pieces, there are some
  sticky points we need to navigate until we've finished the whole thing. 

  One thing is that scalar lists will look like objects in prisma2 until we 
  complete the migration. This sanitizer extracts out the value so we can still
  return it as a list.

  Another thing is that some 1:1 and 1:n relations look like m:n relations to prisma2. 
  This sanitizer extracts out the value from the array so we can still return it
  in the format we had it in prisma1
  */
  sanitizePayload(payload: any, modelName: string) {
    if (!payload) {
      return
    }
    
    // If we don't need to sanitize anything, just return
    if (!MODELS_TO_SANITIZE.includes(modelName)) {
      return payload 
    }
    
    if (isArray(payload)) {
      return payload.map(a => this.sanitizePayload(a, modelName))
    }

    let returnPayload = {...payload}

    // Sanitize the top level of the object
    const scalarListFieldNames = SCALAR_LIST_FIELD_NAMES[modelName] || []
    const singleRelationFieldNames = SINGLETON_RELATIONS_POSING_AS_ARRAYS[modelName] || []
    const jsonFieldNames = JSON_FIELD_NAMES[modelName] || []
    scalarListFieldNames.forEach((fieldName) => {
      const fieldInPayload = !!payload[fieldName]
      if (!!fieldInPayload) {
        returnPayload[fieldName] = payload?.[fieldName]?.map(a => a.value)
      }
      
    })
    singleRelationFieldNames.forEach((fieldName) => {
      const fieldInPayload = !!payload[fieldName]
      if (!!fieldInPayload) {
        const valueType = this.modelFieldsByModelName[modelName].find(a => a.name === fieldName).type
        returnPayload[fieldName] = this.sanitizePayload(head(payload?.[fieldName]), valueType)
      }
    })
    jsonFieldNames.forEach((fieldName) => {
      const fieldInPayload = !!payload[fieldName]
      if (!!fieldInPayload) {
        returnPayload[fieldName] = JSON.parse(payload?.[fieldName])
      }
    })

    // Sanitize nested objects
    const modelFields = this.modelFieldsByModelName[modelName]
    modelFields.forEach((field) => {
      const fieldInPayload = !!payload[field.name]
      if (fieldInPayload && field.kind === "object" && !singleRelationFieldNames.includes(field.name) && !scalarListFieldNames.includes(field.name)) {
        returnPayload[field.name] = this.sanitizePayload(payload[field.name], field.type)
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