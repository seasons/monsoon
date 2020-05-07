import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"
import {
  ProductUtilsService,
  PhysicalProductUtilsService,
  ProductVariantService,
  ProductService,
} from "../modules/Product/index"
import { WarehouseLocationCreateInput, WarehouseLocationType } from "../prisma"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PhysicalProductService } from "../modules/Product/services/physicalProduct.service"

const run = async () => {
  const ps = new PrismaService()
  let productUtilsService = new ProductUtilsService(ps)
  let physicalProductUtilsService = new PhysicalProductUtilsService(
    ps,
    productUtilsService
  )
  let productVariantService = new ProductVariantService(
    ps,
    physicalProductUtilsService,
    null
  )
  const utilsService = new UtilsService(ps)
  const physicalProductsService = new PhysicalProductService(
    ps,
    productVariantService,
    new ProductService(
      ps,
      productUtilsService,
      productVariantService,
      utilsService
    ),
    physicalProductUtilsService
  )

  let locationCode
  let itemCode
  let typePrefix
  let i
  let type: WarehouseLocationType

  // TODO: Run it through the validator
  const printAndCreateRecord = async (
    a: Omit<WarehouseLocationCreateInput, "barcode">
  ) => {
    const barcode = createBarcode(typePrefix, locationCode, itemCode)
    const input = { ...a, barcode }
    console.log(barcode)
    try {
      await physicalProductsService.validateWarehouseLocationStructure(input)
      await ps.client.createWarehouseLocation(input)
    } catch (err) {
      console.log(err)
    }
  }

  const createBarcode = (typePrefix, locationCode, itemCode) =>
    `${typePrefix}-${locationCode}-${itemCode}`

  // Generate all conveyer records
  typePrefix = "C"
  locationCode = "A100"
  type = "Conveyor"
  i = 1
  while (i <= 1000) {
    itemCode = `${i++}`.padStart(4, "0")
    await printAndCreateRecord({ type, itemCode, locationCode })
  }

  // Generate all slick rail records
  typePrefix = "SR"
  type = "Rail"
  const allBrandCodes = (await ps.client.brands()).map(a => a.brandCode)
  for (locationCode of ["A100", "A110"]) {
    for (itemCode of allBrandCodes) {
      await printAndCreateRecord({ type, itemCode, locationCode })
    }
  }

  // Generate all drawer bin records
  typePrefix = "DB"
  type = "Bin"
  for (const y of getArrayOfIntsWithGap10(100, 330)) {
    locationCode = `A${y}`
    for (const x of ["A", "B", "C", "D"]) {
      for (const z of getArrayOfIntsWithGap10(100, 150)) {
        itemCode = `${x}${z}`
        await printAndCreateRecord({ type, itemCode, locationCode })
      }
    }
  }
}

/**
 * Given a min and max, generate an array of ints that starts at the min
 * and ends at the max. e.g (10, 50) => [10, 20, 30, 40, 50]
 */
function getArrayOfIntsWithGap10(min: number, max: number) {
  let y = min
  let res = []
  while (y <= max) {
    res.push(y)
    y = y + 10
  }
  return res
}

run()
