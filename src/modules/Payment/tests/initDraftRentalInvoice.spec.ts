import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"

describe("initDraftRentalInvoice", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let utils: UtilsService

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    utils = moduleRef.get<UtilsService>(UtilsService)
  })
  test("It carries over active rpps and reservations from the previous rental invoice", async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: {
        membership: {
          select: { rentalInvoices: { select: { id: true } }, id: true },
        },
      },
    })
    const physicalProducts = await prisma.client.physicalProduct.findMany({
      take: 10,
      select: { id: true },
    })
    const reservation = await prisma.client.reservation.create({
      data: {
        status: "Queued",
        shipped: false,
        phase: "CustomerToBusiness",
        reservationNumber: await utils.getUniqueReservationNumber(),
        rentalInvoices: {
          connect: { id: customer.membership.rentalInvoices[0].id },
        },
        customer: { connect: { id: customer.id } },
      },
      select: { id: true },
    })
    await prisma.client.reservationPhysicalProduct.createMany({
      data: [
        {
          status: "Queued",
          physicalProductId: physicalProducts[0].id,
          reservationId: reservation.id,
          customerId: customer.id,
        },
        {
          status: "DeliveredToCustomer",
          physicalProductId: physicalProducts[0].id,
          reservationId: reservation.id,
          customerId: customer.id,
        },
        {
          status: "Lost",
          physicalProductId: physicalProducts[0].id,
          reservationId: reservation.id,
          customerId: customer.id,
        },
        {
          status: "InTransitOutbound",
          physicalProductId: physicalProducts[0].id,
          reservationId: reservation.id,
          customerId: customer.id,
        },
        {
          status: "ReturnProcessed",
          physicalProductId: physicalProducts[0].id,
          reservationId: reservation.id,
          customerId: customer.id,
        },
        {
          status: "DeliveredToBusiness",
          physicalProductId: physicalProducts[0].id,
          reservationId: reservation.id,
          customerId: customer.id,
        },
      ],
    })
    const rpps = await prisma.client.reservationPhysicalProduct.findMany({
      where: { customerId: customer.id },
      select: { id: true },
    })
    await prisma.client.rentalInvoice.update({
      where: { id: customer.membership.rentalInvoices[0].id },
      data: {
        reservationPhysicalProducts: {
          connect: rpps.map(rpp => ({ id: rpp.id })),
        },
      },
    })

    const newInvoice = (await rentalService.initDraftRentalInvoice(
      customer.membership.id,
      "execute"
    )) as any
    const invoiceWithData = await prisma.client.rentalInvoice.findUnique({
      where: { id: newInvoice.id },
      select: {
        reservationPhysicalProducts: true,
        reservations: { select: { id: true } },
      },
    })
    const rppsCarriedOver = invoiceWithData.reservationPhysicalProducts
    const rppsCarriedOverStatuses = rppsCarriedOver.map(rpp => rpp.status)

    expect(rppsCarriedOver.length).toBe(4)
    expect(rppsCarriedOverStatuses.includes("Queued")).toBe(true)
    expect(rppsCarriedOverStatuses.includes("DeliveredToCustomer")).toBe(true)
    expect(rppsCarriedOverStatuses.includes("InTransitOutbound")).toBe(true)
    expect(rppsCarriedOverStatuses.includes("DeliveredToBusiness")).toBe(true)

    expect(rppsCarriedOverStatuses.includes("Lost")).toBe(false)
    expect(rppsCarriedOverStatuses.includes("ReturnProcessed")).toBe(false)

    expect(invoiceWithData.reservations.length).toBe(1)
    expect(invoiceWithData.reservations[0].id).toBe(reservation.id)
  })
})
