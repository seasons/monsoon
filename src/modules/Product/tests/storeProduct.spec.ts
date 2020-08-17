import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ID_Input, InventoryStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import * as Airtable from "airtable"

import { ProductModuleDef } from "../product.module"
import { ProductWithPhysicalProducts } from "../product.types"
import { ProductService } from "../services/product.service"
import { ProductUtilsService } from "../services/product.utils.service"

const ONE_MIN = 60000

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

interface TestPhysicalProduct {
  id: ID_Input
  inventoryStatus: InventoryStatus
  productVariant?: {
    id: ID_Input
    total: number
    reserved: number
    reservable: number
    nonReservable: number
    offloaded: number
    stored: number
  }
}

describe("Store Product", () => {
  let productService: ProductService
  let prismaService: PrismaService
  let productUtilsService: ProductUtilsService
  let utilsService: UtilsService
  let testUtilsService: TestUtilsService

  beforeAll(async done => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    productService = moduleRef.get<ProductService>(ProductService)
    productUtilsService = moduleRef.get<ProductUtilsService>(
      ProductUtilsService
    )
    utilsService = moduleRef.get<UtilsService>(UtilsService)
    testUtilsService = new TestUtilsService(prismaService, utilsService)
    done()
  })

  describe("Works", () => {
    let testProduct
    let cleanupFunc
    let reservedUnit: TestPhysicalProduct
    let reservableUnit: TestPhysicalProduct
    let offloadedUnit: TestPhysicalProduct
    let nonReservableUnit: TestPhysicalProduct

    afterAll(async done => {
      await cleanupFunc()
      done()
    })

    beforeAll(async done => {
      ;({
        product: testProduct,
        cleanupFunc,
      } = await testUtilsService.createTestProduct(
        {
          variants: [
            {
              physicalProducts: [
                { inventoryStatus: "Reservable" },
                { inventoryStatus: "Reserved" },
              ],
            },
            {
              physicalProducts: [
                { inventoryStatus: "NonReservable" },
                { inventoryStatus: "Offloaded" },
              ],
            },
          ],
        },
        `{
        id
        variants {
          id
          physicalProducts {
            id
            inventoryStatus
          }
        }
      }`
      ))
      let testPhysicalProducts = productUtilsService.physicalProductsForProduct(
        testProduct as ProductWithPhysicalProducts
      )
      const reservedUnitID = testPhysicalProducts.find(
        a => a.inventoryStatus === "Reserved"
      ).id
      const reservableUnitID = testPhysicalProducts.find(
        a => a.inventoryStatus === "Reservable"
      ).id
      const offloadedUnitID = testPhysicalProducts.find(
        a => a.inventoryStatus === "Offloaded"
      ).id
      const nonReservableUnitID = testPhysicalProducts.find(
        a => a.inventoryStatus === "NonReservable"
      ).id

      // Store the product
      await productService.updateProduct({
        where: { id: testProduct.id },
        data: { status: "Stored" },
        info: null,
      })

      // Retrieve the updated product and physical products
      testProduct = await retrieveTestProductWithNecessaryFields(
        testProduct,
        prismaService
      )
      testPhysicalProducts = productUtilsService.physicalProductsForProduct(
        testProduct as ProductWithPhysicalProducts
      )
      reservedUnit = testPhysicalProducts.find(a => a.id === reservedUnitID)
      reservableUnit = testPhysicalProducts.find(a => a.id === reservableUnitID)
      offloadedUnit = testPhysicalProducts.find(a => a.id === offloadedUnitID)
      nonReservableUnit = testPhysicalProducts.find(
        a => a.id === nonReservableUnitID
      )

      done()
    }, ONE_MIN)

    it("updates product status", () => {
      expect(testProduct.status).toEqual("Stored")
    })

    it("leaves reserved items alone", () => {
      expect(reservedUnit.inventoryStatus).toEqual("Reserved")
      expect(reservedUnit.productVariant.reserved).toEqual(1)
    })

    it("leaves offloaded items alone", () => {
      expect(offloadedUnit.inventoryStatus).toEqual("Offloaded")
      expect(offloadedUnit.productVariant.offloaded).toEqual(1)
    })

    it("moves reservable items to storage", () => {
      expect(reservableUnit.inventoryStatus).toEqual("Stored")
      expect(reservableUnit.productVariant.stored).toEqual(1)
    })

    it("moves nonreservable items to storage", () => {
      expect(nonReservableUnit.inventoryStatus).toEqual("Stored")
      expect(nonReservableUnit.productVariant.stored).toEqual(1)
    })
  })
})

async function retrieveTestProductWithNecessaryFields(
  testProduct,
  prismaService
) {
  return await prismaService.binding.query.product(
    {
      where: { id: testProduct.id },
    },
    // retrieve fields to facilitate expects
    `{
        id
        status
        variants {
            id
            physicalProducts {
                id
                inventoryStatus
                productVariant {
                    id
                    total
                    reservable
                    reserved
                    nonReservable
                    offloaded
                    stored
                }
            }
        }
    }`
  )
}
