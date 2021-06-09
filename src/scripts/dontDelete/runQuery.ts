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
}
run()
