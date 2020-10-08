import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Brand } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageService } from "@modules/Image/services/image.service"

import { PhysicalProductService } from "../services/physicalProduct.service"
import { PhysicalProductUtilsService } from "../services/physicalProduct.utils.service"
import { ProductService, ProductUtilsService, ProductVariantService } from ".."

describe("Validate Warehouse Location", () => {
  let physicalProductsService: PhysicalProductService
  let prismaService: PrismaService
  let utilsService: UtilsService

  beforeAll(async done => {
    // Instantiate test service
    prismaService = new PrismaService()
    let productUtilsService = new ProductUtilsService(prismaService)
    let physicalProductUtilsService = new PhysicalProductUtilsService(
      prismaService,
      productUtilsService
    )
    let productVariantService = new ProductVariantService(
      prismaService,
      productUtilsService,
      physicalProductUtilsService
    )
    utilsService = new UtilsService(prismaService)
    physicalProductsService = new PhysicalProductService(
      prismaService,
      productVariantService,
      new ProductService(
        prismaService,
        new ImageService(prismaService),
        productUtilsService,
        productVariantService,
        new PhysicalProductUtilsService(prismaService, productUtilsService),
        utilsService
      ),
      physicalProductUtilsService
    )

    done()
  })

  describe("Works as expected", () => {
    let testBrand: Brand

    beforeAll(async done => {
      testBrand = await prismaService.client.createBrand({
        slug: utilsService.randomString(),
        brandCode: "000t",
        name: "testBrand",
        tier: "Tier0",
      })
      done()
    })

    afterAll(
      async () => await prismaService.client.deleteBrand({ id: testBrand.id })
    )

    it("throws error if invalid barcode given", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Conveyor",
          barcode: "CC-A100-2000",
          locationCode: "A100",
          itemCode: "2000",
        })
      ).rejects.toThrow(/Invalid barcode/))

    it("throws error if barcode doesn't match designated location code", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Rail",
          barcode: "SR-A100-2000",
          locationCode: "B100",
          itemCode: "2000",
        })
      ).rejects.toThrow(/locationCode must match barcode/))

    it("throws error if barcode doesn't match designated item code", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Rail",
          barcode: "SR-A100-2000",
          locationCode: "A100",
          itemCode: "2100",
        })
      ).rejects.toThrow(/itemCode must match barcode/))

    it("throws error if type conveyer and type prefix not C", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Conveyor",
          barcode: "SR-A100-1000",
          locationCode: "A100",
          itemCode: "1000",
        })
      ).rejects.toThrow(/must begin with 'C'/))

    it("throws error if type rail and type prefix not SR", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Rail",
          barcode: "DB-A100-1000",
          locationCode: "A100",
          itemCode: "1000",
        })
      ).rejects.toThrow(/must begin with 'SR'/))

    it("throws error if type bin and type prefix not DB", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Bin",
          barcode: "C-A100-1000",
          locationCode: "A100",
          itemCode: "1000",
        })
      ).rejects.toThrow(/must begin with 'DB'/))

    it("throws error on a location code with an index that's not a multiple of 10", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Bin",
          barcode: "DB-A101-1000",
          locationCode: "A101",
          itemCode: "1000",
        })
      ).rejects.toThrow(
        /Must be of form xy where x is in \[A-Z\] and y is in \[100, 110, ..., 990\]/
      ))

    it("throws error if providing invalid item code on slick rail", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Rail",
          barcode: "SR-A110-xy0t",
          locationCode: "A110",
          itemCode: "xy0t",
        })
      ).rejects.toThrow(/Invalid itemcode. No brand exists/))

    it("rejects a location code south of 100", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Conveyor",
          barcode: "C-A010-9923",
          locationCode: "A010",
          itemCode: "9923",
        })
      ).rejects.toThrow(
        /Must be of form xy where x is in \[A-Z\] and y is in \[100, 110, ..., 990\]/
      ))

    it("Passes a valid conveyer barcode", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Conveyor",
          barcode: "C-B780-0870",
          locationCode: "B780",
          itemCode: "0870",
        })
      ).resolves.toEqual(true))

    it("Passes a valid rail barcode", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Rail",
          barcode: `SR-A120-${testBrand.brandCode}`,
          locationCode: "A120",
          itemCode: testBrand.brandCode,
        })
      ).resolves.toEqual(true))

    it("Passes a valid bin barcode", async () =>
      await expect(
        physicalProductsService.validateWarehouseLocationStructure({
          type: "Bin",
          barcode: `DB-A120-X440`,
          locationCode: "A120",
          itemCode: "X440",
        })
      ).resolves.toEqual(true))
  })
})
