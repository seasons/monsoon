import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handle = (err, result) => {
  if (err) {
    return err
  }
  if (result) {
    return result
  }
}

const run = async () => {
  const ps = new PrismaService()

  const allActiveSubs = []
  let offset = "start"
  while (true) {
    let list
    ;({ next_offset: offset, list } = await chargebee.subscription
      .list({
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
        "status[is]": "active",
      })
      .request())
    allActiveSubs.push(...list?.map(a => a.subscription))
    if (!offset) {
      break
    }
  }

  const numActiveSubs = allActiveSubs.length
  let i = 0
  for (const sub of allActiveSubs) {
    console.log(`${i++}/${numActiveSubs}`)
    const chargebeeCustId = sub.customer_id
    const cust = await ps.client.customer.findFirst({
      where: { user: { id: chargebeeCustId } },
      select: {
        bagItems: { where: { status: "Reserved" }, select: { id: true } },
      },
    })
    if (!cust) {
      throw new Error(`no customer found for ${chargebeeCustId}`)
    }
    const hasNoReservedItems = cust.bagItems.length === 0
    if (hasNoReservedItems) {
      await chargebee.subscription
        .cancel(sub.id, {
          end_of_term: true,
        })
        .request(handle)
      await sleep(100)
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

run()
