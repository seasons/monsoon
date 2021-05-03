import "module-alias/register"

import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  await ps.client.updateCustomer({
    where: { id: "ck2ge3c2c06cf07577w6h298c" },
    data: {
      impactSyncTimings: {
        create: {
          type: "Impact",
          detail: "AccountCreation",
          syncedAt: new Date(),
        },
      },
    },
  })
}
run()
