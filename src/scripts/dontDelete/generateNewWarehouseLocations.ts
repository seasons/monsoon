import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { Prisma, WarehouseLocationType } from "@prisma/client"

import { AppModule } from "../../app.module"
import { PhysicalProductService } from "../../modules/Product/services/physicalProduct.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const app = await NestFactory.createApplicationContext(AppModule)
  const physicalProductsService = app.get(PhysicalProductService)

  let locationCode
  let itemCode
  let typePrefix
  let i
  let type: WarehouseLocationType

  const printAndCreateRecord = async (
    a: Omit<Prisma.WarehouseLocationCreateInput, "barcode">
  ) => {
    const barcode = createBarcode(typePrefix, locationCode, itemCode)
    const input = { ...a, barcode }
    console.log(barcode)
    try {
      await physicalProductsService.validateWarehouseLocationStructure(input)

      await ps.client.warehouseLocation.upsert({
        where: { barcode },
        create: input,
        update: input,
      })
    } catch (err) {
      console.log(err)
    }
  }

  const createBarcode = (typePrefix, locationCode, itemCode) =>
    `${typePrefix}-${locationCode}-${itemCode}`

  // Generate all slick rail records
  typePrefix = "SR"
  type = "Rail"
  const locationCodes = ["A100", "A110", "A120", "A130", "A140"]

  const itemCodes = []
  for (let i = 100; i <= 990; i = i + 10) {
    for (const x of ["A", "B", "C"]) {
      itemCodes.push(`${x}${i}`)
    }
  }

  for (locationCode of locationCodes) {
    for (itemCode of itemCodes) {
      await printAndCreateRecord({ type, itemCode, locationCode })
    }
  }
}

run()
