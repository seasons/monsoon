import { WinstonLogger } from "@app/lib/logger"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { GRANDFATHERED_PLAN_IDS } from "@app/modules/Utils/constants"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable, Logger } from "@nestjs/common"
import {
  Customer,
  CustomerMembershipSubscriptionData,
  PhysicalProduct,
  Product,
  RentalInvoice,
  RentalInvoiceLineItem,
  RentalInvoiceStatus,
  ReservationPhysicalProduct,
} from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { orderBy, uniqBy } from "lodash"
import { DateTime } from "luxon"

export const RETURN_PACKAGE_CUSHION = 3 // TODO: Set as an env var
export const SENT_PACKAGE_CUSHION = 3 // TODO: Set as an env var

type LineItemToDescriptionLineItem = Pick<
  RentalInvoiceLineItem,
  "daysRented" | "name" | "appliedMinimum" | "adjustedForPreviousMinimum"
> & {
  physicalProduct: {
    productVariant: {
      product: Pick<Product, "name" | "computedRentalPrice">
      displayShort: string
    }
  }
}

export const ProcessableReservationPhysicalProductSelect = Prisma.validator<
  Prisma.ReservationPhysicalProductSelect
>()({
  id: true,
  status: true,
  deliveredToCustomerAt: true,
  physicalProduct: {
    select: {
      id: true,
      seasonsUID: true,

      productVariant: {
        select: {
          product: {
            select: {
              id: true,
              rentalPriceOverride: true,
              retailPrice: true,
              wholesalePrice: true,
              recoupment: true,
              computedRentalPrice: true,
            },
          },
        },
      },
    },
  },
})

const ProcessableReservationPhysicalProductArg = Prisma.validator<
  Prisma.ReservationPhysicalProductArgs
>()({ select: ProcessableReservationPhysicalProductSelect })

export type ProcessableReservationPhysicalProduct = Prisma.ReservationPhysicalProductGetPayload<
  typeof ProcessableReservationPhysicalProductArg
>

export const ProcessableRentalInvoiceSelect = Prisma.validator<
  Prisma.RentalInvoiceSelect
>()({
  id: true,
  billingStartAt: true,
  billingEndAt: true,
  reservationPhysicalProducts: {
    select: ProcessableReservationPhysicalProductSelect,
  },
  reservations: {
    select: {
      id: true,
      reservationNumber: true,
      createdAt: true,
      returnPackages: {
        select: {
          id: true,
          deliveredAt: true,
          amount: true,
          items: { select: { seasonsUID: true } },
        },
      },
      sentPackage: { select: { amount: true, enteredDeliverySystemAt: true } },
      shippingMethod: { select: { code: true } },
    },
    orderBy: { createdAt: "asc" },
  },
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
  status: true,
  lineItems: { select: { id: true } },
})

const ProcessableRentalInvoiceArg = Prisma.validator<
  Prisma.RentalInvoiceArgs
>()({ select: ProcessableRentalInvoiceSelect })

type ProcessableRentalInvoice = Prisma.RentalInvoiceGetPayload<
  typeof ProcessableRentalInvoiceArg
>

@Injectable()
export class RentalService {
  private readonly logger = (new Logger(
    "RentalService"
  ) as unknown) as WinstonLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService,
    private readonly error: ErrorService,
    private readonly shipping: ShippingService
  ) {}

  private rentalReservationSelect = Prisma.validator<
    Prisma.ReservationSelect
  >()({
    id: true,
    createdAt: true,
    returnedAt: true,
    completedAt: true,
    status: true,
    phase: true,
    reservationNumber: true,
    returnPackages: {
      select: { items: true, enteredDeliverySystemAt: true },
    },
    returnedProducts: { select: { seasonsUID: true } },
    shippingMethod: { select: { id: true, code: true } },
    lostAt: true,
    lostInPhase: true,
  })

  async processInvoice(
    invoice,
    {
      onError = err => null,
      forceImmediateCharge = false,
      createNextInvoice = true,
    } = {}
  ) {
    let chargebeeInvoices, chargePromises
    let promises = []
    let lineItems = invoice.lineItems
    try {
      const planID = invoice.membership.plan.planID

      // If we're retrying an invoice, we may have already created their line items.
      // So we don't want to recreate them.
      if (lineItems.length === 0) {
        lineItems = await this.createRentalInvoiceLineItems(invoice)
      } else {
        // If there are already line items, that means we may have tried to
        // process this before. So we clear out any added charges we may have on
        // chargebee so that we don't create duplicate charges
        try {
          const chargebeeCustomerId = invoice.membership.customer.user.id
          await this.deleteUnbilledCharges(chargebeeCustomerId)
        } catch (unbilledChargeErr) {
          onError(unbilledChargeErr)
        }
      }

      const chargeResult = await this.chargebeeChargeTab(planID, lineItems, {
        forceImmediateCharge,
      })
      ;[chargePromises, chargebeeInvoices] = chargeResult
      promises.push(...chargePromises)
      promises.push(
        this.prisma.client.rentalInvoice.update({
          where: { id: invoice.id },
          data: { status: "Billed" },
        })
      )
    } catch (err) {
      promises.push(
        this.prisma.client.rentalInvoice.update({
          where: { id: invoice.id },
          data: { status: "ChargeFailed" },
        })
      )
      try {
        const chargebeeCustomerId = invoice.membership.customer.user.id
        await this.deleteUnbilledCharges(chargebeeCustomerId)
      } catch (unbilledChargeErr) {
        onError(unbilledChargeErr)
      }
      onError(err)
    } finally {
      if (invoice.status === "Draft" && createNextInvoice) {
        const newRentalInvoicePromise = ((await this.initDraftRentalInvoice(
          invoice.membership.id,
          "promise"
        )) as any).promise
        promises.push(newRentalInvoicePromise)
      }

      await this.prisma.client.$transaction(promises)
    }

    return { lineItems, charges: chargebeeInvoices }
  }

  async deleteUnbilledCharges(customerId) {
    const result = await chargebee.unbilled_charge
      .list({
        "customer_id[is]": customerId,
      })
      .request(this.handleChargebeeRequestResult)
    const { list: unbilledCharges } = result
    for (const { unbilled_charge } of unbilledCharges) {
      await chargebee.unbilled_charge
        .delete(unbilled_charge.id)
        .request(this.handleChargebeeRequestResult)
    }
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
    let reservationWhereInputFromLastInvoice = {}
    const lastInvoice = await this.prisma.client.rentalInvoice.findFirst({
      where: { membershipId },
      orderBy: { createdAt: "desc" },
      select: { reservations: { select: { id: true } }, billingEndAt: true },
    })
    if (!!lastInvoice) {
      reservationWhereInputFromLastInvoice = {
        id: { in: lastInvoice.reservations.map(a => a.id) },
      }
    }

    const customer = await this.prisma.client.customer.findFirst({
      where: { membership: { id: membershipId } },
      select: {
        id: true,
        reservations: {
          where: {
            status: { notIn: ["Completed", "Cancelled", "Lost"] },
            ...reservationWhereInputFromLastInvoice,
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
      lastInvoice?.billingEndAt || now
    )
    const data = Prisma.validator<Prisma.RentalInvoiceCreateInput>()({
      membership: {
        connect: { id: membershipId },
      },
      billingStartAt: now,
      // during initial launch, billingEndAt could have been 1 day before now if the customer's next_billing_at was the same as launch day.
      // To clean that up a bit, we get the max of now and the calcualted billingEndAt
      billingEndAt: this.timeUtils.getLaterDate(now, billingEndAt),
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
    })

    const promise = this.prisma.client.rentalInvoice.create({
      data,
      select: {
        id: true,
        membership: {
          select: {
            customerId: true,
          },
        },
      },
    })
    if (mode === "promise") {
      return {
        promise,
      }
    }

    return await promise
  }

  async getSanitizedCustomerNextBillingAt(customerWithData: {
    membership: {
      subscription: Pick<
        CustomerMembershipSubscriptionData,
        "nextBillingAt" | "subscriptionId"
      >
    }
  }) {
    const dbValue = customerWithData.membership.subscription.nextBillingAt
    if (!!dbValue && this.timeUtils.isLaterDate(dbValue, new Date())) {
      return dbValue
    }

    try {
      const result = await chargebee.subscription
        .retrieve(customerWithData.membership.subscription.subscriptionId)
        .request(this.handleChargebeeRequestResult)
      const nextBillingAtTimestamp = result.subscription.next_billing_at
      if (!nextBillingAtTimestamp) {
        return undefined
      }

      const nextBillingAtDate = this.timeUtils.dateFromUTCTimestamp(
        nextBillingAtTimestamp
      )
      return nextBillingAtDate
    } catch (err) {
      this.logger.error("Unable to query chargebee for nextBillingAt", {
        error: err,
      })
      return undefined
    }
  }

  async getRentalInvoiceBillingEndAt(
    customerMembershipId: string,
    billingStartAt: Date
  ): Promise<Date> {
    const membershipWithData = await this.prisma.client.customerMembership.findUnique(
      {
        where: { id: customerMembershipId },
        select: {
          plan: { select: { planID: true } },
          subscription: {
            select: { subscriptionId: true, status: true, nextBillingAt: true },
          },
        },
      }
    )
    const sanitizedNextBillingAt = await this.getSanitizedCustomerNextBillingAt(
      {
        membership: membershipWithData,
      }
    )
    const thirtyDaysFromBillingStartAt = this.calculateBillingEndDateFromStartDate(
      billingStartAt
    )

    const subscriptionCancelled = ["cancelled", "non_renewing"].includes(
      membershipWithData.subscription.status
    )
    if (!sanitizedNextBillingAt || subscriptionCancelled) {
      return thirtyDaysFromBillingStartAt
    }

    /*
    Depending on when the nextBillingAt is relative to now, we return an appropriate value. 

    We use 3 and 33 as "accurate enough" boundaries to desginate a nextBillingAt either being
    too close, just far away enough, or too far away
    */
    const nextBillingAtBeforeNow = this.timeUtils.isLaterDate(
      new Date(),
      sanitizedNextBillingAt
    )
    const nextBillingAtLessThanThreeDaysFromNow = this.timeUtils.isLessThanXDaysFromNow(
      sanitizedNextBillingAt.toISOString(),
      3
    )
    const nextBillingAtJustFarEnoughAway =
      this.timeUtils.isLaterDate(
        sanitizedNextBillingAt,
        new Date(this.timeUtils.xDaysFromNowISOString(3))
      ) &&
      this.timeUtils.isLessThanXDaysFromNow(
        sanitizedNextBillingAt.toISOString(),
        33
      )

    let billingEndAt
    const planID = membershipWithData.plan.planID
    if (nextBillingAtBeforeNow) {
      billingEndAt = thirtyDaysFromBillingStartAt
    } else if (nextBillingAtLessThanThreeDaysFromNow) {
      // This means we got off sync with their invoices and need to
      // get back on track.
      const thirtyDaysFromNextBillingAt = this.calculateBillingEndDateFromStartDate(
        sanitizedNextBillingAt
      )
      if (planID === "access-monthly") {
        billingEndAt = this.timeUtils.xDaysBeforeDate(
          thirtyDaysFromBillingStartAt,
          1,
          "date"
        )
      } else if (planID === "access-yearly") {
        billingEndAt = thirtyDaysFromNextBillingAt
      } else {
        billingEndAt = this.timeUtils.xDaysAfterDate(
          thirtyDaysFromBillingStartAt,
          1,
          "date"
        )
      }
    } else if (nextBillingAtJustFarEnoughAway) {
      if (GRANDFATHERED_PLAN_IDS.includes(planID)) {
        billingEndAt = this.timeUtils.xDaysAfterDate(
          sanitizedNextBillingAt,
          1,
          "date"
        )
      } else {
        billingEndAt = this.timeUtils.xDaysBeforeDate(
          sanitizedNextBillingAt,
          1,
          "date"
        )
      }
    } else {
      billingEndAt = thirtyDaysFromBillingStartAt
    }

    return billingEndAt
  }

  async calcDaysRented(
    invoice: Pick<RentalInvoice, "id">,
    reservationPhysicalProduct: ProcessableReservationPhysicalProduct,
    options: { upTo?: "today" | "billingEnd" | null } = { upTo: null }
  ) {
    const invoiceWithData = await this.prisma.client.rentalInvoice.findFirst({
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

    let daysRented, rentalEndedAt, comment
    comment = ""
    const addComment = line => (comment += `\n${line}`)

    let rentalStartedAt = this.initializeRentalStartedAt(
      invoiceWithData,
      reservationPhysicalProduct
    )

    const today = new Date()
    const getRentalEndedAt = defaultDate => {
      if (options.upTo === "today") {
        return this.timeUtils.getEarlierDate(defaultDate, today)
      }
      if (options.upTo === "billingEnd") {
        return this.timeUtils.getEarlierDate(
          defaultDate,
          invoiceWithData.billingEndAt
        )
      }
      return defaultDate
    }

    switch (reservationPhysicalProduct.status) {
      case "Picked":
      case "Packed":
      case "Queued":
        rentalStartedAt = undefined
        break
      case "ShippedToCustomer":
        // TODO:
        break
      case "ShippedToBusiness":
        // TODO:
        break
      case "DeliveredToCustomer":
        rentalEndedAt = getRentalEndedAt(today)
        break
      default:
        throw new Error(
          `Unexpected reservation physical product status: ${reservationPhysicalProduct.status}`
        )
    }

    // If we end up in a nonsense situation, just don't charge them anything
    if (
      !!rentalStartedAt &&
      !!rentalEndedAt &&
      this.timeUtils.isLaterDate(rentalStartedAt, rentalEndedAt)
    ) {
      rentalStartedAt = undefined
      rentalEndedAt = undefined
      addComment(
        `rentalStartedAt later than rentalEndedAt: ${rentalStartedAt}, ${rentalEndedAt}`
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

  async createRentalInvoiceLineItems(
    invoice: ProcessableRentalInvoice,
    includeMinimumCharge: boolean = false
  ) {
    const custWithExtraData = await this.prisma.client.customer.findFirst({
      where: { membership: { rentalInvoices: { some: { id: invoice.id } } } },
      select: {
        id: true,
        user: { select: { createdAt: true } },
        membership: {
          select: {
            rentalInvoices: { select: { id: true } },
          },
        },
      },
    })

    const addLineItemBasics = input => ({
      ...input,
      rentalInvoice: { connect: { id: invoice.id } },
      currencyCode: "USD",
    })

    const lineItemsForPhysicalProductDatas = (await Promise.all(
      invoice.reservationPhysicalProducts.map(
        async reservationPhysicalProduct => {
          const {
            daysRented,
            ...daysRentedMetadata
          } = await this.calcDaysRented(invoice, reservationPhysicalProduct)

          const {
            price,
            adjustedForPreviousMinimum,
            appliedMinimum,
          } = await this.calculatePriceForDaysRented({
            invoice,
            customer: custWithExtraData,
            product: reservationPhysicalProduct.physicalProduct,
            daysRented,
          })

          return {
            ...daysRentedMetadata,
            daysRented,
            physicalProduct: {
              connect: { id: reservationPhysicalProduct.physicalProduct.id },
            },
            price,
            appliedMinimum,
            adjustedForPreviousMinimum,
          } as Partial<Prisma.RentalInvoiceLineItemCreateInput>
        }
      )
    )) as any

    const outboundPackagesFromPreviousBillingCycleLineItemDatas = await this.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
      invoice
    )
    const newReservationOutboundPackageLineItemDatas = this.getOutboundPackageLineItemDatasFromThisBillingCycle(
      invoice
    )
    const inboundPackagesLineItemDatas = this.getInboundPackageLineItemDatas(
      invoice
    )

    const lineItemDatas = [
      ...lineItemsForPhysicalProductDatas,
      ...newReservationOutboundPackageLineItemDatas,
      ...outboundPackagesFromPreviousBillingCycleLineItemDatas,
      ...inboundPackagesLineItemDatas,
    ]
    const formattedLineItemDatas = lineItemDatas.map(addLineItemBasics)
    const lineItemPromises = formattedLineItemDatas.map(data =>
      this.prisma.client.rentalInvoiceLineItem.create({
        data,
      })
    )
    const lineItems = await this.prisma.client.$transaction(lineItemPromises)

    return lineItems
  }

  private getInboundPackageLineItemDatas = invoice => {
    const allReturnPackages = invoice.reservations.flatMap(
      a => a.returnPackages
    )
    const packagesReturned = allReturnPackages.filter(
      a =>
        !!a.deliveredAt &&
        this.timeUtils.isLaterDate(a.deliveredAt, invoice.billingStartAt)
    )
    const uniquePackagesReturnedAndSorted = orderBy(
      uniqBy(packagesReturned, p => p.id),
      "deliveredAt",
      "asc"
    )
    const inboundPackagesLineItemDatas = uniquePackagesReturnedAndSorted.map(
      (p, idx) => {
        const undiscountedPrice = p.amount
        let price = this.shipping.discountShippingRate(
          undiscountedPrice,
          "UPSGround",
          "Inbound"
        )
        return {
          name: "InboundPackage-" + (idx + 1),
          price,
          comment: `Returning items: ${p.items.map(a => a.seasonsUID)}`,
        }
      }
    )
    return inboundPackagesLineItemDatas
  }

  getOutboundPackageLineItemDatasFromThisBillingCycle = invoice => {
    const newReservations = invoice.reservations.filter(a =>
      this.timeUtils.isLaterDate(a.createdAt, invoice.billingStartAt)
    )
    const sortedNewReservations = orderBy(newReservations, "createdAt", "asc")
    let haveProcessedOneActiveOutboundPackage = false
    const newReservationOutboundPackageLineItemDatas = sortedNewReservations.map(
      (r, idx) => {
        const usedPremiumShipping =
          !!r && r.shippingMethod?.code === "UPSSelect"
        const usedPickup = !!r && r.shippingMethod?.code === "Pickup"
        const packageDidShip = !!r.sentPackage?.enteredDeliverySystemAt

        const undiscountedPrice = r.sentPackage.amount
        let price = this.shipping.discountShippingRate(
          undiscountedPrice,
          usedPremiumShipping ? "UPSSelect" : "UPSGround",
          "Outbound"
        )
        let comment

        const name =
          "Reservation-" +
          r.reservationNumber +
          (usedPickup ? "-Pickup" : "-OutboundPackage")

        const commentStart = `Reservation ${idx + 1} of billing cycle. `
        if (usedPickup) {
          comment = commentStart + "Customer picked up package. No charge."
          price = 0
        } else if (!packageDidShip) {
          comment =
            commentStart +
            "Package did not ship before invoice billed. No charge."
          price = 0
        } else {
          if (!haveProcessedOneActiveOutboundPackage) {
            haveProcessedOneActiveOutboundPackage = true
            if (usedPremiumShipping) {
              comment =
                commentStart +
                `First active outbound package of billing cycle. Used premium shipping. Charge.`
            } else {
              comment =
                commentStart +
                "First active outbound package of billing cycle. Did not use premium shipping. Do not charge."
              price = 0
            }
          } else {
            comment =
              commentStart +
              "Active outbound package of billing cycle. One free package already given. Charge."
          }
        }

        return {
          name,
          price,
          comment,
        }
      }
    )

    return newReservationOutboundPackageLineItemDatas
  }
  private getOutboundPackageLineItemDatasFromPreviousBillingCycle = async (
    invoice: Pick<RentalInvoice, "id" | "billingStartAt" | "billingEndAt">
  ) => {
    const previousRentalInvoice = await this.prisma.client.rentalInvoice.findFirst(
      {
        where: {
          billingStartAt: { lt: invoice.billingStartAt },
          id: { not: invoice.id },
          membership: { rentalInvoices: { some: { id: invoice.id } } },
        },
        orderBy: { billingStartAt: "desc" },
        select: {
          id: true,
          billingStartAt: true,
          billingEndAt: true,
          lineItems: {
            select: { name: true, price: true, comment: true },
          },
          reservations: {
            select: {
              sentPackage: {
                select: {
                  id: true,
                  amount: true,
                  createdAt: true,
                  enteredDeliverySystemAt: true,
                  reservationOnSentPackage: {
                    select: {
                      reservationNumber: true,
                      shippingMethod: { select: { code: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }
    )
    if (!previousRentalInvoice) {
      return []
    }

    const shippedOutboundPackagesOnPreviousInvoice = previousRentalInvoice.reservations
      .flatMap(a => a.sentPackage)
      .filter(a => !!a.enteredDeliverySystemAt)
    const datas = shippedOutboundPackagesOnPreviousInvoice.map((p, idx) => {
      const packageCreatedInLastBillingCycle = this.timeUtils.isBetweenDates(
        p.createdAt,
        previousRentalInvoice.billingStartAt,
        invoice.billingStartAt
      )
      const packageEnteredDeliverySystemInThisBillingCycle = this.timeUtils.isBetweenDates(
        p.enteredDeliverySystemAt,
        invoice.billingStartAt,
        invoice.billingEndAt
      )
      const lineItemFromPreviousInvoice = previousRentalInvoice.lineItems.find(
        a =>
          a.name?.includes(`${p.reservationOnSentPackage.reservationNumber}`) &&
          a.name?.includes("OutboundPackage")
      )
      const packageBilledInLastBillingCycle =
        lineItemFromPreviousInvoice?.price > 0
      const wasPremiumPackage =
        p.reservationOnSentPackage.shippingMethod?.code === "UPSSelect"
      if (
        packageCreatedInLastBillingCycle &&
        packageEnteredDeliverySystemInThisBillingCycle &&
        !packageBilledInLastBillingCycle
      ) {
        const undiscountedPrice = p.amount
        let price = this.shipping.discountShippingRate(
          undiscountedPrice,
          wasPremiumPackage ? "UPSSelect" : "UPSGround",
          "Outbound"
        )
        const name =
          "Reservation-" +
          p.reservationOnSentPackage.reservationNumber +
          "-OutboundPackage"
        const premiumComment = wasPremiumPackage
          ? "Premium Package."
          : "Not Premium Package."
        const startComment = `Outbound package created in previous billing cycle but did not enter delivery system until this billing cycle. ${premiumComment}`
        if (idx === 0) {
          if (wasPremiumPackage) {
            return {
              name,
              price,
              comment: `${startComment} Charge.`,
            }
          } else {
            return {
              name,
              price: 0,
              comment: `${startComment} First package of previous billing cycle. Do not charge.`,
            }
          }
        } else {
          return {
            name,
            price,
            comment: `${startComment} Charge.`,
          }
        }
      }

      return null
    })

    return datas.filter(Boolean)
  }

  async calculatePriceForDaysRented({
    invoice,
    customer,
    product,
    daysRented,
  }: {
    invoice: Pick<RentalInvoice, "id">
    customer: Pick<Customer, "id">
    product: Pick<PhysicalProduct, "id"> & {
      productVariant: {
        product: { computedRentalPrice: number }
      }
    }
    daysRented: number
  }): Promise<{
    price: number
    appliedMinimum: boolean
    adjustedForPreviousMinimum: boolean
  }> {
    const previousInvoice = await this.prisma.client.rentalInvoice.findFirst({
      where: {
        membership: {
          customer: { id: customer.id },
        },
        status: "Billed",
        NOT: {
          id: invoice.id,
        },
      },
      select: {
        billingStartAt: true,
        billingEndAt: true,
        membership: { select: { customer: { select: { id: true } } } },
        products: {
          select: {
            id: true,
            seasonsUID: true,
          },
        },
        lineItems: {
          select: {
            physicalProductId: true,
            daysRented: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    const daysNeededForMinimumCharge = 12
    let appliedMinimum = false
    let adjustedForPreviousMinimum = false

    const previousLineItem = previousInvoice?.lineItems?.find(
      l => l.physicalProductId === product.id
    )

    if (daysRented === 0) {
      return {
        price: 0,
        appliedMinimum,
        adjustedForPreviousMinimum,
      }
    }

    // Apply minimum if needed
    if (
      !previousInvoice ||
      (previousInvoice && !previousLineItem) ||
      previousLineItem?.price === 0
    ) {
      const adjustedDaysRented = Math.max(
        daysNeededForMinimumCharge,
        daysRented
      )

      appliedMinimum = daysRented < daysNeededForMinimumCharge

      return {
        price: this.calculateUnadjustedPriceForDaysRented(
          product,
          adjustedDaysRented
        ),
        appliedMinimum,
        adjustedForPreviousMinimum,
      }
    }

    // Adjust daysRented to account for previous invoice
    if (previousLineItem) {
      const previousDaysRented = previousLineItem.daysRented
      const totalDaysBetweenPreviousAndCurrentInvoice =
        previousDaysRented + daysRented

      if (previousDaysRented <= daysNeededForMinimumCharge) {
        const countedDaysForCurrentInvoice = Math.max(
          0,
          totalDaysBetweenPreviousAndCurrentInvoice - daysNeededForMinimumCharge
        )

        adjustedForPreviousMinimum = countedDaysForCurrentInvoice < daysRented

        return {
          price: this.calculateUnadjustedPriceForDaysRented(
            product,
            countedDaysForCurrentInvoice
          ),
          appliedMinimum,
          adjustedForPreviousMinimum,
        }
      }
    }

    return {
      price: this.calculateUnadjustedPriceForDaysRented(product, daysRented),
      appliedMinimum,
      adjustedForPreviousMinimum,
    }
  }

  async calculateCurrentBalance(
    customerId: string,
    options: { upTo?: "today" | "billingEnd" | null } = { upTo: null }
  ) {
    const currentInvoice = await this.prisma.client.rentalInvoice.findFirst({
      where: {
        membership: {
          customerId,
        },
        status: "Draft",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reservationPhysicalProducts: {
          select: ProcessableReservationPhysicalProductSelect,
        },
      },
    })

    const rentalPrices = []

    for (const reservationPhysicalProduct of currentInvoice.reservationPhysicalProducts) {
      const { daysRented } = await this.calcDaysRented(
        currentInvoice,
        reservationPhysicalProduct,
        { upTo: options.upTo }
      )

      const { price } = await this.calculatePriceForDaysRented({
        invoice: currentInvoice,
        product: reservationPhysicalProduct.physicalProduct,
        customer: { id: customerId },
        daysRented,
      })

      rentalPrices.push(price)
    }

    return rentalPrices.reduce((a, b) => a + b, 0)
  }

  async updateEstimatedTotal(invoice: {
    id: string
    membership: {
      customerId: string
    }
  }): Promise<[number, any]> {
    const estimatedTotal = await this.calculateCurrentBalance(
      invoice.membership.customerId,
      {
        upTo: "billingEnd",
      }
    )

    return [
      estimatedTotal,
      await this.prisma.client.rentalInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          estimatedTotal: estimatedTotal ?? 0,
        },
      }),
    ]
  }

  calculateBillingEndDateFromStartDate(billingStartAt: Date): Date {
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

  calculateUnadjustedPriceForDaysRented = (product, daysRented) => {
    const rawDailyRentalPrice =
      product.productVariant.product.computedRentalPrice / 30
    const roundedDailyRentalPriceAsString = rawDailyRentalPrice.toFixed(2)
    const roundedDailyRentalPrice = +roundedDailyRentalPriceAsString

    return Math.round(daysRented * roundedDailyRentalPrice * 100)
  }

  private prismaLineItemToChargebeeChargeInput = prismaLineItem => {
    return {
      amount: prismaLineItem.price,
      description: this.lineItemToDescription(prismaLineItem),
      ...(!this.isProcessingLineItem(prismaLineItem)
        ? {
            date_from:
              !!prismaLineItem.rentalStartedAt &&
              this.timeUtils.secondsSinceEpoch(prismaLineItem.rentalStartedAt),
            date_to:
              !!prismaLineItem.rentalEndedAt &&
              this.timeUtils.secondsSinceEpoch(prismaLineItem.rentalEndedAt),
          }
        : {}),
    }
  }

  private handleChargebeeRequestResult = (error, result) => {
    if (error) {
      this.error.captureError(error)
      return error
    }
    return result
  }

  private async chargebeeChargeTab(
    planID: string,
    lineItems: { id: string }[],
    { forceImmediateCharge = false }
  ) {
    const promises = []
    const invoicesCreated = []
    if (lineItems.length === 0) {
      return [promises, invoicesCreated]
    }

    const lineItemsWithData = await this.prisma.client.rentalInvoiceLineItem.findMany(
      {
        where: { id: { in: lineItems.map(a => a.id) } },
        select: {
          id: true,
          price: true,
          name: true,
          rentalStartedAt: true,
          rentalEndedAt: true,
          daysRented: true,
          rentalInvoice: {
            select: {
              id: true,
              membership: {
                select: {
                  subscriptionId: true,
                  subscription: {
                    select: { status: true, nextBillingAt: true },
                  },
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
                      computedRentalPrice: true,
                    },
                  },
                },
              },
            },
          },
        },
      }
    )

    const totalInvoiceCharges = lineItemsWithData.reduce(
      (acc, curval) => acc + curval.price,
      0
    )
    const prismaUserId =
      lineItemsWithData[0].rentalInvoice.membership.customer.user.id
    const subscriptionStatus =
      lineItemsWithData[0].rentalInvoice.membership.subscription.status
    const nextBillingAt =
      lineItemsWithData[0].rentalInvoice.membership.subscription.nextBillingAt
    await this.addPromotionalCredits(
      prismaUserId,
      totalInvoiceCharges,
      lineItemsWithData[0].rentalInvoice.id
    )

    const shouldChargeImmediately =
      ["non_renewing", "cancelled"].includes(subscriptionStatus) ||
      this.timeUtils.isXOrMoreDaysFromNow(nextBillingAt.toISOString(), 2) ||
      forceImmediateCharge

    if (shouldChargeImmediately) {
      const result = await chargebee.invoice
        .create({
          customer_id: prismaUserId,
          currency_code: "USD",
          charges: lineItemsWithData
            .filter(a => a.price > 0)
            .map(this.prismaLineItemToChargebeeChargeInput),
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
    } else {
      for (const lineItem of lineItemsWithData) {
        if (lineItem.price === 0) {
          continue
        }
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
    }

    return [promises, invoicesCreated]
  }

  async addPromotionalCredits(prismaUserId, totalInvoiceCharges, invoiceId) {
    if (!totalInvoiceCharges) {
      return
    }

    const rentalInvoice = await this.prisma.client.rentalInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        creditsApplied: true,
      },
    })

    if (rentalInvoice.creditsApplied) {
      // If we've already applied credits to this invoice, early return
      return
    }

    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: prismaUserId } },
      select: {
        membership: {
          select: {
            id: true,
            creditBalance: true,
            plan: {
              select: {
                planID: true,
              },
            },
          },
        },
      },
    })

    const existingCreditBalance = prismaCustomer.membership.creditBalance
    if (existingCreditBalance === 0) {
      return
    }

    let totalCreditsApplied

    if (totalInvoiceCharges > existingCreditBalance) {
      totalCreditsApplied = existingCreditBalance
    } else {
      totalCreditsApplied = totalInvoiceCharges
    }

    await chargebee.promotional_credit
      .add({
        customer_id: prismaUserId,
        amount: totalCreditsApplied,
        // (MONSOON_IGNORE) tells the chargebee webhook to not automatically move these credits to prisma.
        description: `(MONSOON_IGNORE) Grandfathered ${prismaCustomer.membership.plan.planID} credits applied towards rental charges`,
      })
      .request()

    await this.prisma.client.customerMembership.update({
      where: { id: prismaCustomer.membership.id },
      data: {
        creditBalance: { decrement: totalCreditsApplied },
        creditUpdateHistory: {
          create: {
            amount: -1 * totalCreditsApplied,
            reason: "Transferred to chargebee to apply towards rental charges",
          },
        },
      },
    })

    await this.prisma.client.rentalInvoice.update({
      where: { id: invoiceId },
      data: {
        creditsApplied: totalCreditsApplied,
      },
    })
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
    if (this.isProcessingLineItem(lineItem)) {
      return lineItem.name
    }

    // Else, it's for an actual item rented
    const productName = lineItem.physicalProduct.productVariant.product.name
    const displaySize = lineItem.physicalProduct.productVariant.displayShort
    const monthlyRentalPrice =
      lineItem.physicalProduct.productVariant.product.computedRentalPrice

    let text = `${productName} (${displaySize}) for ${lineItem.daysRented} days at \$${monthlyRentalPrice} per mo.`

    if (lineItem.appliedMinimum) {
      text += ` Applied minimum charge for 12 days.`
    }

    if (lineItem.adjustedForPreviousMinimum) {
      text += ` Adjusted for previous minimum charge. `
    }

    return text
  }

  private isProcessingLineItem(lineItem: Pick<RentalInvoiceLineItem, "name">) {
    return (
      lineItem.name?.includes("OutboundPackage") ||
      lineItem.name?.includes("InboundPackage") ||
      lineItem.name?.includes("Processing")
    )
  }

  // TODO: Add a fallback based on the initial reservation
  private initializeRentalStartedAt = (
    invoice: Pick<RentalInvoice, "billingStartAt" | "billingEndAt">,
    reservationPhysicalProduct: Pick<
      ReservationPhysicalProduct,
      "deliveredToCustomerAt"
    >
  ) => {
    const itemDeliveredAt = reservationPhysicalProduct.deliveredToCustomerAt
    const deliveredBeforeBillingCycle = this.timeUtils.isLaterDate(
      invoice.billingStartAt,
      itemDeliveredAt
    )
    const deliveredAfterBillingCycle = this.timeUtils.isLaterDate(
      itemDeliveredAt,
      invoice.billingEndAt
    )
    const rentalStartedAt = deliveredBeforeBillingCycle
      ? invoice.billingStartAt
      : deliveredAfterBillingCycle
      ? undefined
      : itemDeliveredAt
    return rentalStartedAt
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
