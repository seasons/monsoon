import "module-alias/register"

import * as util from "util"

import { Prisma } from "@prisma/client"
import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { QueryUtilsService } from "../../modules/Utils/services/queryUtils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const prisma1Where = {
    where: {
      OR: [
        {
          AND: [
            {
              internalSize: {
                top: {
                  letter_in: [],
                },
              },
            },
            { reservable_gte: 1 },
            {
              product: {
                AND: [{ status: "Available" }, { type: "Top" }],
              },
            },
          ],
        },
        {
          AND: [
            {
              internalSize: {
                display_in: [],
              },
            },
            { reservable_gte: 1 },
            {
              product: {
                AND: [{ status: "Available" }, { type: "Bottom" }],
              },
            },
          ],
        },
      ],
    },
  }
  const {
    where: productVariantWhere,
  } = QueryUtilsService.prismaOneToPrismaTwoArgs(prisma1Where, "ProductVariant")
  await ps.client2.productVariant.findMany({
    where: {
      OR: [
        {
          AND: [
            {
              internalSize: { top: { letter: { in: [] } } },
            },
            { reservable: { gte: 1 } },
            {
              product: {
                every: { AND: [{ status: "Available" }, { type: "Top" }] },
              },
            },
          ],
        },
        {
          AND: [
            { internalSize: { display: { in: [] } } },
            { reservable: { gte: 1 } },
            {
              product: {
                every: { AND: [{ status: "Available" }, { type: "Bottom" }] },
              },
            },
          ],
        },
      ],
    },
  })
  console.log(util.inspect(productVariantWhere, { depth: null }))
}
run()
