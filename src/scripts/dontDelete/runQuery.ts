import "module-alias/register"

import * as util from "util"

import { PrismaSelect } from "@paljs/plugins"
import { Prisma } from "@prisma/client"
import { head } from "lodash"
import cuid from 'cuid'
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
<<<<<<< Updated upstream
  const status = "Completed"
  const _latestReservation = await ps.client2.reservation.findFirst({
    where: {
      customer: {
        id: "ck2gf2ri406e507578uvm2nk5",
      },
      status,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: Prisma.validator<Prisma.ReservationSelect>()({
      id: true,
      products: {
        select: {
          id: true,
          seasonsUID: true,
          inventoryStatus: true,
          productStatus: true,
          productVariant: { select: { id: true } },
        },
      },
      receivedAt: true,
      status: true,
      reservationNumber: true,
      createdAt: true,
    }),
  })
  console.dir(_latestReservation)
=======
  const txn1 = ps.client2.product.upsert({
    where: { slug: "test-slug" },
    create: {
      buyNewEnabled: true,
      slug: "test-slug",
      name: "test-prod",
      functions: {
        connectOrCreate: {
          where: { name: "yo-func" },
          create: { name: "yo-func" },
        },
      },
    },
    update: {
      buyNewEnabled: false,
    },
  })
  const prodVarId = cuid()
  const txn2 = ps.client2.productVariant.create({
    data: {
      id: prodVarId
      sku: "test-sku-1",
      productID: "test-slug",
      product: { connect: { slug: "test-slug" } },
      total: 1,
      reservable: 0,
      reserved: 0,
      nonReservable: 1,
      stored: 0,
      offloaded: 0
    },
  })
>>>>>>> Stashed changes
}
run()
