import "module-alias/register"

import { PrismaSelect } from "@paljs/plugins"

import { PrismaService } from "../../prisma/prisma.service"

const context = {
  modelFieldsByModelName: new PrismaSelect(null).dataModel.reduce(
    (accumulator, currentModel) => {
      accumulator[currentModel.name] = currentModel.fields
      return accumulator
    },
    {}
  ),
}

const run = async () => {
  const ignoreList = [
    "webflowId",
    "auth0Id",
    "impactId",
    "subscriptionId",
    "notificationBarId",
    "smsId",
    "giftId",
    "emailId",
    "externalId",
    "actionId",
    "logId",
  ]

  let sanitize = fieldName => {
    if (fieldName === "membershipSubscriptionId") {
      return "subscription"
    } else if (fieldName === "reservationReceiptId") {
      return "reservationReceipt"
    } else return fieldName
  }

  const ps = new PrismaService()
  const datamodel = new PrismaSelect(null).dataModel
  for (const model of datamodel) {
    let addSpace = false
    for (const field of model.fields) {
      if (
        field.isId ||
        (field.name.length > 2 && field.name.endsWith("Id")) ||
        (model.name === "OrderLineItem" && field.name === "recordID")
      ) {
        let underlyingFieldName = field.name

        const nameWithoutId = field.name.slice(0, field.name.length - 2) // e.g nodeId --> node
        if (model.fields.map(a => a.name).includes(nameWithoutId)) {
          underlyingFieldName = nameWithoutId
        }
        if (ignoreList.includes(field.name)) {
          continue
        }
        addSpace = true
        console.log(
          `ALTER TABLE monsoon$staging."${model.name}" ALTER COLUMN "${sanitize(
            underlyingFieldName
          )}" SET DATA TYPE character varying(30);`
        )
      }
    }
    if (addSpace) {
      console.log("")
    }
  }
}
run()
