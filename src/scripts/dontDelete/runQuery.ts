import "module-alias/register"

import * as util from "util"

import { PrismaSelect } from "@paljs/plugins"
import { Prisma, prisma } from "@prisma/client"
import cuid from "cuid"
import { head } from "lodash"
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
  const bagItems = await ps.client2.bagItem.findMany({
    where: { productVariantId: undefined },
  })
  console.log(bagItems)
}
run()
