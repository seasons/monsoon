import { WinstonLogger } from "@app/lib/logger"
import { ErrorService } from "@app/modules/Error/services/error.service"
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
  ShippingMethod,
} from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { orderBy, uniqBy } from "lodash"
import { DateTime } from "luxon"

import { RESERVATION_PROCESSING_FEE } from "../constants"

export const RETURN_PACKAGE_CUSHION = 3 // TODO: Set as an env var
export const SENT_PACKAGE_CUSHION = 3 // TODO: Set as an env var

type LineItemToDescriptionLineItem = Pick<
  RentalInvoiceLineItem,
  "daysRented" | "name"
> & {
  physicalProduct: {
    productVariant: {
      product: Pick<Product, "name" | "computedRentalPrice">
      displayShort: string
    }
  }
}

export const CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT = Prisma.validator<
  Prisma.RentalInvoiceSelect
>()({
  id: true,
  billingStartAt: true,
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
      sentPackage: { select: { amount: true } },
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
@Injectable()
export class RentalService {
  private readonly logger = (new Logger(
    "RentalService"
  ) as unknown) as WinstonLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService,
    private readonly error: ErrorService
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

  async processInvoice(invoice, onError = err => null) {
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

      const chargeResult = await this.chargebeeChargeTab(planID, lineItems)
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
      if (invoice.status === "Draft") {
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
    const thirtyDaysFromBillingStartAt = await this.calculateBillingEndDateFromStartDate(
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
    if (nextBillingAtBeforeNow) {
      billingEndAt = thirtyDaysFromBillingStartAt
    } else if (nextBillingAtLessThanThreeDaysFromNow) {
      billingEndAt = await this.calculateBillingEndDateFromStartDate(
        sanitizedNextBillingAt
      )
    } else if (nextBillingAtJustFarEnoughAway) {
      billingEndAt = this.timeUtils.xDaysBeforeDate(
        sanitizedNextBillingAt,
        1,
        "date"
      )
    } else {
      billingEndAt = thirtyDaysFromBillingStartAt
    }

    return billingEndAt
  }

  async calcDaysRented(
    invoice: Pick<RentalInvoice, "id">,
    physicalProduct: Pick<PhysicalProduct, "seasonsUID">,
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
    comment = `Initial reservation: ${initialReservation.reservationNumber}, status ${initialReservation.status}, phase ${initialReservation.phase}`
    const addComment = line => (comment += `\n${line}`)

    const itemDeliveredAt = this.getSafeSentPackageDeliveryDate(
      sentPackage.deliveredAt,
      initialReservation.createdAt
    )

    const deliveredBeforeBillingCycle = this.timeUtils.isLaterDate(
      invoiceWithData.billingStartAt,
      itemDeliveredAt
    )
    const deliveredAfterBillingCycle = this.timeUtils.isLaterDate(
      itemDeliveredAt,
      invoiceWithData.billingEndAt
    )
    let rentalStartedAt = deliveredBeforeBillingCycle
      ? invoiceWithData.billingStartAt
      : deliveredAfterBillingCycle
      ? undefined
      : itemDeliveredAt

    const itemStatusComments = {
      returned: "Item status: returned",
      withCustomer: "Item status: with customer",
      preparing: "Item status: preparing for shipment",
      unknown: "Item status: unknown",
      enRoute: "Item status: en route to customer",
      lostOnRouteToCustomer: "item status: lost en route to customer",
      cancelled: "item status: never sent. initial reservation cancelled",
      shippedB2C: "Item status: Either with us or with customer.",
      unknownMinCharge: "Item status: Unknown. Applied minimum charge (7 days)",
    }

    const getRentalEndedAt = defaultDate => {
      if (options.upTo === "today") {
        return DateTime.local().toJSDate()
      }
      if (options.upTo === "billingEnd") {
        return invoiceWithData.billingEndAt
      }
      return defaultDate
    }

    const getNewReservationRentalStartedAt = defaultDate => {
      if (options.upTo === "today") {
        return defaultDate
      }
      if (options.upTo === "billingEnd") {
        return new Date(this.timeUtils.xDaysFromNowISOString(2))
      }
      return defaultDate
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
        rentalStartedAt = getNewReservationRentalStartedAt(undefined)
        break
      case "Cancelled":
        addComment(itemStatusComments["cancelled"])
        rentalStartedAt = undefined
        break
      case "Shipped":
        if (initialReservation.phase === "BusinessToCustomer") {
          rentalStartedAt = getNewReservationRentalStartedAt(undefined)
          addComment(itemStatusComments["enRoute"])
        } else {
          rentalEndedAt = getRentalEndedAt(invoiceWithData.billingEndAt)
          addComment(itemStatusComments["shippedB2C"])
        }
        break
      case "Delivered":
        if (initialReservation.phase === "BusinessToCustomer") {
          rentalEndedAt = getRentalEndedAt(invoiceWithData.billingEndAt)
          addComment(itemStatusComments["withCustomer"])
        } else {
          rentalEndedAt = getRentalEndedAt(invoiceWithData.billingEndAt)
          addComment(itemStatusComments["shippedB2C"])
        }
        break
      case "ReturnPending":
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
          rentalEndedAt = getRentalEndedAt(
            this.getSafeReturnPackageEntryDate(
              // there may not be a return package yet, since an item can be
              // in the returnedProducts array due to the customer filling out the
              // return flow
              returnPackage?.enteredDeliverySystemAt,
              returnReservation.returnedAt ||
                returnReservation.completedAt ||
                invoiceWithData.billingEndAt
            )
          )
          addComment(itemStatusComments["returned"])
        } else {
          rentalEndedAt = getRentalEndedAt(invoiceWithData.billingEndAt)
          addComment(itemStatusComments["withCustomer"])
        }
        break

      case "Lost":
        if (initialReservation.lostInPhase === "BusinessToCustomer") {
          rentalStartedAt = undefined
          addComment(itemStatusComments["lostOnRouteToCustomer"])
        } else {
          rentalEndedAt = getRentalEndedAt(
            new Date(this.timeUtils.xDaysAfterDate(rentalStartedAt, 7))
          ) // minimum charge
          addComment(itemStatusComments["unknownMinCharge"])
        }
        break
      default:
        throw new Error(
          `Unexpected reservation status: ${initialReservation.status}`
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
      initialReservationId: initialReservation.id,
    }
  }

  async createRentalInvoiceLineItems(
    invoice: Pick<RentalInvoice, "id" | "billingStartAt"> & {
      reservations: (Pick<Reservation, "createdAt"> & {
        reservationNumber: number
        returnPackages: Array<
          Pick<Package, "deliveredAt" | "amount"> & {
            items: Array<Pick<PhysicalProduct, "seasonsUID">>
          } & { shippingMethod?: Pick<ShippingMethod, "code"> }
        >
      })[]
      products: (Pick<PhysicalProduct, "id" | "seasonsUID"> & {
        productVariant: {
          product: Pick<Product, "computedRentalPrice">
        }
      })[]
    },
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

    const launchDate = this.timeUtils.dateFromUTCTimestamp(
      process.env.LAUNCH_DATE_TIMESTAMP
    )
    const createdBeforeLaunchDay = this.timeUtils.isLaterDate(
      launchDate,
      custWithExtraData.user.createdAt
    )
    const isCustomersFirstRentalInvoice =
      custWithExtraData.membership.rentalInvoices.length === 1

    const lineItemsForPhysicalProductDatas = (await Promise.all(
      invoice.products.map(async physicalProduct => {
        const {
          daysRented,
          initialReservationId,
          ...daysRentedMetadata
        } = await this.calcDaysRented(invoice, physicalProduct)

        const defaultPrice = await this.calculatePriceForDaysRented({
          customer: custWithExtraData,
          product: physicalProduct,
          daysRented,
        })

        const initialReservation = await this.prisma.client.reservation.findUnique(
          { where: { id: initialReservationId }, select: { createdAt: true } }
        )

        const applyGrandfatheredPricing =
          createdBeforeLaunchDay &&
          isCustomersFirstRentalInvoice &&
          this.timeUtils.isLaterDate(launchDate, initialReservation.createdAt)
        let price = applyGrandfatheredPricing ? 0 : defaultPrice

        return addLineItemBasics({
          ...daysRentedMetadata,
          daysRented,
          physicalProduct: { connect: { id: physicalProduct.id } },
          price,
        }) as Prisma.RentalInvoiceLineItemCreateInput
      })
    )) as any

    // Calculate the processing fees

    // Outbound packages
    const newReservations = invoice.reservations.filter(a =>
      this.timeUtils.isLaterDate(a.createdAt, invoice.billingStartAt)
    )
    const sortedNewReservations = orderBy(newReservations, "createdAt", "asc")
    const newReservationOutboundPackageLineItemDatas = sortedNewReservations.map(
      (r, idx) => {
        const name = "Reservation-" + r.reservationNumber + "-OutboundPackage"
        let price = r.sentPackage.amount
        let comment
        if (idx === 0) {
          const usedPremiumShipping =
            !!r && r.shippingMethod.code === "UPSSelect"
          if (usedPremiumShipping) {
            comment =
              "First reservation of billing cycle. Used premium shipping. Charge full outbound package."
          } else {
            comment =
              "First reservation of billing cycle. Free outbound package"
            price = 0
          }
        } else {
          comment = `Reservation ${
            idx + 1
          } of billing cycle. Charge full outbound package.`
        }
        return addLineItemBasics({
          name,
          price,
          comment,
        })
      }
    )

    // Inbound Packages
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
      (p, idx) =>
        addLineItemBasics({
          name: "InboundPackage-" + (idx + 1),
          price: p.amount,
          comment: `Returning items: ${p.items.map(a => a.seasonsUID)}`,
        })
    )

    // Base Processing Fees
    const baseProcessingFeeLineItemDatas = newReservations.map(r =>
      addLineItemBasics({
        name: "Reservation-" + r.reservationNumber + "-Processing",
        price: RESERVATION_PROCESSING_FEE,
        comment: "Base processing fee for a new reservation",
      })
    )

    const lineItemDatas = [
      ...lineItemsForPhysicalProductDatas,
      ...newReservationOutboundPackageLineItemDatas,
      ...inboundPackagesLineItemDatas,
      ...baseProcessingFeeLineItemDatas,
    ]
    const lineItemPromises = lineItemDatas.map(data =>
      this.prisma.client.rentalInvoiceLineItem.create({
        data,
      })
    )
    const lineItems = await this.prisma.client.$transaction(lineItemPromises)

    return lineItems
  }

  async calculatePriceForDaysRented({
    customer,
    product,
    daysRented,
  }: {
    customer: Pick<Customer, "id">
    product: Pick<PhysicalProduct, "id"> & {
      productVariant: {
        product: { computedRentalPrice: number }
      }
    }
    daysRented: number
  }) {
    const previousInvoice = await this.prisma.client.rentalInvoice.findFirst({
      where: {
        membership: {
          customer: { id: customer.id },
        },
        status: "Billed",
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    const daysNeededForMinimumCharge = 12

    if (!previousInvoice) {
      const adjustedDaysRented = Math.max(
        daysNeededForMinimumCharge,
        daysRented
      )

      return this.computePriceForDaysRented(product, adjustedDaysRented)
    }

    const previousLineItem = previousInvoice?.lineItems?.find(
      l => l.physicalProductId === product.id
    )

    if (previousLineItem) {
      const previousDaysRented = previousLineItem.daysRented
      const totalDaysBetweenPreviousAndCurrentInvoice =
        previousDaysRented + daysRented

      if (previousDaysRented <= daysNeededForMinimumCharge) {
        const countedDaysForCurrentInvoice = Math.max(
          0,
          totalDaysBetweenPreviousAndCurrentInvoice - daysNeededForMinimumCharge
        )
        return this.computePriceForDaysRented(
          product,
          countedDaysForCurrentInvoice
        )
      }
    }

    return this.computePriceForDaysRented(product, daysRented)
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
        products: {
          select: {
            id: true,
            seasonsUID: true,
            productVariant: {
              select: {
                product: {
                  select: {
                    id: true,
                    computedRentalPrice: true,
                    rentalPriceOverride: true,
                    wholesalePrice: true,
                    retailPrice: true,
                    recoupment: true,
                    category: {
                      select: {
                        dryCleaningFee: true,
                        recoupment: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const rentalPrices = []

    for (const product of currentInvoice.products) {
      const { daysRented } = await this.calcDaysRented(
        currentInvoice,
        product,
        { upTo: options.upTo }
      )

      const rentalPriceForDaysUntilToday = this.calculatePriceForDaysRented({
        product: product,
        customer: { id: customerId },
        daysRented,
      })

      rentalPrices.push(rentalPriceForDaysUntilToday)
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

  async calculateBillingEndDateFromStartDate(
    billingStartAt: Date
  ): Promise<Date> {
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

  private computePriceForDaysRented = (product, daysRented) => {
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
    lineItems: { id: string }[]
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
      this.timeUtils.isXOrMoreDaysFromNow(nextBillingAt.toISOString(), 2)

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

  private async addPromotionalCredits(
    prismaUserId,
    totalInvoiceCharges,
    invoiceId
  ) {
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
        description: `Grandfathered ${prismaCustomer.membership.plan.planID} credits`,
      })
      .request()

    await this.prisma.client.customerMembership.update({
      where: { id: prismaCustomer.membership.id },
      data: {
        creditBalance: existingCreditBalance - totalCreditsApplied,
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
    return `${productName} (${displaySize}) for ${lineItem.daysRented} days at \$${monthlyRentalPrice} per mo.`
  }

  private isProcessingLineItem(lineItem: Pick<RentalInvoiceLineItem, "name">) {
    return (
      lineItem.name?.includes("OutboundPackage") ||
      lineItem.name?.includes("InboundPackage") ||
      lineItem.name?.includes("Processing")
    )
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
