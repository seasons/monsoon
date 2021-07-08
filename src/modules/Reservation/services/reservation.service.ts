import { ErrorService } from "@app/modules/Error/services/error.service"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import {
  PhysicalProductUtilsService,
  ProductUtilsService,
  ProductVariantService,
} from "@modules/Product"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  Customer,
  Prisma,
  PrismaPromise,
  ReservationFeedback,
  User,
} from "@prisma/client"
import {
  AdminActionLog,
  ID_Input,
  InventoryStatus,
  PhysicalProduct,
  PhysicalProductStatus,
  ReservationStatus,
  ShippingCode,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import chargebee from "chargebee"
import cuid from "cuid"
import { intersection } from "lodash"
import { DateTime } from "luxon"

import { ReservationUtilsService } from "./reservation.utils.service"

interface PhysicalProductWithProductVariant extends PhysicalProduct {
  productVariant: { id: ID_Input }
}

interface ProductState {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

export interface ReservationWithProductVariantData {
  id: ID_Input
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
    private readonly physicalProductUtilsService: PhysicalProductUtilsService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly pushNotifs: PushNotificationService,
    private readonly reservationUtils: ReservationUtilsService,
    private readonly error: ErrorService,
    private readonly utils: UtilsService,
    private readonly customerUtils: CustomerUtilsService
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

    const customerWithPlanItemCount = await this.prisma.client2.customer.findUnique(
      {
        where: { id: customer.id },
        select: {
          membership: { select: { plan: { select: { itemCount: true } } } },
        },
      }
    )
    const customerPlanItemCount =
      customerWithPlanItemCount?.membership?.plan?.itemCount

    // Do a quick validation on the data
    if (!!customerPlanItemCount && items.length !== customerPlanItemCount) {
      throw new ApolloError(
        `Your reservation must contain ${customerPlanItemCount} items`,
        "515"
      )
    }

    // Figure out which items the user is reserving anew and which they already have
    const lastReservation = await this.reservationUtils.getLatestReservation(
      customer
    )
    this.checkLastReservation(lastReservation)

    const lastCompletedReservation = !!lastReservation
      ? lastReservation.status === "Completed"
        ? lastReservation
        : await this.reservationUtils.getLatestReservation(
            customer,
            "Completed"
          )
      : null
    const newProductVariantsBeingReserved = await this.getNewProductVariantsBeingReserved(
      { productVariantIDs: items, customerId: customer.id }
    )
    const heldPhysicalProducts = await this.getHeldPhysicalProducts(
      customer,
      lastCompletedReservation
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
      this.prisma.client2.physicalProduct.updateMany({
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

    const bagItemsToUpdateIds = (
      await this.prisma.client2.bagItem.findMany({
        where: {
          productVariant: {
            id: {
              in: newProductVariantsBeingReserved,
            },
          },
          customer: {
            id: customer.id,
          },
        },
      })
    ).map(a => a.id)

    promises.push(
      this.prisma.client2.bagItem.updateMany({
        where: { id: { in: bagItemsToUpdateIds } },
        data: {
          status: "Reserved",
        },
      })
    )

    // Create one time charge for shipping addon
    let shippingOptionID
    if (!!shippingCode) {
      shippingOptionID = await this.payment.addShippingCharge(
        customer,
        shippingCode
      )
    }

    // Create reservation records in prisma
    const reservationData = await this.createReservationData(
      seasonsToCustomerTransaction,
      customerToSeasonsTransaction,
      user,
      customer,
      await this.shippingService.calcShipmentWeightFromProductVariantIDs(
        newProductVariantsBeingReserved as string[]
      ),
      physicalProductsBeingReserved,
      heldPhysicalProducts,
      shippingOptionID
    )
    const reservationPromise = this.prisma.client2.reservation.create({
      data: reservationData,
      select: {
        ...select,
        reservationNumber: true,
      },
    })

    promises.push(reservationPromise)

    // Resolve all prisma operation in one transaction
    const result = await this.prisma.client2.$transaction(promises.flat())

    const reservation = result.pop()
    await this.addEarlySwapIfNeeded(reservation.id, customer.id)

    // Send confirmation email
    await this.emails.sendReservationConfirmationEmail(
      user,
      productsBeingReserved,
      reservation,
      seasonsToCustomerTransaction.tracking_number,
      seasonsToCustomerTransaction.tracking_url_provider
    )

    try {
      await this.removeRestockNotifications(items, customer)
    } catch (err) {
      this.error.setUserContext(user)
      this.error.setExtraContext({ items })
      this.error.captureError(err)
    }

    return reservation
  }

  async addEarlySwapIfNeeded(reservationID, customerID) {
    const nextFreeSwapDate = await this.customerUtils.nextFreeSwapDate(
      customerID
    )

    const doesNotHaveFreeSwap =
      nextFreeSwapDate && nextFreeSwapDate > DateTime.local().toISO()
    const swapCharge = await this.payment.addEarlySwapCharge(customerID)

    if (doesNotHaveFreeSwap && reservationID) {
      await this.prisma.client2.reservation.update({
        where: { id: reservationID },
        data: {
          lineItems: {
            create: [
              {
                recordID: reservationID,
                price: swapCharge.invoice.sub_total,
                currencyCode: "USD",
                recordType: "EarlySwap",
                name: "Early swap",
                taxPrice: swapCharge?.invoice?.tax || 0,
              },
            ],
          },
        },
      })
    }
  }

  async returnItems(items: string[], customer: Customer) {
    const lastReservation = await this.reservationUtils.getLatestReservation(
      customer
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

    await this.prisma.client2.reservation.update({
      data: {
        returnedProducts: {
          set: items.map(item => ({ id: item })),
        },
        returnedAt: new Date(),
      },
      where: { id: String(lastReservation.id) },
    })

    return lastReservation
  }

  async removeRestockNotifications(items, customer) {
    const restockNotifications = await this.prisma.client2.productNotification.findMany(
      {
        where: {
          customer: {
            id: customer.id,
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
      return await this.prisma.client2.productNotification.updateMany({
        where: { id: { in: restockNotifications.map(notif => notif.id) } },
        data: {
          shouldNotify: false,
        },
      })
    }
  }

  async getReservation(reservationNumber: number) {
    const data = await this.prisma.client2.reservation.findUnique({
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
        returnedPackage: {
          select: {
            id: true,
          },
        },
      },
    })
    return this.prisma.sanitizePayload(data, "Reservation")
  }

  async processReservation(reservationNumber, productStates: ProductState[]) {
    // Update status on physical products depending on whether
    // the item was returned, and update associated product variant counts

    const _physicalProducts = await this.prisma.client2.physicalProduct.findMany(
      {
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
      }
    )
    const physicalProducts = this.prisma.sanitizePayload(
      _physicalProducts,
      "PhysicalProduct"
    )

    let promises = []

    for (let state of productStates) {
      if (state.returned) {
        const physicalProduct = physicalProducts.find(
          a => a.seasonsUID === state.productUID
        )
        const productVariant = physicalProduct.productVariant as any
        const product = productVariant.product

        const inventoryStatus =
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
          this.prisma.client2.product.update({
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

    const receiptPromise = this.prisma.client2.reservationReceipt.create({
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

    const prismaUser = await this.prisma.client2.user.findUnique({
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
    const reservationPromise = this.prisma.client2.reservation.update({
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

    const updateBagPromise = this.prisma.client2.bagItem.deleteMany({
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
      await this.prisma.client2.productVariant.findMany({
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
      returnedPhysicalProducts
    )

    await this.prisma.client2.$transaction([
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
    const reservation = await this.prisma.client2.reservation.findUnique({
      where,
      select: {
        id: true,
        status: true,
        products: {
          select: { id: true },
        },
      },
    })

    // If we're completing or cancelling the resy, set the timestamp
    if (reservation.status !== "Cancelled" && data.status === "Cancelled") {
      data["cancelledAt"] = new Date()
    }
    if (reservation.status !== "Completed" && data.status === "Completed") {
      data["completedAt"] = new Date()
    }

    let promises: any[] = [
      this.prisma.client2.reservation.update({ data, where, select }),
    ]

    // Reservation was just packed. Null out warehouse locations on attached products
    if (
      ["Packed", "Picked"].includes(data.status) &&
      data.status !== reservation.status
    ) {
      const updateData = { warehouseLocation: { disconnect: true } }
      if (data.status === "Packed") {
        updateData["packedAt"] = new Date()
      }
      promises.push(
        ...reservation.products.map(a =>
          this.prisma.client2.physicalProduct.update({
            where: { id: a.id },
            data: updateData,
          })
        )
      )
    }

    const [updatedReservation] = await this.prisma.client2.$transaction(
      promises
    )
    return this.prisma.sanitizePayload(updatedReservation, "Reservation")
  }

  async createReservationFeedbacksForVariants(
    productVariants,
    user,
    reservation
  ): Promise<[PrismaPromise<ReservationFeedback>]> {
    const MULTIPLE_CHOICE = "MultipleChoice"
    const variantInfos = await Promise.all(
      productVariants.map(async variant => {
        const products = await this.prisma.client2.product.findMany({
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
      this.prisma.client2.reservationFeedback.create({
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
                          // create: ["Disliked", "It was OK", "Loved it"],
                          create: [
                            { value: "Disliked", position: 1000 },
                            { value: "It was OK", position: 2000 },
                            { value: "Loved it", position: 3000 },
                          ],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                      {
                        question: `How many times did you wear this?`,
                        options: {
                          // set: [
                          //   "Never wore it",
                          //   "1-2 times",
                          //   "3-5 times",
                          //   "More than 6 times",
                          // ],
                          create: [
                            { value: "Never wore it", position: 1000 },
                            { value: "1-2 times", position: 2000 },
                            { value: "3-5 times", position: 3000 },
                            { value: "More than 6 times", position: 4000 },
                          ],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                      {
                        question: `Did it fit as expected?`,
                        options: {
                          // set: ["Fit small", "Fit true to size", "Fit oversized"],
                          create: [
                            { value: "Fit small", position: 1000 },
                            { value: "Fit true to size", position: 2000 },
                            { value: "Fit oversized", position: 3000 },
                          ],
                        },
                        type: MULTIPLE_CHOICE,
                      },
                      {
                        question: `Would you buy it at retail for $${variantInfo.retailPrice}?`,
                        options: {
                          // set: ["No", "Yes", "Buy below retail", "Would only rent"],
                          create: [
                            { value: "No", position: 1000 },
                            { value: "Yes", position: 2000 },
                            { value: "Buy below retail", position: 3000 },
                            { value: "Would only rent", position: 4000 },
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

  private checkLastReservation(lastReservation) {
    if (
      !!lastReservation &&
      ![
        "Completed" as ReservationStatus,
        "Cancelled" as ReservationStatus,
      ].includes(lastReservation.status)
    ) {
      throw new ApolloError(
        `Last reservation has non-completed, non-cancelled status. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`
      )
    }
  }

  private async getNewProductVariantsBeingReserved({
    productVariantIDs,
    customerId,
  }: {
    productVariantIDs: string[]
    customerId: string
  }): Promise<string[]> {
    const _customerReservations = await this.prisma.client2.reservation.findMany(
      {
        where: { customer: { id: customerId } },
        orderBy: { createdAt: "desc" }, // reverse chronological order
        select: {
          id: true,
          createdAt: true,
          status: true,
          products: {
            select: {
              id: true,
              seasonsUID: true,
              productVariant: { select: { id: true } },
              inventoryStatus: true,
            },
          },
        },
      }
    )
    const customerReservations = this.prisma.sanitizePayload(
      _customerReservations,
      "Reservation"
    )

    const lastCompletedReservation = customerReservations.find(
      a => a.status === "Completed"
    )
    const indexOfLastCompletedReservation = customerReservations.findIndex(
      a => a.status === "Completed"
    )
    const cancelledReservationssSinceLastCompletedReservation = [
      ...customerReservations,
    ].splice(0, indexOfLastCompletedReservation)

    // If they don't have any reservation history, all items are new.
    if (!lastCompletedReservation) {
      return productVariantIDs
    }

    const newVariantsBeingReserved = []
    const productVariantsInLastCompletedReservation = lastCompletedReservation.products.map(
      prod => (prod.productVariant as any).id
    )
    productVariantIDs.forEach(id => {
      // If it's not in the last completed reservation, its new
      const inLastCompletedReservation = productVariantsInLastCompletedReservation.includes(
        id
      )
      if (!inLastCompletedReservation) {
        newVariantsBeingReserved.push(id)
        return
      }

      // If it's in the last completed reservation, and they've cancelled 1 or more reservations since then,
      // and it's not in each of those cancelled orders, its new
      const hasCancelledOrdersSinceLastCompletedReservation =
        cancelledReservationssSinceLastCompletedReservation.length > 0
      if (hasCancelledOrdersSinceLastCompletedReservation) {
        const carriedOverItemOnAllCancelledOrders = cancelledReservationssSinceLastCompletedReservation.every(
          a =>
            a.products.flatMap(b => (b.productVariant as any).id).includes(id)
        )
        if (!carriedOverItemOnAllCancelledOrders) {
          newVariantsBeingReserved.push(id)
        }
      }

      // If it's in the last completed reservation, and there are no cancelled reservations since then,
      // and the inventory status of the item is Reservable, it's new (they returned it and are re-reserving right away)
      const isReordering =
        cancelledReservationssSinceLastCompletedReservation.length === 0 &&
        this.reservationUtils.inventoryStatusOf(
          lastCompletedReservation as any,
          id
        ) === "Reservable"
      if (isReordering) {
        newVariantsBeingReserved.push(id)
      }
    })

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
      await this.prisma.client2.customer
        .findUnique({ where: { id: customer.id } })
        .detail()
    ).shippingAddressId
    interface UniqueIDObject {
      id: string
    }
    const uniqueReservationNumber = await this.reservationUtils.getUniqueReservationNumber()

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
      returnedPackage: {
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
