import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable } from "@nestjs/common"
import { PhysicalProduct, RentalInvoice } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import moment from "moment"

const RETURN_PACKAGE_CUSHION = 3 // TODO: Set as an env var

@Injectable()
export class RentalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService
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

    const itemDeliveredAt = new Date(sentPackage.deliveredAt)
    const deliveredThisBillingCycle = this.timeUtils.isLaterDate(
      itemDeliveredAt,
      invoiceWithData.billingStartAt
    )

    const rentalStartedAt = deliveredThisBillingCycle
      ? itemDeliveredAt
      : invoiceWithData.billingStartAt
    const itemStatusComments = {
      returned: "Item status: returned",
      withCustomer: "Item status: with customer",
    }
    switch (initialReservation.status) {
      case "Hold":
      case "Blocked":
      case "Unknown":
        addComment("Unknown rental status")
        break
      case "Queued":
      case "Picked":
      case "Packed":
        addComment("Not yet shipped to customer.")
        break

      case "Shipped":
        if (initialReservation.phase === "BusinessToCustomer") {
          addComment("En route to customer")
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
          rentalEndedAt = this.getSafeRentalEndDate(
            returnPackage.enteredDeliverySystemAt,
            returnReservation.completedAt
          )
          addComment(itemStatusComments["returned"])
        } else {
          rentalEndedAt = invoiceWithData.billingEndAt
          addComment(itemStatusComments["withCustomer"])
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

  private getSafeRentalEndDate = (
    returnPackageScanDate,
    reservationCompletionDate
  ) => {
    return (
      returnPackageScanDate ||
      this.timeUtils.xDaysBeforeDate(
        reservationCompletionDate,
        RETURN_PACKAGE_CUSHION
      )
    )
  }
}
