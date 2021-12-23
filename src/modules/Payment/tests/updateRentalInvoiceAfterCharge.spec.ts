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
      },
    })
  test("PendingCharges", async () => {
    const { promise } = rentalService.updateRentalInvoiceAfterCharge(
      rentalInvoice.id,
      [],
      "PendingCharges"
    )
    await prisma.client.$transaction([promise])
    const updatedInvoice = await getUpdatedInvoiceWithData()
    expect(updatedInvoice.status).toBe("ChargePending")
    expect(updatedInvoice.chargebeeInvoice).toBeNull()
    testUtils.expectTimeToEqual(updatedInvoice.processedAt, new Date())
    expect(updatedInvoice.billedAt).toBeNull()
  })

  test("ChargedNow", async () => {
    const chargebeeInvoiceId = cuid()
    await prisma.client.chargebeeInvoice.create({
      data: {
        chargebeeId: chargebeeInvoiceId,
        total: 500,
        status: "Paid",
        invoiceCreatedAt: new Date(),
      },
    })
    const { promise } = rentalService.updateRentalInvoiceAfterCharge(
      rentalInvoice.id,
      [{ invoice: { id: chargebeeInvoiceId } }],
      "ChargedNow"
    )
    await prisma.client.$transaction([promise])
    const updatedInvoice = await getUpdatedInvoiceWithData()

    expect(updatedInvoice.status).toBe("Billed")
    expect(updatedInvoice.chargebeeInvoice).toBeDefined()
    expect(updatedInvoice.chargebeeInvoice.chargebeeId).toBe(chargebeeInvoiceId)
    testUtils.expectTimeToEqual(updatedInvoice.processedAt, new Date())
    testUtils.expectTimeToEqual(updatedInvoice.billedAt, new Date())
  })

  test("NoCharges", async () => {
    const { promise } = rentalService.updateRentalInvoiceAfterCharge(
      rentalInvoice.id,
      [],
      "NoCharges"
    )
    await prisma.client.$transaction([promise])
    const updatedInvoice = await getUpdatedInvoiceWithData()

    expect(updatedInvoice.status).toBe("Billed")
    expect(updatedInvoice.chargebeeInvoice).toBeNull()
    testUtils.expectTimeToEqual(updatedInvoice.processedAt, new Date())
    testUtils.expectTimeToEqual(updatedInvoice.billedAt, new Date())
  })
})
