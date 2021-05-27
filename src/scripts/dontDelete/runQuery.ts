import "module-alias/register"

import * as util from "util"

import { PrismaSelect } from "@paljs/plugins"
import { Prisma } from "@prisma/client"
import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { QueryUtilsService } from "../../modules/Utils/services/queryUtils.service"
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
  const ps = new PrismaService()
  const info = `{
    id
    status
    customer {
      id
    }
    lineItems {
        id
        recordType
        recordID
    }
  }`
  const select = QueryUtilsService.infoToSelect(
    info,
    "ProductVariant",
    context.modelFieldsByModelName
  )
  console.log(util.inspect(select, { depth: null }))
}
run()
