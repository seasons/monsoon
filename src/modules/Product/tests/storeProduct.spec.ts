import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { InventoryStatus } from "@prisma/client"

import { ProductModuleDef } from "../product.module"
import { ProductWithPhysicalProducts } from "../product.types.d"
import { ProductService } from "../services/product.service"

const ONE_MIN = 60000

interface TestPhysicalProduct {
  id: string
  inventoryStatus: InventoryStatus
  productVariant?: {
    id: string
    total: number
    reserved: number
    reservable: number
    nonReservable: number
    offloaded: number
    stored: number
  }
}

// TODO: fix test suite
xdescribe("Store Product", () => {
  let productService: ProductService
  let prismaService: PrismaService
  let productUtilsService: ProductUtilsService
  let utilsService: UtilsService
  let testUtilsService: TestUtilsService
  let queryUtilsService: QueryUtilsService

  beforeAll(async done => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    productService = moduleRef.get<ProductService>(ProductService)
    productUtilsService = moduleRef.get<ProductUtilsService>(
      ProductUtilsService
    )
    utilsService = moduleRef.get<UtilsService>(UtilsService)
    queryUtilsService = moduleRef.get<QueryUtilsService>(QueryUtilsService)
    testUtilsService = moduleRef.get<TestUtilsService>(TestUtilsService)
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
        select: null,
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
  return await prismaService.client.product.findMany({
    where: { id: testProduct.id },
    select: {
      id: true,
      status: true,
      variants: {
        select: {
          id: true,
          physicalProducts: {
            select: {
              id: true,
              inventoryStatus: true,
              productVariant: {
                select: {
                  id: true,
                  total: true,
                  reservable: true,
                  reserved: true,
                  nonReservable: true,
                  offloaded: true,
                  stored: true,
                },
              },
            },
          },
        },
      },
    },
  })
}
