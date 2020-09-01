import "module-alias/register"

import { head, uniqBy } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const findDuplicates = async () => {
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

const fixProduct = async seasonsUID => {
  const ps = new PrismaService()

  const lastPhysicalProduct = head(
    await ps.client.physicalProducts({
      first: 1,
      orderBy: "sequenceNumber_DESC",
    })
  )
  let sequenceNumber = lastPhysicalProduct.sequenceNumber + 1

  await ps.client.updatePhysicalProduct({
    where: { seasonsUID },
    data: {
      sequenceNumber,
    },
  })
  console.log(seasonsUID, ": ", sequenceNumber)
}

// fixProduct("<SUID HERE>")

findDuplicates()
