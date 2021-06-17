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
  const txn1 = ps.client2.product.upsert({
    where: { slug: "test-slug3" },
    create: {
      buyNewEnabled: true,
      slug: "test-slug3",
      name: "test-prod",
      functions: {
        connectOrCreate: {
          where: { name: "yo-func" },
          create: { name: "yo-func" },
        },
      },
      brand: { connect: { id: "ck2ze90tf0pj50734abl5rs4y" } },
      color: { connect: { id: "ck2f763vs00w70757akr02h8b" } },
      category: { connect: { id: "ck2ze98ur0pqq0734jofkk8xv" } },
    },
    update: {
      buyNewEnabled: false,
    },
  })
  const prodVarId = cuid()
  const txn2 = ps.client2.productVariant.create({
    data: {
      id: prodVarId,
      sku: "test-sku-3",
      productID: "test-slug3",
      product: { connect: { slug: "test-slug3" } },
      total: 1,
      reservable: 0,
      reserved: 0,
      nonReservable: 1,
      stored: 0,
      offloaded: 0,
      displayShort: "yo-momma",
    },
  })
  const txn3 = ps.client2.physicalProduct.create({
    data: {
      productVariant: { connect: { id: prodVarId } },
      seasonsUID: "test-sku-3-yo",
      inventoryStatus: "NonReservable",
      productStatus: "New",
      sequenceNumber: 9000,
    },
  })

  await ps.client2.$transaction([txn1, txn2, txn3])
}
run()
