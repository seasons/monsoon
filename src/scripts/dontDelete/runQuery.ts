import "module-alias/register"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const drip = new DripService()

  const allUnsubscribedCustomers = await drip.client.listSubscribers({
    status: "unsubscribed",
  })
  const emails = allUnsubscribedCustomers.body.subscribers.map(a => a.email)
  console.log(emails)
  // console.log(allUnsubscribedCustomers)
  // console.log(allUnsubscribedCustomers.)
}

run()
