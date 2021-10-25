import { ReservationService } from "@app/modules/Reservation"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing" //compiles nestjs env
import { intersection } from "lodash"

import { ProductModuleDef } from "../product.module"
import { BagService } from "../services/bag.service"

describe("Swap Bag Item", () => {
  let prismaService: PrismaService
  let reservationService: ReservationService
  let utilsService: UtilsService
  let bagService: BagService

  //create test customer
  //create res (call reserve items function)
  //pick one item on that res
  //swap the pick item, then swap non picked item (call swap bag item function)

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    utilsService = moduleRef.get<UtilsService>(UtilsService)
  })

  describe("Properly swaps item that has not been picked", () => {
    //old bag item tests
    it("old bag item product variant counts have been updated", () => {}) //check

    it("old bag item has been deleted", () => {}) //check

    it("old reservationPhysicalProduct has been deleted", () => {}) //check

    it("inventory status for old physicalProduct has been updated to reservable", () => {}) //check

    //new bag item tests
    it("new bag item product variant counts have been updated", () => {}) //check

    it("new bag item has been upserted", () => {
      //test to see if the correct productVariant, physicalProduct, reservationPhysProd, customer has been connected
    }) //check

    it("new ReservationPhysicalProduct has been created", () => {}) //check

    it("inventory status for new physicalProduct has been updated to reserved", () => {}) //check

    it("rentalInvoice resPhysProds array has been updated", () => {})

    it("reservation's reservationPhysProds array has been updated", () => {}) //check
  })

  describe("Properly swaps item that has already been picked", () => {
    it("inventory status for old physicalProduct has been updated to nonreservable", () => {})
  })
})
