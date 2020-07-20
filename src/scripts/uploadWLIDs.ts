import "module-alias/register"

import * as fs from "fs"

import csv from "csv-parser"

import { PhysicalProductUpdateInput } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  let i = 0
  const pipe = fs
    .createReadStream("suidsWithWLIDs.csv")
    .pipe(csv())
    .on("data", async row => {
      console.log(`${i++} of ~1300`)
      // console.log(row.WLID)
      pipe.pause()
      const physProd = await ps.binding.query.physicalProduct(
        {
          where: { seasonsUID: row.SUID },
        },
        `{warehouseLocation {id}}`
      )
      try {
        if (!!row.WLID) {
          await ps.client.updatePhysicalProduct({
            where: { seasonsUID: row.SUID },
            data: { warehouseLocation: { connect: { barcode: row.WLID } } },
          })
          console.log(`set ${JSON.stringify(row)}`)
        } else {
          if (!!physProd.warehouseLocation) {
            await ps.client.updatePhysicalProduct({
              where: { seasonsUID: row.SUID },
              data: { warehouseLocation: { disconnect: true } },
            })
            console.log(`unset ${JSON.stringify(row)}`)
          }
          console.log(`no need to unset ${JSON.stringify(row)}`)
        }
      } catch (err) {
        console.log(`failed ${JSON.stringify(row)}`)
        console.log(err)
      }
      pipe.resume()
    })
    .on("end", () => {
      console.log("CSV file successfully processed")
    })

  // console.log(`num updates: ${updates.length}`)
  // for (const update in updates) {
  //   try {
  //     await ps.client.updatePhysicalProduct(update as any)
  //     console.log(`successfully updated ${update}`)
  //   } catch (err) {
  //     console.log(`error on ${update}`)
  //     console.log(err)
  //   }
  // }
}

run()
