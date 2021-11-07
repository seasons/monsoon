import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { InventoryStatus } from "@prisma/client"

import { ProductModuleDef } from "../product.module"
import { BagService } from "../services/bag.service"
import { PhysicalProductService } from "../services/physicalProduct.service"

describe("Mark items as lost", () => {
  let prismaService: PrismaService
  let bagService: BagService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    bagService = moduleRef.get<BagService>(BagService)
  })

  it("removes bag items from customer's bag", () => {
    /**
     * create customer
     * place reservation(add items to bag, make reservation)
     * ship reservation to customer
     * mark items as lost
     * check to see if items were removed from customer's bag
     */
  })

  it("sets the lostAt, isLost for relevant reservationPhysicalProducts", () => {
    /**
     * create reservation
     * place reservation
     * ship reservation
     * mark items as lost
     * check to see if reservationPhysicalProduct's lostAt time stamp has been set
     * check to see if reservationPhysicalProduct's isLost boolean has been set
     *
     */
  })

  it("sets lostInPhase for outbound ppackage as BusinessToCustomer", () => {
    /**
     * create reservation
     * place reservation
     * ship reservation to customer
     * mark items as lost
     * check to see that lostInPhase is set to BusinessToCustomer
     */
  })

  it("sets lostInPhase for inbound package to CustomerToBusiness", () => {
    /**
     * create reservation
     * place reservation
     * ship reservation to customer
     * ship reservation back to business
     * mark items as lost
     * check to see that lostInPhase is set to CustomerToBusiness
     */
  })

  it("updates product variant counts", () => {
    /**
     * create reservation
     * place reservation
     * ship reservation
     * mark items as lost
     * check product variant counts
     */
  })

  it("sets physicalProduct inventory status to NonReservable and product status to lost", () => {
    /**
     * create reseravtion
     * place reservation
     * ship reservation
     * mark items as lost
     * check physicalProduct inventory status
     */
  })
})
