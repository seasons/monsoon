import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import {
  PhysicalProduct,
  Prisma,
  RentalInvoiceLineItem,
  ReservationStatus,
  ShippingCode,
  ShippingOption,
} from "@prisma/client"
import chargebee from "chargebee"
import { head, merge } from "lodash"
import moment from "moment"

import { PaymentService } from "../services/payment.service"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../services/rental.service"

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

let prisma: PrismaService
let rentalService: RentalService
let reseveService: ReserveService
let reservationService: ReservationService
let utils: UtilsService
let timeUtils: TimeUtilsService
let testCustomer: any

describe("Reserve Service", () => {
  const now = new Date()

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)
    moduleBuilder.overrideProvider(PaymentService).useClass(PaymentServiceMock)

    const moduleRef = await moduleBuilder.compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    utils = moduleRef.get<UtilsService>(UtilsService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reseveService = moduleRef.get<ReserveService>(ReserveService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
  })

  /*
  - Does not let someone without an active rental invoice reserve

  - Properly updates counts and statuses on variant, physical product, bag items

  - Connects ReservationPhysicalProduct to bag items

  - Doesn't create outbound or inbound shipping labels on initial reserve

  - Leaves last reservation alone 

  - Properly updates rental invoice 


  */
})
