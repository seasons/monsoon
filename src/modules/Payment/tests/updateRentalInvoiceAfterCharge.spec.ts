import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import cuid from "cuid"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"

describe("Update Rental Invoice After Charge", () => {
  let prisma
  let rentalService
  let rentalInvoice
  let testUtils
  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)
    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
  })

  beforeEach(async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: {
        membership: { select: { rentalInvoices: { select: { id: true } } } },
      },
    })
    rentalInvoice = customer.membership.rentalInvoices[0]
  })

  const getUpdatedInvoiceWithData = async () =>
    await prisma.client.rentalInvoice.findFirst({
      where: { id: rentalInvoice.id },
      select: {
        chargebeeInvoice: { select: { chargebeeId: true } },
        status: true,
        billedAt: true,
        processedAt: true,
        total: true,
      },
    })
  test("PendingCharges", async () => {
    const {
      promise,
    } = rentalService.updateRentalInvoiceAfterCharge(
      rentalInvoice.id,
      [],
      "PendingCharges",
      [{ price: 100 }]
    )
    await prisma.client.$transaction([promise])
    const updatedInvoice = await getUpdatedInvoiceWithData()
    expect(updatedInvoice.status).toBe("ChargePending")
    expect(updatedInvoice.chargebeeInvoice).toBeNull()
    testUtils.expectTimeToEqual(updatedInvoice.processedAt, new Date())
    expect(updatedInvoice.billedAt).toBeNull()
    expect(updatedInvoice.total).toBe(100)
  })

  test("ChargedNow", async () => {
    const chargebeeInvoiceId = cuid()
    await prisma.client.chargebeeInvoice.create({
      data: {
        chargebeeId: chargebeeInvoiceId,
        subtotal: 500,
        status: "Paid",
        invoiceCreatedAt: new Date(),
      },
    })
    const {
      promise,
    } = rentalService.updateRentalInvoiceAfterCharge(
      rentalInvoice.id,
      [{ invoice: { id: chargebeeInvoiceId } }],
      "ChargedNow",
      [{ price: 100 }, { price: 200 }]
    )
    await prisma.client.$transaction([promise])
    const updatedInvoice = await getUpdatedInvoiceWithData()

    expect(updatedInvoice.status).toBe("Billed")
    expect(updatedInvoice.chargebeeInvoice).toBeDefined()
    expect(updatedInvoice.chargebeeInvoice.chargebeeId).toBe(chargebeeInvoiceId)
    testUtils.expectTimeToEqual(updatedInvoice.processedAt, new Date())
    testUtils.expectTimeToEqual(updatedInvoice.billedAt, new Date())
    expect(updatedInvoice.total).toBe(300)
  })

  test("NoCharges", async () => {
    const { promise } = rentalService.updateRentalInvoiceAfterCharge(
      rentalInvoice.id,
      [],
      "NoCharges",
      []
    )
    await prisma.client.$transaction([promise])
    const updatedInvoice = await getUpdatedInvoiceWithData()

    expect(updatedInvoice.status).toBe("Billed")
    expect(updatedInvoice.chargebeeInvoice).toBeNull()
    testUtils.expectTimeToEqual(updatedInvoice.processedAt, new Date())
    testUtils.expectTimeToEqual(updatedInvoice.billedAt, new Date())
    expect(updatedInvoice.total).toBe(0)
  })
})
