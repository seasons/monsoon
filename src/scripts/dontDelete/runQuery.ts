import "module-alias/register"

import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  // const logsWithoutInterpretedAt = await ps.client.adminActionLogs({
  //   where: {
  //     AND: [{ interpretedAt: null }, { interpretation: { id_not: null } }],
  //   },
  // })
  // for (const log of logsWithoutInterpretedAt) {
  //   await ps.client.updateAdminActionLog({
  //     where: { actionId: log.actionId },
  //     data: { interpretedAt: new Date() },
  //   })
  // }
  // const x = await ps.client2.adminActionLogInterpretation.create({
  //   data: {
  //     logId: 29921,
  //     entityId: "ck8appbxn6mtl0792qao63grz",
  //     tableName: "PhysicalProduct",
  //     interpretation: "Stowed at C-A100-0071",
  //   },
  // })
  // console.log(x)
  await ps.client2.adminActionLogInterpretation.deleteMany({
    where: { id: { not: undefined } },
  })
  await ps.client2.adminActionLog.updateMany({
    where: { interpretedAt: { not: undefined } },
    data: { interpretedAt: null },
  })
  // console.log(logsWithoutInterpretedAt.length)
  // await ps.client.createAdminActionLogInterpretation({
  //   log: { connect: { actionId: 14306 } },
  //   entityId: "ckgh8yokr05nv0773zp0izu4w",
  //   tableName: "PhysicalProduct",
  //   interpretation: "Stowed at C-A100-0924" || "", // may be undefined,
  // })
  // await ps.client.updateAdminActionLog({
  //   where: { actionId: 14306 },
  //   data: { interpretedAt: new Date() },
  // })
}
run()
