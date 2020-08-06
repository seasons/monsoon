import {
  AirtableBaseService,
  AirtableService,
  AirtableUtilsService,
} from "@app/modules/Airtable"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ID_Input, InventoryStatus, ProductCreateInput } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import * as Airtable from "airtable"

import { ProductWithPhysicalProducts } from "../product.types"
import { ProductService } from "../services/product.service"
import { ProductUtilsService } from "../services/product.utils.service"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const ONE_MIN = 60000

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
  let testUtilsService: TestUtilsService
  let prismaService: PrismaService
  let productUtilsService: ProductUtilsService
  let utilsService: UtilsService

  beforeAll(() => {
    prismaService = new PrismaService()
    const abs = new AirtableBaseService()
    testUtilsService = new TestUtilsService(
      prismaService,
      new AirtableService(abs, new AirtableUtilsService(abs))
    )
    productService = testUtilsService.createProductService()
    productUtilsService = new ProductUtilsService(prismaService)
    utilsService = new UtilsService(prismaService)
  })

  describe("Works", () => {
    let testProduct
    let testColor1
    let testColor2
    let reservedUnit: TestPhysicalProduct
    let reservableUnit: TestPhysicalProduct
    let offloadedUnit: TestPhysicalProduct
    let nonReservableUnit: TestPhysicalProduct

    afterAll(async done => {
      await prismaService.client.deleteProduct({ id: testProduct.id })
      await prismaService.client.deleteColor({ id: testColor1.id })
      await prismaService.client.deleteColor({ id: testColor2.id })
      await prismaService.client.deleteBrand({ id: testProduct.brand.id })
      await prismaService.client.deleteCategory({ id: testProduct.category.id })
      done()
    })

    beforeAll(async done => {
      ;({
        testProduct,
        testColor1,
        testColor2,
        reservedUnit,
        reservableUnit,
        offloadedUnit,
        nonReservableUnit,
      } = await createTestProduct({
        prismaService,
        utilsService,
        productUtilsService,
      }))

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
      const testPhysicalProducts = productUtilsService.physicalProductsForProduct(
        testProduct as ProductWithPhysicalProducts
      )
      reservedUnit = testPhysicalProducts.find(a => a.id === reservedUnit.id)
      reservableUnit = testPhysicalProducts.find(
        a => a.id === reservableUnit.id
      )
      offloadedUnit = testPhysicalProducts.find(a => a.id === offloadedUnit.id)
      nonReservableUnit = testPhysicalProducts.find(
        a => a.id === nonReservableUnit.id
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

async function createTestProduct({
  prismaService,
  utilsService,
  productUtilsService,
}: {
  prismaService: PrismaService
  utilsService: UtilsService
  productUtilsService: ProductUtilsService
}) {
  const testColor1 = await prismaService.client.createColor({
    slug: utilsService.randomString(),
    name: utilsService.randomString(),
    colorCode: utilsService.randomString(),
    hexCode: utilsService.randomString(),
  })
  const testColor2 = await prismaService.client.createColor({
    slug: utilsService.randomString(),
    name: utilsService.randomString(),
    colorCode: utilsService.randomString(),
    hexCode: utilsService.randomString(),
  })

  let testProduct = await prismaService.binding.mutation.createProduct(
    {
      data: {
        slug: utilsService.randomString(),
        name: "",
        brand: {
          create: {
            slug: utilsService.randomString(),
            brandCode: utilsService.randomString(),
            name: "",
            tier: "Tier0",
          },
        },
        category: {
          create: {
            slug: utilsService.randomString(),
            name: utilsService.randomString(),
          },
        },
        images: {},
        color: {
          connect: { id: testColor1.id },
        },
        variants: {
          create: [
            {
              color: { connect: { id: testColor1.id } },
              productID: utilsService.randomString(),
              total: 2,
              reservable: 1,
              reserved: 1,
              nonReservable: 0,
              offloaded: 0,
              stored: 0,
              physicalProducts: {
                create: [
                  {
                    seasonsUID: utilsService.randomString(),
                    inventoryStatus: "Reserved",
                    productStatus: "New",
                    sequenceNumber: 0,
                  },
                  {
                    seasonsUID: utilsService.randomString(),
                    inventoryStatus: "Reservable",
                    productStatus: "New",
                    sequenceNumber: 0,
                  },
                ],
              },
            },
            {
              color: { connect: { id: testColor2.id } },
              productID: utilsService.randomString(),
              total: 2,
              reservable: 0,
              reserved: 0,
              nonReservable: 1,
              offloaded: 1,
              stored: 0,
              physicalProducts: {
                create: [
                  {
                    seasonsUID: utilsService.randomString(),
                    inventoryStatus: "NonReservable",
                    productStatus: "New",
                    sequenceNumber: 0,
                  },
                  {
                    seasonsUID: utilsService.randomString(),
                    inventoryStatus: "Offloaded",
                    productStatus: "New",
                    sequenceNumber: 0,
                  },
                ],
              },
            },
          ],
        },
      } as ProductCreateInput,
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
  )
  const testPhysicalProducts = productUtilsService.physicalProductsForProduct(
    testProduct as ProductWithPhysicalProducts
  )
  return {
    testColor1,
    testColor2,
    testProduct,
    reservedUnit: testPhysicalProducts.find(
      a => a.inventoryStatus === "Reserved"
    ),
    reservableUnit: testPhysicalProducts.find(
      a => a.inventoryStatus === "Reservable"
    ),
    offloadedUnit: testPhysicalProducts.find(
      a => a.inventoryStatus === "Offloaded"
    ),
    nonReservableUnit: testPhysicalProducts.find(
      a => a.inventoryStatus === "NonReservable"
    ),
  }
}

async function retrieveTestProductWithNecessaryFields(
  testProduct,
  prismaService
) {
  return await prismaService.binding.query.product(
    {
      where: { id: testProduct.id },
    },
    // retrieve fields to facilitate expects and post-test data deletion
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
        brand {
            id
        }
        category {
            id
        }
    }`
  )
}
