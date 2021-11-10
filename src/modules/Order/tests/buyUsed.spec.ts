import { APP_MODULE_DEF } from "@app/app.module"
import { EmailService } from "@app/modules/Email/services/email.service"
import { BagService } from "@app/modules/Product/services/bag.service"
import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { EmailServiceMock } from "@app/modules/Utils/mocks/emailService.mock"
import { ShippoMock } from "@app/modules/Utils/mocks/shippo.mock"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test, TestingModule } from "@nestjs/testing"
import chargebee from "chargebee"

import { OrderService } from "../services/order.service"

describe("Buy Used", () => {
  let testUtils: TestUtilsService
  let moduleRef: TestingModule
  let prisma: PrismaService
  let bag: BagService
  let reserve: ReservationService
  let order: OrderService
  let testCustomer: any

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)
    moduleBuilder.overrideProvider(EmailService).useClass(EmailServiceMock)
    moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    bag = moduleRef.get<BagService>(BagService)
    reserve = moduleRef.get<ReservationService>(ReservationService)
    order = moduleRef.get<OrderService>(OrderService)

    // The prices don't correspond to the prices of the items being purchased
    // in these tests. They are just dummy values that will allow the code to run
    jest.spyOn(chargebee.estimate, "create_invoice").mockReturnValue({
      request: async () => ({
        estimate: {
          invoice_estimate: {
            sub_total: 1000,
            total: 1080,
            line_items: [{ tax_rate: 0.08, tax_amount: 80 }],
          },
        },
      }),
    })

    // We just need the status to return as "paid" in order for the code to run
    jest.spyOn(chargebee.invoice, "create").mockReturnValue({
      request: async () => ({
        invoice: {
          status: "paid",
        },
      }),
    })

    jest.mock("shippo", () => new ShippoMock())
  })

  beforeEach(async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: {
        id: true,
        membership: { select: { id: true } },
      },
    })
    testCustomer = customer
  })

  describe("It generates the correct metadata", () => {
    let reservableProductVariant
    beforeAll(async () => {
      reservableProductVariant = await prisma.client.productVariant.findFirst({
        where: {
          reservable: { gte: 2 }, // want two because we want to ensure the correct one of two (or more) is picked
          physicalProducts: {
            some: {
              price: { buyUsedEnabled: true, buyUsedPrice: { gt: 0 } },
            },
          },
        },
        select: {
          id: true,
          physicalProducts: {
            select: {
              price: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })

      await prisma.client.physicalProductPrice.updateMany({
        where: {
          id: {
            in: reservableProductVariant.physicalProducts.map(p => p.price.id),
          },
        },
        data: {
          buyUsedPrice: 40000,
        },
      })
    })

    it("Generates correct metadata in draft mode with credit and purchase credit", async () => {
      await prisma.client.customerMembership.update({
        where: {
          id: testCustomer.membership.id,
        },
        data: {
          purchaseCredits: 2000,
          creditBalance: 10000,
        },
      })

      const {
        invoice,
        orderLineItems,
        purchaseCreditsApplied,
        creditsApplied,
      } = await order.getBuyUsedMetadata({
        productVariantID: reservableProductVariant.id,
        customer: testCustomer,
        type: "draft",
      })

      const chargePrice = invoice.charges[0].amount

      const purchaseCreditLineItem = orderLineItems.find(
        l => l.recordType === "PurchaseCredit"
      )
      const creditLineItem = orderLineItems.find(l => l.recordType === "Credit")

      expect(purchaseCreditLineItem.price).toBe(-2000)
      expect(creditLineItem.price).toBe(-10000)
      expect(chargePrice).toBe(28000)
      expect(purchaseCreditsApplied).toBe(2000)
      expect(creditsApplied).toBe(10000)
    })

    it("Generates correct metadata in draft mode without credit nor purchase credit", async () => {
      await prisma.client.customerMembership.update({
        where: {
          id: testCustomer.membership.id,
        },
        data: {
          purchaseCredits: 0,
          creditBalance: 0,
        },
      })

      const {
        invoice,
        orderLineItems,
        purchaseCreditsApplied,
        creditsApplied,
      } = await order.getBuyUsedMetadata({
        productVariantID: reservableProductVariant.id,
        customer: testCustomer,
        type: "draft",
      })

      const chargePrice = invoice.charges[0].amount

      const purchaseCreditLineItem = orderLineItems.find(
        l => l.recordType === "PurchaseCredit"
      )
      const creditLineItem = orderLineItems.find(l => l.recordType === "Credit")

      expect(purchaseCreditLineItem).toBeUndefined()
      expect(creditLineItem).toBeUndefined()
      expect(chargePrice).toBe(40000)
      expect(purchaseCreditsApplied).toBe(0)
      expect(creditsApplied).toBe(0)
    })

    it("Generates correct metadata in order mode with credit and purchase credit", async () => {
      await prisma.client.customerMembership.update({
        where: {
          id: testCustomer.membership.id,
        },
        data: {
          purchaseCredits: 2000,
          creditBalance: 10000,
        },
      })

      await prisma.client.customerMembership.update({
        where: {
          id: testCustomer.membership.id,
        },
        data: {
          purchaseCredits: 2000,
          creditBalance: 10000,
        },
      })

      const {
        invoice,
        orderLineItems,
        purchaseCreditsApplied,
        creditsApplied,
      } = await order.getBuyUsedMetadata({
        productVariantID: reservableProductVariant.id,
        customer: testCustomer,
        type: "order",
      })

      const chargePrice = invoice.charges[0].amount

      const purchaseCreditLineItem = orderLineItems.find(
        l => l.recordType === "PurchaseCredit"
      )
      const creditLineItem = orderLineItems.find(l => l.recordType === "Credit")

      expect(purchaseCreditLineItem.price).toBe(-2000)
      expect(creditLineItem.price).toBe(-10000)
      expect(chargePrice).toBe(40000)
      expect(purchaseCreditsApplied).toBe(2000)
      expect(creditsApplied).toBe(10000)
    })

    it("Generates correct metadata in order mode without credit nor purchase credit", async () => {
      await prisma.client.customerMembership.update({
        where: {
          id: testCustomer.membership.id,
        },
        data: {
          purchaseCredits: 0,
          creditBalance: 0,
        },
      })

      const {
        invoice,
        orderLineItems,
        purchaseCreditsApplied,
        creditsApplied,
      } = await order.getBuyUsedMetadata({
        productVariantID: reservableProductVariant.id,
        customer: testCustomer,
        type: "order",
      })

      const chargePrice = invoice.charges[0].amount

      const purchaseCreditLineItem = orderLineItems.find(
        l => l.recordType === "PurchaseCredit"
      )
      const creditLineItem = orderLineItems.find(l => l.recordType === "Credit")

      expect(purchaseCreditLineItem).toBeUndefined()
      expect(creditLineItem).toBeUndefined()
      expect(chargePrice).toBe(40000)
      expect(purchaseCreditsApplied).toBe(0)
      expect(creditsApplied).toBe(0)
    })
  })

  describe("Selects correct physical product for order", () => {
    it("If a customer is buying an item he has reserved, we give him that physical product", async () => {
      const reservableProductVariant = await prisma.client.productVariant.findFirst(
        {
          where: {
            reservable: { gte: 2 }, // want two because we want to ensure the correct one of two (or more) is picked
            physicalProducts: {
              some: {
                price: { buyUsedEnabled: true, buyUsedPrice: { gt: 0 } },
              },
            },
          },
          select: {
            id: true,
          },
        }
      )
      const bagItem = await bag.addToBag(
        reservableProductVariant.id,
        testCustomer,
        { id: true }
      )
      const reservationWithData = await reserve.reserveItems({
        items: [reservableProductVariant.id],
        shippingCode: "UPSGround",
        customer: testCustomer,
        select: { products: { select: { seasonsUID: true, id: true } } },
      })

      const draftOrder = await order.buyUsedCreateDraftedOrder({
        productVariantID: reservableProductVariant.id,
        customer: testCustomer,
        select: {
          id: true,
          lineItems: { select: { id: true, recordType: true, recordID: true } },
        },
      })

      const submittedOrder = (await order.buyUsedSubmitOrder({
        order: draftOrder,
        customer: testCustomer,
        select: {
          lineItems: { select: { id: true, recordType: true, recordID: true } },
        },
      })) as any

      const reservedPhysicalProduct = reservationWithData.products[0]
      const physicalProductOrderLineItem = submittedOrder.lineItems.find(
        a => a.recordID === reservedPhysicalProduct.id
      )
      expect(physicalProductOrderLineItem).toBeDefined()

      const reservedPhysicalProductAfterOrderWithData = await prisma.client.physicalProduct.findUnique(
        {
          where: { id: reservedPhysicalProduct.id },
          select: {
            inventoryStatus: true,
            offloadMethod: true,
            offloadNotes: true,
          },
        }
      )
      expect(reservedPhysicalProductAfterOrderWithData.inventoryStatus).toBe(
        "Offloaded"
      )
      expect(reservedPhysicalProductAfterOrderWithData.offloadMethod).toBe(
        "SoldToUser"
      )
      expect(
        reservedPhysicalProductAfterOrderWithData.offloadNotes
      ).toBeDefined()

      const bagItemAfterOrder = await prisma.client.bagItem.findUnique({
        where: { id: bagItem.id },
      })
      expect(bagItemAfterOrder).toBeNull()
    })

    it("If a customer is buying an item he does not have reserved, we give him any reservable unit", async () => {
      const reservableProductVariant = await prisma.client.productVariant.findFirst(
        {
          where: {
            reservable: { gte: 1 },
            physicalProducts: {
              some: {
                price: { buyUsedEnabled: true, buyUsedPrice: { gt: 0 } },
              },
            },
          },
          select: {
            id: true,
          },
        }
      )
      const draftOrder = (await order.buyUsedCreateDraftedOrder({
        productVariantID: reservableProductVariant.id,
        customer: testCustomer,
        select: {
          id: true,
          lineItems: { select: { id: true, recordType: true, recordID: true } },
        },
      })) as any

      const physicalProductToBePurchasedId = draftOrder.lineItems.find(
        a => a.recordType === "PhysicalProduct"
      ).recordID
      const physicalProductBeforePurchase = await prisma.client.physicalProduct.findUnique(
        {
          where: { id: physicalProductToBePurchasedId },
          select: { inventoryStatus: true },
        }
      )
      const reservedBagItemsWithPhysicalProduct = await prisma.client.bagItem.findMany(
        {
          where: {
            physicalProduct: { id: physicalProductToBePurchasedId },
            status: "Reserved",
          },
        }
      )
      expect(physicalProductBeforePurchase.inventoryStatus).toBe("Reservable")
      expect(reservedBagItemsWithPhysicalProduct.length).toBe(0)

      const submittedOrder = (await order.buyUsedSubmitOrder({
        order: draftOrder,
        customer: testCustomer,
        select: {
          lineItems: { select: { id: true, recordType: true, recordID: true } },
        },
      })) as any

      const physicalProductAfterPurchase = await prisma.client.physicalProduct.findUnique(
        {
          where: { id: physicalProductToBePurchasedId },
          select: { inventoryStatus: true },
        }
      )
      expect(physicalProductAfterPurchase.inventoryStatus).toBe("Offloaded")
    })
  })
})
