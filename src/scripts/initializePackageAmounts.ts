import "module-alias/register"

import shippo from "shippo"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const shippoClient = shippo(process.env.SHIPPO_API_KEY)
  const ps = new PrismaService()

  const packagesToUpdate = await ps.client.package.findMany({
    where: { transactionID: { not: "" } },
    select: { id: true, transactionID: true },
  })

  for (const p of packagesToUpdate) {
    try {
      const shipment = await shippoClient.transaction.retrieve(p.transactionID)
      const rateId = shipment.rate
      const rate = await shippoClient.rate.retrieve(rateId)
      const amount = rate.amount
      await ps.client.package.update({ where: { id: p.id }, data: { amount } })
      //   console.dir(rate, { depth: null })
    } catch (err) {
      console.log(err)
    }
  }
}
run()
