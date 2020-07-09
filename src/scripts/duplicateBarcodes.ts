import "module-alias/register"

import { uniqBy } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const sequenceNumbers = (await ps.client.physicalProducts()).map(
    a => a.sequenceNumber
  )

  let cases = []
  for (const seqNum of sequenceNumbers) {
    const count = sequenceNumbers.filter(a => a === seqNum).length
    if (count > 1) {
      const physProds = await ps.client.physicalProducts({
        where: { sequenceNumber: seqNum },
      })
      cases.push({
        sequenceNumber: seqNum,
        seasonsUIDs: physProds.map(a => a.seasonsUID),
      })
    }
  }
  cases = uniqBy(cases, a => a.sequenceNumber)
  console.log(`Num cases: ${cases.length}`)
  console.log(cases)
}

run()
