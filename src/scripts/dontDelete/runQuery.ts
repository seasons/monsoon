import "module-alias/register"

import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  await ps.client.updateManyAdminActionLogs({
    data: { interpretedAt: null },
    where: { tableName: "PhysicalProduct" },
  })
}

run()
