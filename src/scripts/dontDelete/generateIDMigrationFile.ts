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
  ]

  const ps = new PrismaService()
  const datamodel = new PrismaSelect(null).dataModel
  for (const model of datamodel) {
    let addSpace = false
    for (const field of model.fields) {
      if (field.isId || (field.name.length > 2 && field.name.endsWith("Id"))) {
        if (ignoreList.includes(field.name)) {
          continue
        }
        addSpace = true
        console.log(
          `ALTER TABLE monsoon$staging."${model.name}" ALTER COLUMN "${field.name}" SET DATA TYPE character varying(30);`
        )
      }
    }
    if (addSpace) {
      console.log("")
    }
  }
}
run()
