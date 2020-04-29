import * as Airtable from "airtable"

import {
  AirtableBaseService,
  AirtableService,
  AirtableUtilsService,
} from "@app/modules/Airtable"
import { GqlModuleOptions, GraphQLModule } from "@nestjs/graphql"
import { TestUtilsService, UtilsService } from "@app/modules/Utils"

import { GraphQLResolveInfo } from "graphql"
import { PhysicalProductService } from "../services/physicalProduct.utils.service"
import { PrismaModule } from "@app/prisma/prisma.module"
import { PrismaService } from "@app/prisma/prisma.service"
import { ProductService } from "../services/product.service"
import { ProductUtilsService } from "../services/product.utils.service"
import { ProductVariantService } from "../services/productVariant.service"
import { Test } from "@nestjs/testing"
import { UtilsModule } from "@app/modules"
import { head } from "lodash"
import { importSchema } from "graphql-import"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const ONE_MIN = 60000

describe("Store Product", () => {
  let productService: ProductService
  let testUtilsService: TestUtilsService
  let prismaService: PrismaService

  beforeAll(() => {
    prismaService = new PrismaService()
    const abs = new AirtableBaseService()
    testUtilsService = new TestUtilsService(
      prismaService,
      new AirtableService(abs, new AirtableUtilsService(abs))
    )
    productService = testUtilsService.createProductService()
  })

  describe("No reserved or offloaded units", () => {
    let testProduct

    beforeAll(async done => {
      testProduct = head(
        await testUtilsService.getTestableReservableNotOffloadedProducts()
      )
      expect(testProduct).toBeDefined()
      await productService.updateProduct(
        { id: testProduct.id },
        { status: "Stored" },
        null
      )
      testProduct = await prismaService.binding.query.product(
        {
          where: { id: testProduct.id },
        },
        `{
            id
            status
            variants {
                id
                sku
                total
                reserved
                reservable
                nonReservable
                physicalProducts {
                    inventoryStatus
                    productStatus
                }
            }
        }`
      )
      done()
    }, ONE_MIN)

    it("updates product status", () => {
      expect(testProduct.status).toEqual("Stored")
    })

    it("updates downstream product variant counts", () => {
      for (const prodVar of testProduct.variants) {
        expect(prodVar.total).toEqual(prodVar.nonReservable)
        expect(prodVar.reserved).toEqual(0)
        expect(prodVar.reservable).toEqual(0)
      }
    })

    it("updates downstream physical product statuses", () => {
      for (const prodVar of testProduct.variants) {
        for (const physProd of prodVar.physicalProducts) {
          expect(physProd.inventoryStatus).toEqual("NonReservable")
          expect(physProd.productStatus).toEqual("Stored")
        }
      }
    })
  })
})
