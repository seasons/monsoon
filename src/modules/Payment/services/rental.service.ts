import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable } from "@nestjs/common"
import {
  PhysicalProduct,
  Product,
  RentalInvoice,
  RentalInvoiceLineItem,
  RentalInvoiceStatus,
} from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"

import { AccessPlanID } from "../payment.types"

export const RETURN_PACKAGE_CUSHION = 3 // TODO: Set as an env var
export const SENT_PACKAGE_CUSHION = 3 // TODO: Set as an env var

type LineItemToDescriptionLineItem = Pick<
  RentalInvoiceLineItem,
  "daysRented"
> & {
  physicalProduct: {
    productVariant: {
      product: Pick<
        Product,
        "name" | "recoupment" | "wholesalePrice" | "rentalPriceOverride"
      >
      displayShort: string
    }
  }
}

export const CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT = Prisma.validator<
  Prisma.RentalInvoiceSelect
>()({
  id: true,
  products: {
    select: {
      id: true,
      seasonsUID: true,
      productVariant: {
        select: {
          product: {
            select: {
              id: true,
              rentalPriceOverride: true,
              wholesalePrice: true,
              recoupment: true,
            },
          },
        },
      },
    },
  },
  reservations: { select: { id: true } },
  membership: {
    select: {
      plan: { select: { planID: true } },
      subscriptionId: true,
      customer: {
        select: {
          id: true,
          status: true,
          user: { select: { id: true, email: true } },
          reservations: {
            where: {
              status: {
                notIn: ["Cancelled", "Completed", "Lost", "Unknown"],
              },
            },
            select: { id: true },
          },
          bagItems: {
            where: { status: { in: ["Received", "Reserved"] } },
            select: {
              id: true,
              physicalProduct: { select: { id: true } },
            },
          },
        },
      },
      id: true,
    },
  },
})
@Injectable()
export class RentalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService,
    private readonly productUtils: ProductUtilsService,
    private readonly error: ErrorService
  ) {}

  private rentalReservationSelect = Prisma.validator<
    Prisma.ReservationSelect
  >()({
    id: true,
    createdAt: true,
    completedAt: true,
    status: true,
    phase: true,
    reservationNumber: true,
    returnPackages: {
      select: { items: true, enteredDeliverySystemAt: true },
    },
    returnedProducts: { select: { seasonsUID: true } },
    lostAt: true,
    lostInPhase: true,
  })

  async chargeTab(planID: AccessPlanID, invoice, lineItems: { id: string }[]) {
    let invoices, chargePromises
    let promises = []
    try {
      // Chargebee stuff
      const chargeResult = await this.chargebeeChargeTab(planID, lineItems)
      ;[chargePromises, invoices] = chargeResult

      // DB Stuff
      promises.push(...chargePromises)
      promises.push(
        this.prisma.client.rentalInvoice.update({
          where: { id: invoice.id },
          data: { status: "Billed" },
        })
      )
    } catch (err) {
      this.error.setExtraContext(
        { planID, invoice, lineItems },
        "chargeTabInputs"
      )
      this.error.captureError(err)
      await this.prisma.client.rentalInvoice.update({
        where: { id: invoice.id },
        data: { status: "ChargeFailed" },
      })
    } finally {
      const newRentalInvoicePromise = ((await this.initDraftRentalInvoice(
        invoice.membership.id,
        "promise"
      )) as any).promise
      promises.push(newRentalInvoicePromise)
      await this.prisma.client.$transaction(promises)
    }

    return invoices
  }

  async initFirstRentalInvoice(
    customerId,
    mode: "promise" | "execute" = "execute"
  ) {
    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        membership: {
          select: {
            rentalInvoices: { select: { id: true } },
            id: true,
            plan: { select: { tier: true } },
          },
        },
      },
    })

    // Create their first rental invoice
    const hasRentalInvoice =
      customerWithData.membership.rentalInvoices.length > 0
    const onAccessPlan = customerWithData.membership.plan.tier === "Access"
    if (!hasRentalInvoice && onAccessPlan) {
      return await this.initDraftRentalInvoice(
        customerWithData.membership.id,
        mode
      )
    }
  }

  async initDraftRentalInvoice(
    membershipId,
    mode: "promise" | "execute" = "execute"
  ) {
    let lastInvoiceReservationIds = []
    const lastInvoice = await this.prisma.client.rentalInvoice.findFirst({
      where: { membershipId },
      orderBy: { createdAt: "desc" },
      select: { reservations: { select: { id: true } } },
    })
    if (!!lastInvoice) {
      lastInvoiceReservationIds.push(...lastInvoice.reservations.map(a => a.id))
    }

    const customer = await this.prisma.client.customer.findFirst({
      where: { membership: { id: membershipId } },
      select: {
        reservations: {
          // TODO: Also check that it's on the last invoice
          where: {
            status: { notIn: ["Completed", "Cancelled", "Lost"] },
            id: { in: lastInvoiceReservationIds },
          },
          select: { id: true },
        },
        bagItems: {
          where: { status: "Reserved" },
          select: { physicalProductId: true },
        },
      },
    })

    const reservationIds = customer.reservations.map(a => a.id)
    const physicalProductIds = customer.bagItems.map(b => b.physicalProductId)
    const now = new Date()
    const billingEndAt = await this.getRentalInvoiceBillingEndAt(
      membershipId,
      now
    )
    const data = {
      membership: {
        connect: { id: membershipId },
      },
      billingStartAt: now,
      billingEndAt,
      status: "Draft" as RentalInvoiceStatus,
      reservations: {
        connect: reservationIds.map(a => ({
          id: a,
        })),
      },
      products: {
        connect: physicalProductIds.map(b => ({
          id: b,
        })),
      },
    } as Prisma.RentalInvoiceCreateInput

    const promise = this.prisma.client.rentalInvoice.create({
      data,
    })
    if (mode === "promise") {
      return {
        promise,
      }
    }

    return await promise
  }

  async getRentalInvoiceBillingEndAt(
    customerMembershipId: string,
    billingStartAt: Date
  ) {
    const membershipWithData = await this.prisma.client.customerMembership.findUnique(
      {
        where: { id: customerMembershipId },
        select: { subscriptionId: true, plan: { select: { planID: true } } },
      }
    )

    let billingEndAt
    switch (membershipWithData.plan.planID as AccessPlanID) {
      case "access-monthly":
        billingEndAt = await this.getChargebeeNextBillingAt(
          membershipWithData.subscriptionId
        )
        break
      case "access-yearly":
        billingEndAt = await this.getRentalInvoiceBillingEndAtAccessAnnual(
          customerMembershipId,
          billingStartAt
        )
        break
      default:
        throw `Unrecognized planID: ${membershipWithData.plan.planID}`
    }

    return billingEndAt
  }

  async calcDaysRented(
    invoice: Pick<RentalInvoice, "id">,
    physicalProduct: Pick<PhysicalProduct, "seasonsUID">
  ) {
    const invoiceWithData = await this.prisma.client.rentalInvoice.findUnique({
      where: { id: invoice.id },
      select: {
        billingStartAt: true,
        billingEndAt: true,
        membership: { select: { customer: { select: { id: true } } } },
        reservations: {
          select: this.rentalReservationSelect,
        },
      },
    })
    const customer = invoiceWithData.membership.customer
    const sentPackage = await this.prisma.client.package.findFirst({
      where: {
        items: { some: { seasonsUID: physicalProduct.seasonsUID } },
        reservationOnSentPackage: { customer: { id: customer.id } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        deliveredAt: true,
        reservationOnSentPackage: {
          select: this.rentalReservationSelect,
        },
      },
    })
    const initialReservation = sentPackage.reservationOnSentPackage

    let daysRented, rentalEndedAt, comment
    comment = `Initial reservation: ${initialReservation.reservationNumber}, status ${initialReservation.status}.`
    const addComment = line => (comment += `\n${line}`)

    const itemDeliveredAt = this.getSafeSentPackageDeliveryDate(
      sentPackage.deliveredAt,
      initialReservation.createdAt
    )
    const deliveredThisBillingCycle = this.timeUtils.isLaterDate(
      itemDeliveredAt,
      invoiceWithData.billingStartAt
    )

    let rentalStartedAt = deliveredThisBillingCycle
      ? itemDeliveredAt
      : invoiceWithData.billingStartAt
    const itemStatusComments = {
      returned: "Item status: returned",
      withCustomer: "Item status: with customer",
      preparing: "Item status: preparing for shipment",
      unknown: "Item status: unknown",
      enRoute: "Item status: en route to customer",
      lostOnRouteToCustomer: "item status: lost en route to customer",
      cancelled: "item status: never sent. initial reservation cancelled",
    }
    switch (initialReservation.status) {
      case "Hold":
      case "Blocked":
      case "Unknown":
        addComment(itemStatusComments["unknown"])
        rentalStartedAt = undefined
        break
      case "Queued":
      case "Picked":
      case "Packed":
        addComment(itemStatusComments["preparing"])
        rentalStartedAt = undefined
        break
      case "Cancelled":
        addComment(itemStatusComments["cancelled"])
        rentalStartedAt = undefined
        break
      case "Shipped":
        if (initialReservation.phase === "BusinessToCustomer") {
          rentalStartedAt = undefined
          addComment(itemStatusComments["enRoute"])
        } else {
          throw "unimplemented"
          /* 
          Simplest case: Customer has one reservation. This item was sent on that reservation, and is now being returned with the label provided on that item.
            See if this item is on the `returnedProducts` array for the reservation. 
              If it is, the return date is the date the return package entered the carrier network, with today - a cushion as the fallback. 
              If it isn't, 
          
          */
          // TODO: Figure out this logic. How do we know if the item is on its way back or not?
        }
        break

      case "Delivered":
        if (initialReservation.phase === "BusinessToCustomer") {
          rentalEndedAt = invoiceWithData.billingEndAt

          addComment(itemStatusComments["withCustomer"])
        } else {
          throw "unimplemented"
          // TODO: FIgure out this logic
        }
        break

      case "Completed":
        const possibleReturnReservations = [
          initialReservation,
          ...invoiceWithData.reservations.filter(a =>
            this.timeUtils.isLaterDate(
              a.createdAt,
              initialReservation.createdAt
            )
          ),
        ]
        const returnReservation = possibleReturnReservations.find(a =>
          a.returnedProducts
            .map(b => b.seasonsUID)
            .includes(physicalProduct.seasonsUID)
        )

        if (!!returnReservation) {
          const returnPackage = returnReservation.returnPackages.find(b =>
            b.items.map(c => c.seasonsUID).includes(physicalProduct.seasonsUID)
          )
          rentalEndedAt = this.getSafeReturnPackageEntryDate(
            returnPackage.enteredDeliverySystemAt,
            returnReservation.completedAt
          )
          addComment(itemStatusComments["returned"])
        } else {
          rentalEndedAt = invoiceWithData.billingEndAt
          addComment(itemStatusComments["withCustomer"])
        }
        break

      case "Lost":
        if (initialReservation.lostInPhase === "BusinessToCustomer") {
          rentalStartedAt = undefined
          addComment(itemStatusComments["lostOnRouteToCustomer"])
        } else {
          throw "unimplemented"
          // TODO:
        }
        break
      default:
        throw new Error(
          `Unexpected reservation status: ${initialReservation.status}`
        )
    }

    daysRented =
      !!rentalStartedAt && !!rentalEndedAt
        ? this.timeUtils.numDaysBetween(rentalStartedAt, rentalEndedAt)
        : 0
    return {
      daysRented,
      rentalStartedAt,
      rentalEndedAt,
      comment,
    }
  }

  async createRentalInvoiceLineItems(invoice) {
    const lineItemCreateDatas = (await Promise.all(
      invoice.products.map(async physicalProduct => {
        const { daysRented, ...daysRentedMetadata } = await this.calcDaysRented(
          invoice,
          physicalProduct
        )
        const dailyRentalPrice = this.productUtils.calcRentalPrice(
          physicalProduct.productVariant.product,
          "daily"
        )
        return {
          ...daysRentedMetadata,
          daysRented,
          physicalProduct: { connect: { id: physicalProduct.id } },
          rentalInvoice: { connect: { id: invoice.id } },
          price: Math.round(daysRented * dailyRentalPrice * 100),
          currencyCode: "USD",
        } as Prisma.RentalInvoiceLineItemCreateInput
      })
    )) as any
    const lineItemPromises = lineItemCreateDatas.map(data =>
      this.prisma.client.rentalInvoiceLineItem.create({
        data,
      })
    )
    const lineItems = await this.prisma.client.$transaction(lineItemPromises)

    return lineItems
  }

  private async getRentalInvoiceBillingEndAtAccessAnnual(
    subscriptionId: string,
    billingStartAt: Date
  ) {
    // TODO: If next month is their plan billing month, use next_billing_at from
    // their chargebee data.

    const startYear = billingStartAt.getFullYear()
    const startMonth = billingStartAt.getMonth()
    const startDate = billingStartAt.getDate()

    const billingEndYear = startMonth === 11 ? startYear + 1 : startYear
    const billingEndMonth = startMonth === 11 ? 0 : startMonth + 1
    let billingEndDate = startDate

    let billingEndAtDate = new Date(
      billingEndYear,
      billingEndMonth,
      billingEndDate
    )

    while (
      !(
        billingEndAtDate.getDate() === billingEndDate &&
        billingEndAtDate.getMonth() === billingEndMonth
      )
    ) {
      billingEndDate--
      if (startDate - billingEndDate > 3) {
        // Max diff should be 3, for Jan 31 to Feb 28.
        throw new Error(
          `Error getting rental invoice billingEndAt for start date: ${billingStartAt.toISOString()}`
        )
      }
      billingEndAtDate = new Date(
        billingEndYear,
        billingEndMonth,
        billingEndDate
      )
    }

    return billingEndAtDate
  }

  private async getChargebeeNextBillingAt(subscriptionId) {
    const result = await chargebee.subscription
      .retrieve(subscriptionId)
      .request(this.handleChargebeeRequestResult)
    const nextBillingAtTimestamp = result.subscription.next_billing_at
    const nextBillingAtDate = this.timeUtils.dateFromUTCTimestamp(
      nextBillingAtTimestamp
    )
    return this.timeUtils.xDaysBeforeDate(nextBillingAtDate, 1)
  }
  private prismaLineItemToChargebeeChargeInput = prismaLineItem => {
    return {
      amount: prismaLineItem.price,
      description: this.lineItemToDescription(prismaLineItem),
      date_from: this.timeUtils.secondsSinceEpoch(
        prismaLineItem.rentalStartedAt
      ),
      date_to: this.timeUtils.secondsSinceEpoch(prismaLineItem.rentalEndedAt),
    }
  }

  private handleChargebeeRequestResult(error, result) {
    if (error) {
      this.error.captureError(error)
      return error
    }
    return result
  }

  private async chargebeeChargeTab(
    planID: AccessPlanID,
    lineItems: { id: string }[]
  ) {
    const promises = []
    const invoicesCreated = []
    if (lineItems.length === 0) {
      return
    }

    const lineItemsWithData = await this.prisma.client.rentalInvoiceLineItem.findMany(
      {
        where: { id: { in: lineItems.map(a => a.id) } },
        select: {
          id: true,
          price: true,
          rentalStartedAt: true,
          rentalEndedAt: true,
          daysRented: true,
          rentalInvoice: {
            select: {
              membership: {
                select: {
                  subscriptionId: true,
                  customer: {
                    select: { user: { select: { id: true, createdAt: true } } },
                  },
                },
              },
            },
          },
          physicalProduct: {
            select: {
              productVariant: {
                select: {
                  displayShort: true,
                  product: {
                    select: {
                      name: true,
                      recoupment: true,
                      wholesalePrice: true,
                      rentalPriceOverride: true,
                    },
                  },
                },
              },
            },
          },
        },
      }
    )
    if (planID === "access-monthly") {
      for (const lineItem of lineItemsWithData) {
        const subscriptionId = lineItem.rentalInvoice.membership.subscriptionId
        const payload = this.prismaLineItemToChargebeeChargeInput(lineItem)
        const result = await chargebee.subscription
          .add_charge_at_term_end(subscriptionId, payload)
          .request(this.handleChargebeeRequestResult)
        const chargebeeLineItems =
          result?.estimate?.invoice_estimate?.line_items
        const taxPromise = this.getLineItemTaxUpdatePromise(
          lineItem,
          chargebeeLineItems
        )
        promises.push(taxPromise)
        invoicesCreated.push(result)
      }
    } else {
      const prismaUserId =
        lineItemsWithData[0].rentalInvoice.membership.customer.user.id
      const result = await chargebee.invoice
        .create({
          customer_id: prismaUserId,
          currency_code: "USD",
          charges: lineItemsWithData.map(
            this.prismaLineItemToChargebeeChargeInput
          ),
        })
        .request(this.handleChargebeeRequestResult)
      const chargebeeLineItems = result?.invoice?.line_items
      for (const prismaLineItem of lineItemsWithData) {
        const taxPromise = this.getLineItemTaxUpdatePromise(
          prismaLineItem,
          chargebeeLineItems
        )
        promises.push(taxPromise)
      }
      invoicesCreated.push(result)
    }

    return [promises, invoicesCreated]
  }

  private getLineItemTaxUpdatePromise(
    prismaLineItem: Pick<RentalInvoiceLineItem, "price" | "id">,
    chargebeeLineItems
  ) {
    const matchingChargebeeLineItem = chargebeeLineItems.find(
      a => a.amount === prismaLineItem.price
    )
    const data = {
      taxPrice: matchingChargebeeLineItem?.tax_amount,
      taxRate: matchingChargebeeLineItem?.tax_rate,
    }
    return this.prisma.client.rentalInvoiceLineItem.update({
      where: { id: prismaLineItem.id },
      data,
    })
  }

  private lineItemToDescription(lineItem: LineItemToDescriptionLineItem) {
    const productName = lineItem.physicalProduct.productVariant.product.name
    const displaySize = lineItem.physicalProduct.productVariant.displayShort
    const monthlyRentalPrice = this.productUtils.calcRentalPrice(
      lineItem.physicalProduct.productVariant.product,
      "monthly"
    )

    return `${productName} (${displaySize}) for ${lineItem.daysRented} days at \$${monthlyRentalPrice} per mo.`
  }

  private getSafeSentPackageDeliveryDate = (
    sentPackageDeliveryDate: Date | undefined,
    reservationCreatedAtDate: Date
  ) =>
    new Date(
      sentPackageDeliveryDate?.toISOString() ||
        this.timeUtils.xDaysAfterDate(
          reservationCreatedAtDate,
          SENT_PACKAGE_CUSHION
        )
    )
  private getSafeReturnPackageEntryDate = (
    returnPackageScanDate: Date | undefined,
    reservationCompletionDate: Date
  ) => {
    return new Date(
      returnPackageScanDate ||
        this.timeUtils.xDaysBeforeDate(
          reservationCompletionDate,
          RETURN_PACKAGE_CUSHION
        )
    )
  }
}

/*
        Find the package on which it was sent to the customer. Call this RR
        define f getDeliveryDate(RR) => RR.sentPackage.deliveredAt || RR.createdAt + X (3-5)

        If RR is still Queued, Picked, Packed, Hold, Blocked, Unknown OR
           RR is shipped, in BusinessToCustomerPhase:
           daysRented = 0

        TODO: Is it possible for it be "Delivered" in "CustomerToBusiness" phase? Address if so
        If RR is Delivered and its in BusinessToCustomer phase:
          endDate = today
w
          deliveryDate = getDeliveryDate(RR)
          startDate = max(deliveryDate, invoice.startBillingAt)

          daysRented = endDate - startDate + 1

        If RR is Completed:
          deliveryDate = getDeliveryDate(RR)
          startDate = max(deliveryDate, invoice.startBillingAt)

          If item in reservation.returnedProducts:  
            endDate = returnedPackage.enteredDeliverySystemAt || reservation.completedAt - Z (data loss cushion. 3 days)
          Else:
            // It should be in his bag, with status Reserved or Received. Confirm this is so.
            endDate = today

          daysRented = endDate - startDate + 1
        
        If RR is Cancelled:
          daysRented = 0

        If RR is Lost:
          If the sentPackage got lost, daysRented = 0
          If the returnedPackage got lost,
            deliveryDate = getDeliveryDate(RR)
            startDate = max(deliveryDate, invoice.startBillingAt)
            endDate = returnedPackage.lostAt
            daysRented = endDate - startDate + 1 - Y (lostCushion, call it 1-3)

        If RR is Received:
          // TODO: Only 2 reservations with this status. See if we can deprecate it


        */