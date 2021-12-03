import { WinstonLogger } from "@app/lib/logger/logger/winston.logger"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { GRANDFATHERED_PLAN_IDS } from "@app/modules/Utils/constants"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable, Logger } from "@nestjs/common"
import {
  Customer,
  CustomerMembershipSubscriptionData,
  Package,
  PhysicalProduct,
  Product,
  RentalInvoice,
  RentalInvoiceLineItem,
  RentalInvoiceStatus,
  Reservation,
  ReservationPhysicalProduct,
  ReservationPhysicalProductStatus,
  ShippingMethod,
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
  deliveredToBusinessAt: true,
  droppedOffAt: true,
  droppedOffBy: true,
  hasBeenScannedOnInbound: true,
  scannedOnInboundAt: true,
  returnProcessedAt: true,
  createdAt: true,
  lostAt: true,
  lostInPhase: true,
  hasBeenLost: true,
  resetEarlyByAdminAt: true,
  outboundPackage: {
    select: {
      id: true,
      createdAt: true,
      enteredDeliverySystemAt: true,
      amount: true,
      shippingMethod: {
        select: {
          code: true,
        },
      },
    },
  },
  inboundPackage: {
    select: {
      id: true,
      deliveredAt: true,
      amount: true,
      items: { select: { seasonsUID: true } },
    },
  },
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
    newProducts: { select: { seasonsUID: true } },
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
          thirtyDaysFromNextBillingAt,
          1,
          "date"
        )
      } else if (planID === "access-yearly") {
        billingEndAt = thirtyDaysFromNextBillingAt
      } else {
        billingEndAt = this.timeUtils.xDaysAfterDate(
          thirtyDaysFromNextBillingAt,
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
          orderBy: { createdAt: "asc" },
          select: this.rentalReservationSelect,
        },
      },
    })

    let daysRented, rentalEndedAt, comment
    comment = ""
    const addComment = line => (comment += `\n${line}`)

    let rentalStartedAt = this.initializeRentalStartedAt(
      invoiceWithData,
      reservationPhysicalProduct
    )

    const today = new Date()

    const throwErrorIfRentalEndedAtUndefined = () => {
      if (!rentalEndedAt) {
        throw new Error(
          `Failed to calculate days rented for item with status ${reservationPhysicalProduct.status}`
        )
      }
    }
    const applyReturnPackageCushion = date =>
      this.timeUtils.xDaysBeforeDate(date, RETURN_PACKAGE_CUSHION, "date")

    const logicCase = this.calcDaysRentedCaseFromStatus(
      reservationPhysicalProduct.status
    )
    switch (logicCase) {
      case "Outbound":
        rentalStartedAt = undefined
        break
      // TODO: Update logic here for "found" items
      case "Inbound":
        rentalEndedAt =
          reservationPhysicalProduct.scannedOnInboundAt ||
          applyReturnPackageCushion(
            reservationPhysicalProduct.deliveredToBusinessAt ||
              invoiceWithData.billingEndAt
          )
        throwErrorIfRentalEndedAtUndefined()
        break
      case "WithCustomer":
        // If an item is return pending, the customer either filled out the return flow
        // before sending the item back OR after the sending the item back but before it reached us.
        // In either case, if it *currently* has status ReturnPending, that means we haven't received
        // a transit event for its inbound package yet. Once we receive such an event, it would move into
        // one of the inbound statuses.
        rentalEndedAt = today
        break
      case "ResetEarly":
        if (reservationPhysicalProduct.hasBeenScannedOnInbound) {
          rentalEndedAt = reservationPhysicalProduct.scannedOnInboundAt
        } else {
          rentalEndedAt = applyReturnPackageCushion(
            reservationPhysicalProduct.resetEarlyByAdminAt
          )
        }
        throwErrorIfRentalEndedAtUndefined()
        break
      case "ReturnProcessed":
        if (reservationPhysicalProduct.droppedOffBy === "Customer") {
          rentalEndedAt = reservationPhysicalProduct.droppedOffAt
        } else if (reservationPhysicalProduct.hasBeenScannedOnInbound) {
          rentalEndedAt = reservationPhysicalProduct.scannedOnInboundAt
        } else {
          rentalEndedAt = applyReturnPackageCushion(
            reservationPhysicalProduct.deliveredToBusinessAt ||
              reservationPhysicalProduct.returnProcessedAt
          )
        }
        throwErrorIfRentalEndedAtUndefined()
        break
      case "Lost":
        if (reservationPhysicalProduct.lostInPhase === "BusinessToCustomer") {
          rentalStartedAt = undefined
        } else if (
          reservationPhysicalProduct.lostInPhase === "CustomerToBusiness"
        ) {
          rentalEndedAt = applyReturnPackageCushion(
            reservationPhysicalProduct.lostAt
          )
          throwErrorIfRentalEndedAtUndefined()
        } else {
          throw new Error(
            `Unexpected lostInPhase: ${reservationPhysicalProduct.lostInPhase}`
          )
        }
        break
      default:
        throw new Error(`Unexpected case: ${logicCase}`)
    }

    ;({ rentalEndedAt, rentalStartedAt } = this.adjustRentalDatesForEstimation(
      rentalStartedAt,
      rentalEndedAt,
      reservationPhysicalProduct.status,
      invoiceWithData.billingEndAt,
      options.upTo
    ))

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

  adjustRentalDatesForEstimation(
    unadjustedRentalStartedAt: Date | undefined,
    unadjustedRentalEndedAt: Date | undefined,
    resPhysProdStatus: ReservationPhysicalProductStatus,
    invoiceBillingEndAt: Date,
    upTo: "today" | "billingEnd" | null
  ) {
    // If upTo is today, there's no change whatsoever in the dates,
    // because the default rentalEndedAt is always (99.9% of the time) before today.
    let rentalStartedAt = unadjustedRentalStartedAt
    let rentalEndedAt = unadjustedRentalEndedAt
    if (!upTo || upTo === "today") {
      return { rentalStartedAt, rentalEndedAt }
    }

    // If upTo is billingEndAt, we only need to adjust if the item is Outbound or DeliveredToCustomer.
    // In the other cases, the item's journey is already over, so extrapolating out to billingEnd doesn't change anything.
    const logicCase = this.calcDaysRentedCaseFromStatus(resPhysProdStatus)
    switch (logicCase) {
      case "Outbound":
        rentalStartedAt = this.timeUtils.xDaysFromNow(2)
        rentalEndedAt = invoiceBillingEndAt
        break
      case "WithCustomer":
        // If it's ReturnPending, we assume they're holding it until/unless we receive a package
        // transit event for it
        rentalEndedAt = invoiceBillingEndAt
        break
      case "Inbound":
      case "ResetEarly":
      case "ReturnProcessed":
      case "Lost":
        // noop
        break
      default:
        throw new Error(`Unexpected case: ${logicCase}`)
    }

    return { rentalStartedAt, rentalEndedAt }
  }

  // TODO: Make sure this occupies all the states
  calcDaysRentedCaseFromStatus(status: ReservationPhysicalProductStatus) {
    switch (status) {
      case "Queued":
      case "Picked":
      case "Packed":
      case "InTransitOutbound":
      case "ScannedOnOutbound":
        return "Outbound"
      case "ScannedOnInbound":
      case "InTransitInbound":
      case "DeliveredToBusiness":
        return "Inbound"
      case "DeliveredToCustomer":
      case "ReturnPending":
        return "WithCustomer"
      case "ResetEarly":
      case "ReturnProcessed":
      case "Lost":
        return status
      default:
        throw new Error(
          `Unexpected reservation physical product status: ${status}`
        )
    }
  }

  async createRentalInvoiceLineItems(invoice: ProcessableRentalInvoice) {
    const addLineItemBasics = input => ({
      ...input,
      rentalInvoice: { connect: { id: invoice.id } },
      currencyCode: "USD",
    })

    const rentalUsageLineItemDatas = await this.getRentalUsageLineItemDatas(
      invoice
    )
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
      ...rentalUsageLineItemDatas,
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

  async getRentalUsageLineItemDatas(invoice: ProcessableRentalInvoice) {
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
            customer: invoice.membership.customer,
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

    return lineItemsForPhysicalProductDatas
  }

  getInboundPackageLineItemDatas = (
    invoice: Pick<RentalInvoice, "billingStartAt" | "billingEndAt"> & {
      reservationPhysicalProducts: Array<{
        inboundPackage: Pick<Package, "deliveredAt" | "id" | "amount"> & {
          items: Array<Pick<PhysicalProduct, "seasonsUID">>
        }
      }>
    }
  ) => {
    const allInboundPackages = invoice.reservationPhysicalProducts.map(
      a => a.inboundPackage
    )
    const uniqueInboundPackages = uniqBy(allInboundPackages, p => p.id)

    const returnedUniqueInboundPackages = uniqueInboundPackages.filter(
      a =>
        !!a.deliveredAt &&
        this.timeUtils.isBetweenDates(
          a.deliveredAt,
          invoice.billingStartAt,
          invoice.billingEndAt
        )
    )
    const sortedReturnedUniqueInboundPackages = orderBy(
      returnedUniqueInboundPackages,
      "deliveredAt",
      "asc"
    )
    const inboundPackagesLineItemDatas = sortedReturnedUniqueInboundPackages.map(
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

  getOutboundPackageLineItemDatasFromThisBillingCycle = (
    invoice: Pick<RentalInvoice, "billingStartAt" | "billingEndAt"> & {
      reservationPhysicalProducts: Array<{
        outboundPackage: Pick<
          Package,
          "enteredDeliverySystemAt" | "createdAt" | "amount" | "id"
        > & { shippingMethod: Pick<ShippingMethod, "code"> }
      }>
    }
  ) => {
    // Collect all the outbound packages on the reservation physical products on the invoice
    // Filter for ones that entered the delivery system during the billing cycle
    // Apply relevant logic to create line items
    const packages = invoice.reservationPhysicalProducts.map(
      a => a.outboundPackage
    )
    const packagesCreatedThisBillingCycle = packages.filter(a =>
      this.timeUtils.isBetweenDates(
        a.createdAt,
        invoice.billingStartAt,
        invoice.billingEndAt
      )
    )
    const packagesShippedAndCreatedThisBillingCycle = packagesCreatedThisBillingCycle.filter(
      a =>
        !!a.enteredDeliverySystemAt &&
        this.timeUtils.isBetweenDates(
          a.enteredDeliverySystemAt,
          invoice.billingStartAt,
          invoice.billingEndAt
        )
    )

    const uniqueSortedPackagesToProcess = orderBy(
      uniqBy(packagesShippedAndCreatedThisBillingCycle, p => p.id),
      "createdAt",
      "asc"
    )

    const datas = uniqueSortedPackagesToProcess.map((p, idx) => {
      const usedPremiumShipping = p.shippingMethod?.code === "UPSSelect"
      const undiscountedPrice = p.amount

      let price = this.shipping.discountShippingRate(
        undiscountedPrice,
        usedPremiumShipping ? "UPSSelect" : "UPSGround",
        "Outbound"
      )

      const name = this.getOutboundPackageLineItemName(p)

      let comment = this.getOutboundPackageLineItemComment(
        "current",
        usedPremiumShipping,
        idx === 0,
        idx + 1
      )
      if (idx === 0 && !usedPremiumShipping) {
        price = 0
      }

      return {
        name,
        price,
        comment,
      }
    })

    return datas
  }

  private getOutboundPackageLineItemComment = (
    billingCycle: "current" | "previous",
    usedPremiumShipping: boolean,
    firstOfCycle: boolean,
    indexInCycle: number
  ) => {
    if (firstOfCycle) {
      const commentStart = `First shipped outbound package of ${billingCycle} billing cycle.`
      const suffix = usedPremiumShipping
        ? "Used premium shipping method. Charge"
        : "Did not use premium shipping method. No charge."
      return commentStart + " " + suffix
    }

    return `Shipped outbound package ${indexInCycle} of ${billingCycle} billing cycle. Charge.`
  }

  private getOutboundPackageLineItemName = (
    p: Pick<Package, "enteredDeliverySystemAt">
  ) => {
    return `Outbound package shipped ${this.formatPackageShipmentDate(
      p.enteredDeliverySystemAt
    )}`
  }

  formatPackageShipmentDate = (date: Date) => {
    const luxDate = DateTime.fromJSDate(date)
    return luxDate
      .toLocaleString({ month: "numeric", day: "numeric" })
      .replace("/", ".")
  }
  getPreviousRentalInvoiceWithPackageData = async (
    invoice: Pick<RentalInvoice, "id" | "billingStartAt">
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
          reservationPhysicalProducts: {
            select: {
              outboundPackage: {
                select: { id: true, enteredDeliverySystemAt: true },
              },
            },
          },
        },
      }
    )
    return previousRentalInvoice
  }
  getOutboundPackageLineItemDatasFromPreviousBillingCycle = async (
    invoice: Pick<RentalInvoice, "billingStartAt" | "billingEndAt" | "id"> & {
      reservationPhysicalProducts: Array<{
        outboundPackage: Pick<
          Package,
          "enteredDeliverySystemAt" | "createdAt" | "amount" | "id"
        > & { shippingMethod: Pick<ShippingMethod, "code"> }
      }>
    }
  ) => {
    const previousRentalInvoice = await this.getPreviousRentalInvoiceWithPackageData(
      invoice
    )
    if (!previousRentalInvoice) {
      return []
    }

    const shippedOutboundPackages = previousRentalInvoice.reservationPhysicalProducts
      .map(a => a.outboundPackage)
      .filter(b => !!b.enteredDeliverySystemAt)
    const uniqueShippedOutboundPackages = uniqBy(
      shippedOutboundPackages,
      p => p.id
    )
    const uniqueShippedOutboundPackagesCreatedInLastBillingCycle = uniqueShippedOutboundPackages.filter(
      a =>
        this.timeUtils.isBetweenDates(
          a.createdAt,
          previousRentalInvoice.billingStartAt,
          previousRentalInvoice.billingEndAt
        )
    )
    const qualifiedPackages = uniqueShippedOutboundPackagesCreatedInLastBillingCycle.filter(
      b =>
        this.timeUtils.isBetweenDates(
          b.enteredDeliverySystemAt,
          invoice.billingStartAt,
          invoice.billingEndAt
        )
    )

    const outboundPackageLineItemsFromPreviousBillingCycle = previousRentalInvoice.lineItems.filter(
      a => a.name?.toLowerCase().includes("outbound package")
    )
    let firstShippedOutboundPackageOfCycle =
      outboundPackageLineItemsFromPreviousBillingCycle.length === 0
    const datas = qualifiedPackages.map((p, idx) => {
      const name = this.getOutboundPackageLineItemName(p)
      const lineItemFromPreviousInvoice = previousRentalInvoice.lineItems.find(
        a => a.name === name
      )

      if (!!lineItemFromPreviousInvoice) {
        return null
      }

      const usedPremiumShipping = p.shippingMethod?.code === "UPSSelect"
      let price = this.shipping.discountShippingRate(
        p.amount,
        usedPremiumShipping ? "UPSSelect" : "UPSGround",
        "Outbound"
      )
      let comment = this.getOutboundPackageLineItemComment(
        "previous",
        usedPremiumShipping,
        firstShippedOutboundPackageOfCycle,
        outboundPackageLineItemsFromPreviousBillingCycle.length + idx + 1
      )

      if (
        idx === 0 &&
        !usedPremiumShipping &&
        firstShippedOutboundPackageOfCycle
      ) {
        price = 0
      }

      firstShippedOutboundPackageOfCycle = false
      return { name, price, comment }
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

  // Test calcDaysRented with the upTo set to Today, billingEnd
  // Mock return values for calcDaysRented, calculatePriceForDaysRented, findFirst, all the package funcs. This unit test just
  // needs to test that this function a) passes the upTo properly and b) aggregates the prices properly
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
        billingEndAt: true,
        billingStartAt: true,
        reservations: {
          select: {
            createdAt: true,
            shippingMethod: {
              select: { code: true },
            },
            sentPackage: {
              select: {
                enteredDeliverySystemAt: true,
                amount: true,
              },
            },
            returnPackages: {
              select: {
                deliveredAt: true,
                id: true,
                amount: true,
                items: {
                  select: {
                    seasonsUID: true,
                  },
                },
              },
            },
          },
        },
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
    const rentalBalance = rentalPrices.reduce((a, b) => a + b, 0)

    const outboundPackagesFromPreviousBillingCycleLineItemDatas = await this.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
      currentInvoice
    )
    const newReservationOutboundPackageLineItemDatas = this.getOutboundPackageLineItemDatasFromThisBillingCycle(
      currentInvoice
    )
    const inboundPackagesLineItemDatas = this.getInboundPackageLineItemDatas(
      currentInvoice
    )
    const packageBalance = [
      ...outboundPackagesFromPreviousBillingCycleLineItemDatas,
      ...newReservationOutboundPackageLineItemDatas,
      ...inboundPackagesLineItemDatas,
    ].reduce((acc, curval) => acc + curval.price, 0)

    return rentalBalance + packageBalance
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

    const billingEndAtWithTime = new Date(
      billingEndAtDate.getFullYear(),
      billingEndAtDate.getMonth(),
      billingEndAtDate.getDate(),
      billingStartAt.getHours(),
      billingStartAt.getMinutes(),
      billingStartAt.getSeconds()
    )

    return billingEndAtWithTime
  }

  calculateUnadjustedPriceForDaysRented = (product, daysRented) => {
    const rawDailyRentalPrice =
      product.productVariant.product.computedRentalPrice / 30

    return Math.round(daysRented * rawDailyRentalPrice * 100)
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
    if (totalInvoiceCharges === 0) {
      return [promises, invoicesCreated]
    }
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

  private initializeRentalStartedAt = (
    invoice: Pick<RentalInvoice, "billingStartAt" | "billingEndAt">,
    reservationPhysicalProduct: Pick<
      ReservationPhysicalProduct,
      "deliveredToCustomerAt" | "createdAt"
    >
  ) => {
    const itemDeliveredAt =
      reservationPhysicalProduct.deliveredToCustomerAt ||
      (this.timeUtils.xDaysAfterDate(
        reservationPhysicalProduct.createdAt,
        SENT_PACKAGE_CUSHION,
        "date"
      ) as Date)
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
}
