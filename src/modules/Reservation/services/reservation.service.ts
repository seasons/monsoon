import { ErrorService } from "@app/modules/Error/services/error.service"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import {
  InventoryStatus,
  PhysicalProductStatus,
  ShippingCode,
} from "@app/prisma"
import { EmailService } from "@modules/Email/services/email.service"
import { ProductUtilsService, ProductVariantService } from "@modules/Product"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  AdminActionLog,
  Customer,
  Package,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  ReservationFeedback,
  ReservationStatus,
  User,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import chargebee from "chargebee"
import cuid from "cuid"
import { intersection } from "lodash"
import { DateTime } from "luxon"

import { ReservationUtilsService } from "./reservation.utils.service"

interface PhysicalProductWithProductVariant extends PhysicalProduct {
  productVariant: { id: string }
}

interface ProductState {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

export interface ReservationWithProductVariantData {
  id: string
  status: ReservationStatus
  reservationNumber: number
  products: PhysicalProductWithProductVariant[]
}

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payment: PaymentService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly pushNotifs: PushNotificationService,
    private readonly reservationUtils: ReservationUtilsService,
    private readonly error: ErrorService,
    private readonly utils: UtilsService,
    private readonly customerUtils: CustomerUtilsService,
    private readonly statements: StatementsService
  ) {}

  async reserveItems(
    items: string[],
    shippingCode: ShippingCode,
    user: User,
    customer: Customer,
    select
  ) {
    if (customer.status !== "Active") {
      throw new Error(`Only Active customers can place a reservation`)
    }

    const promises = []

    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        membership: { select: { plan: { select: { itemCount: true } } } },
        detail: { select: { shippingAddress: true } },
      },
    })

    // Validate customer address
    await this.shippingService.shippoValidateAddress(
      this.shippingService.locationDataToShippoAddress(
        customerWithData.detail.shippingAddress
      )
    )

    // Validate number of items being reserved
    const customerPlanItemCount = customerWithData?.membership?.plan?.itemCount
    if (!!customerPlanItemCount && items.length !== customerPlanItemCount) {
      throw new ApolloError(
        `Your reservation must contain ${customerPlanItemCount} items`,
        "515"
      )
    }

    // Figure out which items the user is reserving anew and which they already have
    const lastReservation = await this.utils.getLatestReservation(
      customer.id,
      undefined,
      {
        returnPackages: {
          select: { id: true, events: { select: { id: true } } },
        },
      }
    )
    await this.validateLastReservation(lastReservation, items)

    // Get the most recent reservation that potentially carries products being kept in the new reservation
    const lastReservationWithHeldItems = !!lastReservation
      ? [
          "Queued",
          "Picked",
          "Packed",
          "Shipped",
          "Delivered",
          "Received",
          "Completed",
        ].includes(lastReservation.status)
        ? lastReservation
        : await this.utils.getLatestReservation(customer.id, "Completed")
      : null

    const newProductVariantsBeingReserved = await this.getNewProductVariantsBeingReserved(
      {
        productVariantIDs: items,
        customerId: customer.id,
      }
    )
    const heldPhysicalProducts = await this.getHeldPhysicalProducts(
      customer,
      lastReservationWithHeldItems
    )

    const [
      productVariantsCountsUpdatePromises,
      physicalProductsBeingReserved,
      productsBeingReserved,
    ] = await this.productVariantService.updateProductVariantCounts(
      newProductVariantsBeingReserved,
      customer.id
    )

    // Get product data, update variant counts, update physical product statuses
    promises.push(productVariantsCountsUpdatePromises)

    promises.push(
      this.prisma.client.physicalProduct.updateMany({
        where: { id: { in: physicalProductsBeingReserved.map(a => a.id) } },
        data: { inventoryStatus: "Reserved" },
      })
    )

    const [
      seasonsToCustomerTransaction,
      customerToSeasonsTransaction,
    ] = await this.shippingService.createReservationShippingLabels(
      newProductVariantsBeingReserved,
      user,
      customer,
      shippingCode
    )

    // Update bag items
    const bagItemPromises = await this.updateBagItemsForReservation({
      newProductVariantsBeingReserved,
      customerId: customer.id,
      physicalProductsBeingReserved,
    })
    promises.push(...bagItemPromises)

    // Create one time charge for shipping addon
    let shippingOptionID
    let shippingLineItems = []
    if (!!shippingCode) {
      const { shippingOption } = await this.payment.addShippingCharge(
        customer,
        shippingCode
      )
      shippingOptionID = shippingOption.id
      if (shippingCode === "UPSSelect" && shippingOptionID) {
        shippingLineItems = [
          {
            recordID: shippingOptionID,
            price: shippingOption.externalCost,
            currencyCode: "USD",
            recordType: "Package",
            name: "UPS Select shipping",
            taxPrice: 0,
          },
        ]
      }
    }

    // Fetch the nextFreeSwapDate BEFORE creating the reservation or we'll get an incorrect value
    const nextFreeSwapDate = await this.customerUtils.nextFreeSwapDate(
      customer.id
    )

    // Create reservation records in prisma
    const reservationData = await this.createReservationData(
      seasonsToCustomerTransaction,
      customerToSeasonsTransaction,
      lastReservation as any,
      user,
      customer,
      await this.shippingService.calcShipmentWeightFromProductVariantIDs(
        newProductVariantsBeingReserved as string[]
      ),
      physicalProductsBeingReserved,
      heldPhysicalProducts,
      shippingOptionID
    )
    const reservationPromise = this.prisma.client.reservation.create({
      data: reservationData,
      select: {
        ...select,
        reservationNumber: true,
      },
    })

    promises.push(reservationPromise)

    // Resolve all prisma operation in one transaction
    const result = await this.prisma.client.$transaction(promises.flat())

    const reservation = result.pop()

    let earlySwapLineItems = []

    try {
      earlySwapLineItems = await this.addEarlySwapLineItemsIfNeeded(
        reservation?.id,
        customer?.id,
        nextFreeSwapDate
      )
      await this.addLineItemsToReservation(
        [...earlySwapLineItems, ...shippingLineItems],
        reservation.id
      )
    } catch (err) {
      this.error.setUserContext(user)
      this.error.setExtraContext({
        reservationID: reservation.id,
        lineItems: [...earlySwapLineItems, ...shippingLineItems],
      })
      this.error.captureError(err)
    }

    // Send confirmation email
    await this.emails.sendReservationConfirmationEmail(
      user,
      productsBeingReserved,
      reservation,
      seasonsToCustomerTransaction.tracking_number,
      seasonsToCustomerTransaction.tracking_url_provider
    )

    try {
      await this.removeRestockNotifications(items, customer?.id)
    } catch (err) {
      this.error.setUserContext(user)
      this.error.setExtraContext({ items })
      this.error.captureError(err)
    }

    return reservation
  }

  async addLineItemsToReservation(lineItems, reservationID: string) {
    if (lineItems?.length > 0 && reservationID) {
      await this.prisma.client.reservation.update({
        where: { id: reservationID },
        data: {
          lineItems: {
            create: lineItems,
          },
        },
      })
    }
  }

  async addEarlySwapLineItemsIfNeeded(
    reservationID,
    customerID,
    nextFreeSwapDate
  ): Promise<Prisma.OrderLineItemCreateInput[]> {
    const doesNotHaveFreeSwap =
      nextFreeSwapDate && DateTime.fromISO(nextFreeSwapDate) > DateTime.local()

    if (doesNotHaveFreeSwap && reservationID) {
      const swapCharge = await this.payment.addEarlySwapCharge(customerID)
      if (swapCharge?.invoice) {
        return [
          {
            recordID: reservationID,
            price: swapCharge.invoice.sub_total,
            currencyCode: "USD",
            recordType: "EarlySwap",
            name: "Early swap",
            taxPrice: swapCharge?.invoice?.tax || 0,
          },
        ]
      } else {
        return []
      }
    } else {
      return []
    }
  }

  async cancelReturn(customer: Customer) {
    const lastReservation = await this.utils.getLatestReservation(customer.id)

    await this.prisma.client.reservation.update({
      data: {
        returnedProducts: { set: [] },
        returnedAt: null,
      },
      where: { id: String(lastReservation.id) },
    })

    return lastReservation
  }

  async returnItems(items: string[], customer: Customer) {
    const lastReservation: any = await this.utils.getLatestReservation(
      customer.id
    )

    // If there's an item being returned that isn't in the current reservation
    // throw an error
    if (
      intersection(
        lastReservation.products.map(p => p.id),
        items
      ).length !== items.length
    ) {
      throw new Error(
        "One of the returned items isn't in the current reservation"
      )
    }

    await this.prisma.client.reservation.update({
      data: {
        returnedProducts: {
          connect: items.map(item => ({ id: item })),
        },
        returnedAt: new Date(),
      },
      where: { id: String(lastReservation.id) },
    })

    return lastReservation
  }

  async removeRestockNotifications(items: string[], customerID: string) {
    const restockNotifications = await this.prisma.client.productNotification.findMany(
      {
        where: {
          customer: {
            id: customerID,
          },
          AND: {
            productVariant: {
              id: { in: items },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }
    )

    if (restockNotifications?.length > 0) {
      return await this.prisma.client.productNotification.updateMany({
        where: { id: { in: restockNotifications.map(notif => notif.id) } },
        data: {
          shouldNotify: false,
        },
      })
    }
  }

  private async getReservation(reservationNumber: number) {
    return await this.prisma.client.reservation.findUnique({
      where: {
        reservationNumber,
      },
      select: {
        id: true,
        status: true,
        reservationNumber: true,
        products: {
          select: {
            id: true,
            productStatus: true,
            inventoryStatus: true,
            seasonsUID: true,
            productVariant: { select: { id: true } },
          },
        },
        customer: {
          select: {
            id: true,
            detail: {
              select: {
                shippingAddress: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        returnPackages: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            shippingLabel: { select: { trackingNumber: true } },
          },
        },
      },
    })
  }

  async processReservation(
    reservationNumber,
    productStates: ProductState[],
    trackingNumber: string
  ) {
    // Update status on physical products depending on whether
    // the item was returned, and update associated product variant counts

    const physicalProducts = await this.prisma.client.physicalProduct.findMany({
      where: {
        seasonsUID: {
          in: productStates.map(p => p.productUID),
        },
      },
      select: {
        id: true,
        seasonsUID: true,
        inventoryStatus: true,
        productVariant: {
          select: {
            id: true,
            sku: true,
            reserved: true,
            reservable: true,
            nonReservable: true,
            product: true,
          },
        },
      },
    })

    let promises = []

    for (let state of productStates) {
      if (state.returned) {
        const physicalProduct = physicalProducts.find(
          a => a.seasonsUID === state.productUID
        )
        const productVariant = physicalProduct.productVariant as any
        const product = productVariant.product

        const inventoryStatus: InventoryStatus =
          product.status === "Stored" ? "Stored" : "NonReservable"

        const updateData = {
          productStatus: state.productStatus,
          inventoryStatus,
        }

        const productVariantData = this.productVariantService.getCountsForStatusChange(
          {
            productVariant,
            oldInventoryStatus: physicalProduct.inventoryStatus as InventoryStatus,
            newInventoryStatus: updateData.inventoryStatus as InventoryStatus,
          }
        )

        promises.push(
          this.prisma.client.product.update({
            where: {
              id: product.id,
            },
            data: {
              variants: {
                update: {
                  where: {
                    id: productVariant.id,
                  },
                  data: {
                    ...productVariantData,
                    physicalProducts: {
                      update: {
                        where: {
                          id: physicalProduct.id,
                        },
                        data: {
                          ...updateData,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        )
      }
    }

    const receiptPromise = this.prisma.client.reservationReceipt.create({
      data: {
        reservation: {
          connect: { reservationNumber },
        },
        items: {
          create: productStates
            .filter(a => a.returned)
            .map(productState => {
              return {
                product: {
                  connect: {
                    seasonsUID: productState.productUID,
                  },
                },
                productStatus: productState.productStatus,
                notes: productState.notes,
              }
            }),
        },
      },
    })

    const reservation = await this.getReservation(reservationNumber)

    const prismaUser = await this.prisma.client.user.findUnique({
      where: {
        email: reservation.user.email,
      },
    })

    const returnedPhysicalProducts = reservation.products.filter(p => {
      const physicalProduct = productStates.find(
        s => s.productUID === p.seasonsUID
      )
      return physicalProduct.returned
    })

    // Mark reservation as completed
    const reservationPromise = this.prisma.client.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "Completed",
        returnedAt: new Date(),
        returnedProducts: {
          connect: productStates
            .filter(a => a.returned)
            .map(productState => ({
              seasonsUID: productState.productUID,
            })),
        },
      },
    })

    const updateBagPromise = this.prisma.client.bagItem.deleteMany({
      where: {
        customer: { id: reservation.customer.id },
        saved: false,
        productVariant: {
          id: {
            in: returnedPhysicalProducts.map(p => (p.productVariant as any).id),
          },
        },
        status: "Reserved",
      },
    })

    // Create reservationFeedback datamodels for the returned product variants
    const [
      reservationFeedbackPromise,
    ] = await this.createReservationFeedbacksForVariants(
      await this.prisma.client.productVariant.findMany({
        where: {
          id: {
            in: returnedPhysicalProducts.map(p => (p.productVariant as any).id),
          },
        },
      }),
      prismaUser,
      reservation
    )

    const [
      updateReturnPackagePromise,
    ] = await this.reservationUtils.updateReturnPackageOnCompletedReservation(
      reservation,
      returnedPhysicalProducts,
      trackingNumber
    )

    await this.prisma.client.$transaction([
      ...(promises as PrismaPromise<any>[]),
      receiptPromise,
      reservationPromise,
      updateBagPromise,
      reservationFeedbackPromise,
      updateReturnPackagePromise,
    ])

    await this.pushNotifs.pushNotifyUsers({
      emails: [prismaUser.email],
      pushNotifID: "ResetBag",
    })

    await this.emails.sendYouCanNowReserveAgainEmail(prismaUser)

    await this.emails.sendAdminConfirmationEmail(
      prismaUser,
      returnedPhysicalProducts,
      reservation
    )
  }

  interpretReservationLogs(logs: AdminActionLog[]) {
    // for now, just filter these out of the changed logs
    const keysWeDontCareAbout = [
      "receipt",
      "id",
      "sentPackage",
      "returnedPackage",
    ]

    return this.utils.filterAdminLogs(logs, keysWeDontCareAbout)
  }

  async draftReservationLineItems(user: User, hasFreeSwap: boolean) {
    if (hasFreeSwap) {
      return []
    }
    try {
      const {
        estimate: { invoice_estimate },
      } = await chargebee.estimate
        .create_invoice({
          invoice: {
            customer_id: user.id,
          },
          charges: [
            {
              amount: 3000,
              taxable: true,
              description: "Early Swap",
              avalara_tax_code: "FR020000",
            },
          ],
        })
        .request()

      // Below we are creating a draft OrderLineItem with dummy data to show to the client
      // it's using a random ID and a recordID because it's not being saved to the database
      return [
        {
          id: cuid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          recordType: "EarlySwap",
          name: "Early swap",
          recordID: cuid(),
          currencyCode: "USD",
          price: invoice_estimate.sub_total,
          taxPrice: invoice_estimate?.taxes?.reduce(
            (acc, tax) => acc + tax.amount,
            0
          ),
        },
      ]
    } catch (e) {
      this.error.setExtraContext(user, "user")
      this.error.captureError(e)
      return []
    }
  }

  async updateReservation(
    data,
    where: { id: string },
    select: Prisma.ReservationSelect
  ) {
    const promises = []
    const physicalProductSelect = Prisma.validator<
      Prisma.PhysicalProductSelect
    >()({
      id: true,
      inventoryStatus: true,
      warehouseLocation: true,
      productVariant: {
        select: {
          reservable: true,
          reserved: true,
          nonReservable: true,
          offloaded: true,
          stored: true,
          bagItems: {
            where: {
              customer: { reservations: { some: where } },
              saved: false,
            },
          },
        },
      },
    })
    const reservation = await this.prisma.client.reservation.findUnique({
      where,
      select: {
        id: true,
        status: true,
        customer: { select: { id: true } },
        phase: true,
        returnedProducts: {
          select: physicalProductSelect,
        },
        newProducts: {
          select: physicalProductSelect,
        },
      },
    })

    const changingStatusTo = (status: ReservationStatus) => {
      return reservation.status !== status && data.status === status
    }

    const canCancelReservation = [
      "Queued",
      "Packed",
      "Picked",
      "Hold",
    ].includes(reservation.status)
    // If setting to cancelled, execute implied updates
    if (changingStatusTo("Cancelled")) {
      if (!canCancelReservation) {
        throw new Error(
          `Can only cancel an order with status Queued, Picked, or Packed`
        )
      }
      // Set timestamp
      data["cancelledAt"] = new Date()

      // For new products on reservation, update the status, related counts, and bag item
      for (const prod of reservation.newProducts) {
        const newInventoryStatus = !!prod.warehouseLocation
          ? "Reservable"
          : "NonReservable"
        const variantUpdateData = this.productVariantService.getCountsForStatusChange(
          {
            productVariant: prod.productVariant,
            oldInventoryStatus: prod.inventoryStatus,
            newInventoryStatus,
          }
        )
        promises.push(
          this.prisma.client.physicalProduct.update({
            where: { id: prod.id },
            data: {
              inventoryStatus: newInventoryStatus,
              productVariant: { update: variantUpdateData },
            },
          })
        )
        const bagItemId = prod.productVariant.bagItems?.[0]?.id
        if (!!bagItemId) {
          promises.push(
            this.prisma.client.bagItem.delete({ where: { id: bagItemId } })
          )
        }
      }
    }

    // If setting to lost, execute implied updates
    const cannotMarkReservationAsLost = [
      "Queued",
      "Picked",
      "Packed",
      "Completed",
    ].includes(reservation.status)
    if (changingStatusTo("Lost")) {
      if (cannotMarkReservationAsLost) {
        throw new Error(
          `Cannot mark reservation with status ${reservation.status} as Lost.`
        )
      }
      // If it's on the way to the customer, we know all new products got lost. If it's on the way
      //  back to us and they've used the return flow, we know all the "returnedProducts" got lost.
      const productsToUpdate =
        reservation.phase === "BusinessToCustomer"
          ? reservation.newProducts
          : reservation.returnedProducts

      // For whichever products we know got lost, update status, counts, and bag items accordingly
      for (const prod of productsToUpdate) {
        const variantUpdateData = this.productVariantService.getCountsForStatusChange(
          {
            productVariant: prod.productVariant,
            oldInventoryStatus: prod.inventoryStatus,
            newInventoryStatus: "NonReservable",
          }
        )
        promises.push(
          this.prisma.client.physicalProduct.update({
            where: { id: prod.id },
            data: {
              productStatus: "Lost",
              inventoryStatus: "NonReservable",
              productVariant: { update: variantUpdateData },
            },
          })
        )
        const bagItemId = prod.productVariant.bagItems?.[0]?.id
        if (!!bagItemId) {
          promises.push(
            this.prisma.client.bagItem.delete({ where: { id: bagItemId } })
          )
        }
      }
    }

    // If setting to completed, set timestamp
    if (changingStatusTo("Completed")) {
      data["completedAt"] = new Date()
    }

    // Reservation was just packed. Null out warehouse locations on attached products
    if (changingStatusTo("Picked") || changingStatusTo("Packed")) {
      const updateData = { warehouseLocation: { disconnect: true } }
      if (data.status === "Packed") {
        updateData["packedAt"] = new Date()
      }
      promises.push(
        ...reservation.newProducts.map(a =>
          this.prisma.client.physicalProduct.update({
            where: { id: a.id },
            data: updateData,
          })
        )
      )
    }

    promises.push(
      this.prisma.client.reservation.update({ data, where, select })
    )

    const results = await this.prisma.client.$transaction(promises)
    const updatedReservation = results.pop()

    return updatedReservation
  }

  async createReservationFeedbacksForVariants(
    productVariants,
    user,
    reservation
  ): Promise<[PrismaPromise<ReservationFeedback>]> {
    const MULTIPLE_CHOICE = "MultipleChoice"
    const variantInfos = await Promise.all(
      productVariants.map(async variant => {
        const products = await this.prisma.client.product.findMany({
          where: {
            variants: {
              some: {
                id: variant.id,
              },
            },
          },
        })
        if (!products || products.length === 0) {
          throw new Error(
            `createReservationFeedback error: Unable to find product for product variant id ${variant.id}.`
          )
        }
        return {
          id: variant.id,
          name: products[0].name,
          retailPrice: products[0].retailPrice,
        }
      })
    )

    return [
      this.prisma.client.reservationFeedback.create({
        data: {
          feedbacks: {
            create: variantInfos.map(
              (variantInfo: { id: string; retailPrice: number }) =>
                Prisma.validator<
                  Prisma.ProductVariantFeedbackCreateWithoutReservationFeedbackInput
                >()({
                  isCompleted: false,
                  rating: 0,
                  review: "",
                  questions: {
                    create: [
                      {
                        question: `What did you think about this?`,
                        options: {
                          set: ["Disliked", "It was OK", "Loved it"],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                      {
                        question: `How many times did you wear this?`,
                        options: {
                          set: [
                            "Never wore it",
                            "1-2 times",
                            "3-5 times",
                            "More than 6 times",
                          ],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                      {
                        question: `Did it fit as expected?`,
                        options: {
                          set: [
                            "Fit small",
                            "Fit true to size",
                            "Fit oversized",
                          ],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                      {
                        question: `Would you buy it at retail for $${variantInfo.retailPrice}?`,
                        options: {
                          set: [
                            "No",
                            "Yes",
                            "Buy below retail",
                            "Would only rent",
                          ],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                    ],
                  },
                  variant: { connect: { id: variantInfo.id } },
                })
            ),
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          reservation: {
            connect: {
              id: reservation.id,
            },
          },
        },
      }),
    ]
  }

  private async validateLastReservation(lastReservation, items) {
    if (!lastReservation) {
      return
    }
    const lastReservationHasLessItems =
      lastReservation?.products?.length < items?.length
    if (
      !!lastReservation &&
      lastReservationHasLessItems &&
      this.statements.reservationIsActive(lastReservation)
    ) {
      // Update last reservation to completed since the customer is creating a new reservation while having one active
      await this.prisma.client.reservation.update({
        where: {
          id: lastReservation.id,
        },
        data: {
          status: "Completed",
        },
      })
    } else if (
      !!lastReservation &&
      this.statements.reservationIsActive(lastReservation)
    ) {
      throw new ApolloError(
        `Last reservation must either be null, completed, cancelled, or lost. Last Reservation number. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`
      )
    }
  }

  private async updateBagItemsForReservation({
    newProductVariantsBeingReserved,
    customerId,
    physicalProductsBeingReserved,
  }) {
    const promises = []
    const bagItemsToUpdate = await this.prisma.client.bagItem.findMany({
      where: {
        productVariant: {
          id: {
            in: newProductVariantsBeingReserved,
          },
        },
        customer: {
          id: customerId,
        },
      },
      select: {
        id: true,
        productVariant: {
          select: {
            physicalProducts: { select: { seasonsUID: true } },
            id: true,
          },
        },
      },
    })
    for (const bagItem of bagItemsToUpdate) {
      const physicalProductToConnect = bagItem.productVariant.physicalProducts.find(
        a =>
          physicalProductsBeingReserved
            .map(a => a.seasonsUID)
            .includes(a.seasonsUID)
      )
      promises.push(
        this.prisma.client.bagItem.update({
          where: { id: bagItem.id },
          data: {
            physicalProduct: {
              connect: { seasonsUID: physicalProductToConnect.seasonsUID },
            },
            status: "Reserved",
          },
        })
      )
    }

    return promises
  }

  private async getNewProductVariantsBeingReserved({
    productVariantIDs,
    customerId,
  }: {
    productVariantIDs: string[]
    customerId: string
  }): Promise<string[]> {
    const customerBagItems = await this.prisma.client.bagItem.findMany({
      where: { customer: { id: customerId }, saved: false },
      select: { status: true, productVariant: { select: { id: true } } },
    })
    const reservedProductVariantIds = customerBagItems
      .filter(a => a.status === "Reserved")
      .map(b => b.productVariant.id)
    const newVariantsBeingReserved = productVariantIDs.filter(
      a => !reservedProductVariantIds.includes(a)
    )

    if (newVariantsBeingReserved.length === 0) {
      throw new Error(`Must reserve at least 1 new item`)
    }
    return newVariantsBeingReserved
  }

  private async getHeldPhysicalProducts(
    customer: Customer,
    lastCompletedReservation
  ): Promise<PhysicalProduct[]> {
    if (lastCompletedReservation == null) return []

    const reservedBagItems = await this.productUtils.getReservedBagItems(
      customer
    )
    const reservedProductVariantIds = reservedBagItems.map(
      a => a.productVariant.id
    )

    return lastCompletedReservation.products
      .filter(prod => prod.inventoryStatus === "Reserved")
      .filter(a =>
        reservedProductVariantIds.includes(a.productVariant.id as string)
      )
  }

  private async createReservationData(
    seasonsToCustomerTransaction,
    customerToSeasonsTransaction,
    lastReservation: {
      returnPackages: Array<Pick<Package, "id"> & { events: { id: string }[] }>
    },
    user: User,
    customer: Customer,
    shipmentWeight: number,
    physicalProductsBeingReserved: PhysicalProduct[],
    heldPhysicalProducts: PhysicalProduct[],
    shippingOptionID: string
  ) {
    const allPhysicalProductsInReservation = [
      ...physicalProductsBeingReserved,
      ...heldPhysicalProducts,
    ]

    const physicalProductSUIDs = allPhysicalProductsInReservation.map(p => ({
      seasonsUID: p.seasonsUID,
    }))
    const newPhysicalProductSUIDs = physicalProductsBeingReserved.map(p => ({
      seasonsUID: p.seasonsUID,
    }))

    const customerShippingAddressRecordID = await (
      await this.prisma.client.customer
        .findUnique({ where: { id: customer.id } })
        .detail()
    ).shippingAddressId
    interface UniqueIDObject {
      id: string
    }
    const uniqueReservationNumber = await this.reservationUtils.getUniqueReservationNumber()

    const returnPackagesToCarryOver =
      lastReservation?.returnPackages?.filter(a => a.events.length === 0) || []
    let createData = Prisma.validator<Prisma.ReservationCreateInput>()({
      products: {
        connect: physicalProductSUIDs,
      },
      newProducts: {
        connect: newPhysicalProductSUIDs,
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      phase: "BusinessToCustomer",
      sentPackage: {
        create: {
          transactionID: seasonsToCustomerTransaction.object_id,
          weight: shipmentWeight,
          items: {
            // need to include the type on the function passed into map
            // or we get build errors comlaining about the type here
            connect: physicalProductsBeingReserved.map(
              (prod): UniqueIDObject => {
                return { id: prod.id }
              }
            ),
          },
          shippingLabel: {
            create: {
              image: seasonsToCustomerTransaction.label_url || "",
              trackingNumber:
                seasonsToCustomerTransaction.tracking_number || "",
              trackingURL:
                seasonsToCustomerTransaction.tracking_url_provider || "",
              name: "UPS",
            },
          },
          fromAddress: {
            connect: {
              slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
            },
          },
          toAddress: {
            connect: { id: customerShippingAddressRecordID },
          },
        },
      },
      returnPackages: {
        create: {
          transactionID: customerToSeasonsTransaction.object_id,
          shippingLabel: {
            create: {
              image: customerToSeasonsTransaction.label_url || "",
              trackingNumber:
                customerToSeasonsTransaction.tracking_number || "",
              trackingURL:
                customerToSeasonsTransaction.tracking_url_provider || "",
              name: "UPS",
            },
          },
          fromAddress: {
            connect: {
              id: customerShippingAddressRecordID,
            },
          },
          toAddress: {
            connect: {
              slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
            },
          },
        },
        connect: returnPackagesToCarryOver.map(a => ({
          id: a.id,
        })),
      },
      reservationNumber: uniqueReservationNumber,
      lastLocation: {
        connect: {
          slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
        },
      },
      ...(!!shippingOptionID
        ? {
            shippingOption: {
              connect: {
                id: shippingOptionID,
              },
            },
          }
        : {}),
      shipped: false,
      status: "Queued",
    })

    return createData
  }
}
