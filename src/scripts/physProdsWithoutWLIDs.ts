import "module-alias/register"

import * as util from "util"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allPhysProds = await ps.binding.query.physicalProducts(
    {},
    `{
      seasonsUID
      warehouseLocation {
          id
      }
  }`
  )
  debugger
  const physProdsWithoutWLIDs = []
  for (const physProd of allPhysProds) {
    if (!physProd.warehouseLocation) {
      physProdsWithoutWLIDs.push(physProd.seasonsUID)
    }
  }
  console.log(`SUIDs without WLIDs: ${physProdsWithoutWLIDs.length}`)
  for (const suid of physProdsWithoutWLIDs) {
    console.log(suid)
  }
}

run()
