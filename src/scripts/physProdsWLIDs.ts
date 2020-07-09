import "module-alias/register"

import * as fs from "fs"

import convertArrayToCSV from "convert-array-to-csv"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allPhysProds = await ps.binding.query.physicalProducts(
    {},
    `{
      seasonsUID
      warehouseLocation {
          id
          barcode
      }
  }`
  )
  const list = []
  for (const physProd of allPhysProds) {
    if (!!physProd.warehouseLocation) {
      list.push([physProd.seasonsUID, physProd.warehouseLocation.barcode])
      // list.push(`${physProd.seasonsUID}${physProd.warehouseLocation.barcode}\n`)
    } else {
      list.push([physProd.seasonsUID])
    }
  }
  fs.writeFileSync("SUIDsWithWLIDs.csv", convertArrayToCSV(list))
}

run()
