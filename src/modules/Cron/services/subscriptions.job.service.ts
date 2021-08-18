import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductUtilsService } from "@app/modules/Product"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Prisma, Product, RentalInvoiceLineItem } from "@prisma/client"
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
      },
    })

    // TODO: Add analytics that helps us gauge how accurately we are billing
    for (const invoice of invoicesToHandle) {
      const planID = invoice.membership.plan.planID

      // Create the RentalInvoice line items
      const lineItems = await this.createRentalInvoiceLineItems(invoice)

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
        case "access-annual":
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

  private async createRentalInvoiceLineItems(invoice) {
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
    const {
      estimate: { invoice_estimate },
    } = await chargebee.estimate
      .create_invoice({
        // TODO: Add customer id
        invoice: { customer_id: chargebeeCustomerId },
        charges: lineItemCreateDatas.map(a => ({
          amount: a.price * 100,
          taxable: true,
          avalara_tax_code: "", // TODO: Fill in
        })),
      })
      .request()
    const lineItemCreateDatasWithTaxes = lineItemCreateDatas.map((a, idx) => ({
      ...a,
      taxRate: invoice_estimate.line_items?.[idx]?.tax_rate || 0,
      taxPrice: invoice_estimate.line_items?.[idx]?.tax_amount || 0,
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
    return {
      daysRented: 5,
      rentalStartedAt: new Date(),
      rentalEndedAt: new Date(),
      comment: "",
    } // TODO: Implement
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
