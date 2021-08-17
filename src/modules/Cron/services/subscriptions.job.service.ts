import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductUtilsService } from "@app/modules/Product"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Prisma } from "@prisma/client"
import chargebee from "chargebee"

@Injectable()
export class SubscriptionsScheduledJobs {
  private readonly logger = new Logger(
    `Cron: ${SubscriptionsScheduledJobs.name}`
  )

  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly productUtils: ProductUtilsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateSubscriptionData() {
    this.logger.log(`Start update subscriptions field job`)

    let subscription
    let customer
    try {
      const allSubscriptions = []

      let offset = "start"
      while (true) {
        let list
        ;({ next_offset: offset, list } = await chargebee.subscription
          .list({
            limit: 100,
            ...(offset === "start" ? {} : { offset }),
          })
          .request())
        allSubscriptions.push(...list?.map(a => a.subscription))
        if (!offset) {
          break
        }
      }

      for (subscription of allSubscriptions) {
        const userID = subscription.customer_id
        const customer = await this.prisma.client.customer.findFirst({
          where: { user: { id: userID } },
          select: {
            id: true,
            membership: {
              select: { id: true, subscription: { select: { id: true } } },
            },
          },
        })

        if (!customer) {
          console.log("error no customer")
        } else {
          const data = this.paymentUtils.getCustomerMembershipSubscriptionData(
            subscription
          )

          const membershipSubscriptionID =
            customer?.membership?.subscription?.id
          if (membershipSubscriptionID) {
            await this.prisma.client.customerMembershipSubscriptionData.update({
              where: { id: membershipSubscriptionID },
              data,
            })
          } else {
            await this.prisma.client.customerMembershipSubscriptionData.create({
              data: {
                ...data,
                membership: { connect: { id: customer.membership.id } },
              },
            })
          }
        }
      }
    } catch (e) {
      console.log("e", e)
      this.error.setExtraContext(subscription, "subscription")
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
    }

    this.logger.log(`Finished update subscriptions field job`)
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleRentalInvoices() {
    /*
    Query all rental invoices whose billing ends today
      Bill them
      Create the customer's next rental invoice IF they are still active
    */
    const now = new Date()
    const invoicesToHandle = await this.prisma.client.rentalInvoice.findMany({
      where: {
        billingEndAt: {
          equals: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
        status: "Draft",
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
            customer: {
              select: {
                id: true,
                status: true,
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
      },
    })

    // TODO: Add analytics that helps us gauge how accurately we are billing
    for (const invoice of invoicesToHandle) {
      // Create the RentalInvoice line items
      const lineItemPromises = []
      for (const physicalProduct of invoice.products) {
        const daysRented = await this.calcDaysRented(invoice, physicalProduct)
        const price = this.productUtils.calcRentalPrice(
          physicalProduct.productVariant.product
        )
        const lineItemCreateData = {
          // TODO: taxRate, taxName, taxPercentage, taxPrice
          physicalProduct: { connect: { id: physicalProduct.id } },
          rentalInvoice: { connect: { id: invoice.id } },
          daysRented,
          price,
          currencyCode: "USD",
        } as Prisma.RentalInvoiceLineItemCreateInput

        lineItemPromises.push(
          this.prisma.client.rentalInvoiceLineItem.create({
            data: lineItemCreateData,
          })
        )
      }
      await this.prisma.client.$transaction(lineItemPromises)

      // Bill the line items
      // TODO: Bill it
      // TODO: Update the status

      // Create the next status if customer is still active
      // TODO: Update this to be a transaction once you also update the status
      if (
        ["Active", "PaymentFailed"].includes(invoice.membership.customer.status)
      ) {
        await this.paymentUtils.initDraftRentalInvoice(
          invoice.membership.id,
          invoice.membership.customer.reservations.map(a => a.id),
          invoice.membership.customer.bagItems.map(a => a.physicalProduct.id)
        )
      }
    }
  }

  private async calcDaysRented(invoice, physicalProduct) {
    /*
        Find the package on which it was sent to the customer. Call this RR
        define f getDeliveryDate(RR) => RR.sentPackage.deliveredAt || RR.createdAt + X (3-5)

        If RR is still Queued, Picked, Packed, Hold, Blocked, Unknown OR
           RR is shipped, in BusinessToCustomerPhase:
           daysRented = 0

        TODO: Is it possible for it be "Delivered" in "CustomerToBusiness" phase? Address if so
        If RR is Delivered and its in BusinessToCustomer phase:
          endDate = today

          deliveryDate = getDeliveryDate(RR)
          startDate = max(deliveryDate, invoice.startBillingAt)

          daysRented = endDate - startDate + 1

        If RR is Completed:
          deliveryDate = getDeliveryDate(RR)
          startDate = max(deliveryDate, invoice.startBillingAt)

          If item in reservation.returnedProducts:  
            endDate = returnedPackage.enteredDeliverySystemAt || reservation.completedAt
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
    const customer = invoice.membership.customer
    const sentPackage = await this.prisma.client.package.findFirst({
      where: {
        items: { some: { seasonsUID: physicalProduct.seasonsUID } },
        reservationOnSentPackage: { customer: { id: customer.id } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        deliveredAt: true,
        reservationOnSentPackage: { select: { id: true, status: true } },
      },
    })

    const receivedPackage = await this.prisma.client.package.findFirst({
      where: {
        items: { some: { seasonsUID: physicalProduct.seasonsUID } },
        reservationOnReturnedPackage: {
          id: sentPackage.reservationOnSentPackage.id,
        },
      },
      orderBy: { createdAt: "desc" },
      select: { enteredDeliverySystemAt: true },
    })
    return 5 // TODO: Implement
  }
}
