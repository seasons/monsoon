import "module-alias/register"

import * as util from "util"

import { PrismaSelect } from "@paljs/plugins"
import { Prisma } from "@prisma/client"
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
  const a = await ps.client2.product.findMany({
    where: {
      brand: { shopifyShop: { enabled: true } },
      variants: {
        some: { shopifyProductVariant: { cacheExpiresAt: { lt: new Date() } } },
      },
    },
  })
  const b = head(
    await ps.client2.physicalProduct.findMany({
      where: { price: { buyUsedEnabled: true }, inventoryStatus: "Reserved" },
      select: {
        inventoryStatus: true,
        productVariant: {
          select: { product: { select: { slug: true } }, id: true },
        },
      },
    })
  )
  const c = await ps.client2.bagItem.findFirst({
    where: {
      productVariant: { id: b.productVariant[0].id },
      status: "Reserved",
    },
    select: {
      customer: { select: { user: { select: { email: true } } } },
      productVariant: {
        select: { product: { select: { slug: true } }, sku: true },
      },
    },
  })
  console.dir(c, { depth: null })
}
run()
