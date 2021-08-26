import { ErrorService } from "@app/modules/Error/services/error.service"
import { RentalService } from "@app/modules/Payment/services/rental.service"
import { SubscriptionService } from "@app/modules/Payment/services/subscription.service"
import { ProductUtilsService } from "@app/modules/Product"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
  Package,
  Prisma,
  Product,
  RentalInvoiceLineItem,
  Reservation,
} from "@prisma/client"
import chargebee from "chargebee"

const invoiceSelect = Prisma.validator<Prisma.RentalInvoiceSelect>()({
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
export class SubscriptionsScheduledJobs {
  private readonly logger = new Logger(
    `Cron: ${SubscriptionsScheduledJobs.name}`
  )

  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly productUtils: ProductUtilsService,
    private readonly rental: RentalService
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
        membership: { plan: { tier: "Access" } },
        billingEndAt: {
          equals: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
        status: "Draft",
      },
      select: invoiceSelect,
    })

    // TODO: Add analytics that helps us gauge how accurately we are billing
    for (const invoice of invoicesToHandle) {
      const planID = invoice.membership.plan.planID

      // Create the RentalInvoice line items
      const lineItems = await this.rental.createRentalInvoiceLineItems(invoice)

      // Bill the customer
      switch (planID) {
        // TODO: Get exact name here
        /* Create a one time charge and add it to their upcoming invoice */
        case "access-monthly":
          //TODO: Handle taxes. Accumulate all the taxes across all line items, then add a single line item
          // for it to chargebee
          for (const lineItem of lineItems) {
            // TODO: Handle errors
            const subscriptionId = lineItem.membership.subscriptionId
            const payload = {
              amount: lineItem.price * 100,
              description: this.lineItemToDescription(lineItem),
              date_from: lineItem.rentalStartedAt.getTime(),
              date_to: lineItem.rentalEndedAt.getTime(),
            }
            const {
              invoice,
            } = await chargebee.subscription
              .add_charge_at_term_end(subscriptionId, payload)
              .request((error, result) => {
                if (error) {
                  console.log(error)
                  return
                }
                console.log(result)
                return result
              })
          }
          break
        case "access-yearly":
          /* Create a one time charge and set it to bill on their designated billing date */
          // TODO: If their next annual charge is coming up, append the charges to their next invoice.
          // TODO: Handle taxes. Accumulate all the taxes across all line items, then add a single line item
          // for it to chargebee

          // TODO: Handle errors
          if (lineItems.length === 0) {
            break
          }
          const prismaUserId = lineItems[0].membership.customer.user.id
          const { invoice } = chargebee.invoice
            .create({
              customer_id: prismaUserId,
              currency_code: "USD",
              charges: lineItems.map(a => ({
                amount: a.price * 100,
                description: this.lineItemToDescription(a),
                date_from: a.rentalStartedAt.getTime(),
                date_to: a.rentalEndedAt.getTime(),
                avalara_tax_code: "", // TODO: Get tax code
              })),
            })
            .request((err, result) => {
              if (err) {
                console.log(err)
                return err
              }
              console.log(result)
              return result
            })

          break
        default:
        // TODO:
      }

      await this.prisma.client.rentalInvoice.update({
        where: { id: invoice.id },
        data: { status: "Billed" },
      })

      // Create the next rental invoice if customer is still active
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

  private lineItemToDescription(
    lineItem: Pick<RentalInvoiceLineItem, "daysRented"> & {
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
  ) {
    const productName = lineItem.physicalProduct.productVariant.product.name
    const displaySize = lineItem.physicalProduct.productVariant.displayShort
    const monthlyRentalPrice = this.productUtils.calcRentalPrice(
      lineItem.physicalProduct.productVariant.product,
      "monthly"
    )

    return `${productName} -- ${displaySize} for ${lineItem.daysRented} days at ${monthlyRentalPrice} every 30 days.`
  }
}
