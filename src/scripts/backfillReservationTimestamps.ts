import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const reservations = await ps.client.reservations({})
  const logs = await ps.client.adminActionLogs({
    where: {
      AND: [
        { entityId_in: reservations.map(a => a.id) },
        { tableName: "Reservation" },
      ],
    },
  })
  for (const r of reservations) {
    let data = {}
    const relevantLogs = logs.filter(a => (a.entityId = r.id))
    const completedLog = relevantLogs.find(
      a => a.changedFields?.["status"] === "Completed"
    )
    const cancelledLog = relevantLogs.find(
      a => a.changedFields?.["status"] === "Cancelled"
    )
    if (!!completedLog) {
      data["completedAt"] = completedLog.triggeredAt
    }
    if (!!cancelledLog) {
      data["cancelledAt"] = cancelledLog.triggeredAt
    }
    if (Object.keys(data).length > 0) {
      await ps.client.updateReservation({ where: { id: r.id }, data })
    }
  }
}

run()
