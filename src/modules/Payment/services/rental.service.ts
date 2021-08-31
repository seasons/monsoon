import { ProductUtilsService } from "@app/modules/Product"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable } from "@nestjs/common"
import { PhysicalProduct, RentalInvoice } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"

export const RETURN_PACKAGE_CUSHION = 3 // TODO: Set as an env var
export const SENT_PACKAGE_CUSHION = 3 // TODO: Set as an env var

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
          user: { select: { id: true } },
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
    private readonly productUtils: ProductUtilsService
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
    const chargebeeCustomerId = invoice.membership.customer.user.id

    const rentalInvoiceLineItemSelect = Prisma.validator<
      Prisma.RentalInvoiceLineItemSelect
    >()({
      id: true,
      price: true,
      daysRented: true,
      rentalStartedAt: true,
      rentalEndedAt: true,
      comment: true,
      physicalProduct: {
        select: {
          productVariant: {
            select: {
              product: {
                select: {
                  name: true,
                  recoupment: true,
                  rentalPriceOverride: true,
                  wholesalePrice: true,
                },
              },
              displayShort: true,
            },
          },
        },
      },
    })

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
          price: daysRented * dailyRentalPrice,
          currencyCode: "USD",
        } as Prisma.RentalInvoiceLineItemCreateInput
      })
    )) as any
    // TODO: Calculate taxes
    // const {
    //   estimate: { invoice_estimate },
    // } = await chargebee.estimate
    //   .create_invoice({
    //     // TODO: Add customer id
    //     invoice: { customer_id: chargebeeCustomerId },
    //     charges: lineItemCreateDatas.map(a => ({
    //       amount: a.price * 100,
    //       taxable: true,
    //       avalara_tax_code: "", // TODO: Fill in
    //     })),
    //   })
    //   .request()
    const lineItemCreateDatasWithTaxes = lineItemCreateDatas.map((a, idx) => ({
      ...a,
      // taxRate: invoice_estimate.line_items?.[idx]?.tax_rate || 0,
      // taxPrice: invoice_estimate.line_items?.[idx]?.tax_amount || 0,
    }))
    const lineItemPromises = lineItemCreateDatasWithTaxes.map(data =>
      this.prisma.client.rentalInvoiceLineItem.create({
        data,
        select: rentalInvoiceLineItemSelect,
      })
    )
    const lineItems = await this.prisma.client.$transaction(lineItemPromises)

    return lineItems
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
