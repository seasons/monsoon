import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing" //compiles nestjs env
import { intersection } from "lodash"

import { ProductModuleDef } from "../product.module"

describe("Swap Bag Item", () => {
  let prismaService: PrismaService

  //create test customer
  //create res (call reserve items function)
  //pick one item on that res
  //swap the pick item, then swap non picked item (call swap bag item function)

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
  })

  describe("Properly swaps item that has not been picked", () => {
    it("old bag item product variant counts have been updated", () => {})

    it("new bag item product variant counts have been updated", () => {})

    it("rentalInvoice resPhysProds array has been updated", () => {})

    it("new bag item has been created", () => {
      //test to see if the correct productVariant, physicalProduct, reservationPhysProd, customer has been connected
    })
    it("old bag item has been deleted", () => {})

    it("reservation's reservationPhysProds array has been updated", () => {})

    it("inventory status for old physicalProduct has been updated to reservable", () => {})

    it("inventory status for new physicalProduct has been updated to reserved", () => {})
  })

  describe("Properly swaps item that has already been picked", () => {
    it("inventory status for old physicalProduct has been updated to nonreservable", () => {})
  })
})
