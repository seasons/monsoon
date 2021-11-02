import { WinstonLogger } from "@app/lib/logger"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { RentalService } from "@app/modules/Payment/services/rental.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ShippingMethodFieldsResolver } from "@app/modules/Shipping/fields/shippingMethod.fields.resolver"
import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { EmailService } from "@modules/Email/services/email.service"
import {
  ShippingService,
  UPSServiceLevel,
} from "@modules/Shipping/services/shipping.service"
import { Injectable, Logger } from "@nestjs/common"
import {
  AdminActionLog,
  Customer,
  Package,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  Reservation,
  ReservationFeedback,
  ReservationPhysicalProduct,
  ReservationStatus,
  ShippingCode,
  WarehouseLocation,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import chargebee from "chargebee"
import cuid from "cuid"
import { intersection, merge } from "lodash"
import { DateTime } from "luxon"

import { ReservationUtilsService } from "./reservation.utils.service"

export enum ReservationLineItemsFilter {
  AllItems = "AllItems",
  NewItems = "NewItems",
}

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
  private readonly logger = (new Logger(
    `ReservationService`
  ) as unknown) as WinstonLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly pushNotifs: PushNotificationService,
    private readonly reservationUtils: ReservationUtilsService,
    private readonly error: ErrorService,
    private readonly utils: UtilsService,
    private readonly customerUtils: CustomerUtilsService
  ) {}

  // TODO: Update ReservationPhysicalProducts here, instead of returnedProducts
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
            user: { select: { email: true } },
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
        email: reservation.customer.user.email,
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

    if (reservation.status === "ReturnPending") {
      promises.push(
        this.prisma.client.reservation.updateMany({
          where: {
            customerId: { equals: reservation.customer.id },
            status: "ReturnPending",
          },
          data: {
            status: "Completed",
          },
        })
      )
    }

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

    await this.prisma.client.$transaction(
      [
        ...(promises as PrismaPromise<any>[]),
        receiptPromise,
        reservationPromise,
        updateBagPromise,
        reservationFeedbackPromise,
        updateReturnPackagePromise,
      ].filter(Boolean)
    )

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

  async draftReservationLineItems({
    reservation,
    customer,
    filterBy = ReservationLineItemsFilter.AllItems,
    shippingCode = ShippingCode.UPSGround,
  }: {
    reservation?: Reservation
    customer: Customer
    filterBy: ReservationLineItemsFilter
    shippingCode?: ShippingCode
  }) {
    const customerWithUser = await this.prisma.client.customer.findUnique({
      where: {
        id: customer.id,
      },
      select: {
        id: true,
        user: true,
        billingInfo: {
          select: {
            state: true,
          },
        },
        membership: {
          select: {
            creditBalance: true,
          },
        },
        detail: {
          select: {
            id: true,
          },
        },
      },
    })

    if (customerWithUser.membership === null) {
      this.logger.log("Customer without membership trying to reserve", {
        customer: customerWithUser,
      })
      throw new Error("Cannot reserve items without a membership")
    }

    const productSelect = Prisma.validator<Prisma.ProductSelect>()({
      id: true,
      name: true,
      recoupment: true,
      wholesalePrice: true,
      rentalPriceOverride: true,
      computedRentalPrice: true,
      category: {
        select: {
          id: true,
          dryCleaningFee: true,
          recoupment: true,
        },
      },
    })

    try {
      let lines = []
      let variantIDs = []
      let updatedShippingCode = shippingCode

      if (reservation) {
        const key =
          filterBy === ReservationLineItemsFilter.AllItems
            ? "products"
            : "newProducts"

        const reservationWithProducts = await this.prisma.client.reservation.findUnique(
          {
            where: {
              id: reservation.id,
            },
            select: {
              id: true,
              [key]: {
                select: {
                  id: true,
                  productVariant: {
                    select: {
                      id: true,
                      product: {
                        select: productSelect,
                      },
                    },
                  },
                },
              },
            },
          }
        )

        lines = reservationWithProducts[key].map(p => {
          const product = p.productVariant.product
          const price = p.computedRentalPrice * 100

          return {
            name: product.name,
            recordType: "ProductVariant",
            recordID: p.productVariant.id,
            price,
          }
        })

        variantIDs = reservationWithProducts[key].map(p => p.productVariant.id)
        updatedShippingCode = (reservationWithProducts as any)?.shippingOption
          ?.shippingMethod?.code
      } else {
        const bagItems = await this.prisma.client.bagItem.findMany({
          where: {
            customer: {
              id: customer.id,
            },
            saved: false,
            ...(filterBy === ReservationLineItemsFilter.NewItems
              ? { status: "Added" }
              : {}),
          },
          select: {
            id: true,
            customer: {
              select: {
                id: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                product: {
                  select: productSelect,
                },
              },
            },
          },
        })

        lines = bagItems.map(bagItem => {
          const product = bagItem?.productVariant?.product
          const price = product.computedRentalPrice * 100

          return {
            name: product.name,
            recordType: "ProductVariant",
            recordID: bagItem.productVariant.id,
            price,
          }
        })

        variantIDs = bagItems.map(a => a.productVariant.id)
      }

      const nextFreeSwapDate = await this.customerUtils.nextFreeSwapDate(
        customer.id
      )
      const hasFreeSwap =
        nextFreeSwapDate === null
          ? true
          : DateTime.fromISO(nextFreeSwapDate) <= DateTime.local()

      const creditBalance = customerWithUser.membership.creditBalance

      const processingFeeLines = await this.calculateProcessingFee({
        variantIDs,
        customer: customerWithUser,
        hasFreeSwap,
        shippingCode: updatedShippingCode,
      })

      const chargebeeCharges = [...lines, ...processingFeeLines].map(line => {
        return {
          amount: line.price,
          description: line.name,
          taxable: line.recordType !== "Fee",
        }
      })

      const {
        estimate: { invoice_estimate },
      } = await chargebee.estimate
        .create_invoice({
          invoice: {
            customer_id: customerWithUser.user.id,
          },
          charges: chargebeeCharges,
        })
        .request()

      const taxTotal = invoice_estimate.taxes.reduce(
        (acc, curr) => acc + curr.amount,
        0
      )

      const linesWithTotal = [
        ...lines,
        ...processingFeeLines,
        ...(taxTotal > 0
          ? [
              {
                name: "Taxes",
                recordType: "Fee",
                recordID: customer.id,
                price: taxTotal,
              },
            ]
          : []),
        ...(creditBalance > 0
          ? [
              {
                name: "Sub-total",
                recordType: "Total",
                recordID: customer.id,
                price: invoice_estimate.sub_total,
              },
              {
                name: "Credits applied",
                recordType: "Credit",
                recordID: customer.id,
                price: -creditBalance,
              },
              {
                name: "Total",
                recordType: "Total",
                recordID: customer.id,
                price: Math.max(0, invoice_estimate.sub_total - creditBalance),
              },
            ]
          : [
              {
                name: "Total",
                recordType: "Total",
                recordID: customer.id,
                price: invoice_estimate.total,
              },
            ]),
      ]

      return linesWithTotal.map(this.createDraftLineItem)
    } catch (e) {
      this.error.setExtraContext(customerWithUser.user, "user")
      this.error.captureError(e)
      console.error(e)
      return []
    }
  }

  private createDraftLineItem = values => ({
    id: cuid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    currencyCode: "USD",
    ...values,
  })

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
    const cannotMarkReservationAsLost = ["Queued", "Picked", "Packed"].includes(
      reservation.status
    )
    if (changingStatusTo("Lost")) {
      if (cannotMarkReservationAsLost) {
        throw new Error(
          `Cannot mark reservation with status ${reservation.status} as Lost.`
        )
      }

      data["lostAt"] = new Date()
      data["lostInPhase"] = reservation.phase

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

      // Set lostAt on the sent package if appropriate.
      if (reservation.phase === "BusinessToCustomer") {
        // We don't try to set a `lostAt` timestamp if the reservation is in CustomerToBusiness
        // phase because we are not a priori sure which package got lost.
        const resyWithSentPackage = await this.prisma.client.reservation.findUnique(
          {
            where: { id: reservation.id },
            select: { sentPackage: { select: { id: true } } },
          }
        )
        promises.push(
          this.prisma.client.package.update({
            where: { id: resyWithSentPackage.sentPackage.id },
            data: { lostAt: new Date() },
          })
        )
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
      this.prisma.client.reservation.update({
        data,
        where,
        select: merge(select, { id: true }),
      })
    )

    const results = await this.prisma.client.$transaction(promises)
    const updatedReservation = results.pop()

    return updatedReservation
  }

  async createReservationFeedbacksForVariants(
    productVariants,
    user,
    reservation
  ): Promise<[PrismaPromise<ReservationFeedback>?]> {
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

    const hasReservationFeedback = await this.prisma.client.reservationFeedback.findFirst(
      {
        where: {
          reservationId: reservation.id,
        },
      }
    )

    if (!!hasReservationFeedback) {
      return Promise.resolve([])
    }

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

  private async calculateProcessingFee({
    variantIDs,
    customer,
    hasFreeSwap,
    shippingCode,
  }: {
    variantIDs: string[]
    customer: { id: string }
    hasFreeSwap: boolean
    shippingCode: ShippingCode
  }) {
    const {
      sentRate,
    } = await this.shippingService.getShippingRateForVariantIDs(variantIDs, {
      customer,
      includeSentPackage: !hasFreeSwap,
      includeReturnPackage: false,
      serviceLevel:
        shippingCode === "UPSGround"
          ? UPSServiceLevel.Ground
          : UPSServiceLevel.Select,
    })

    return [
      {
        name: "Processing",
        recordType: "Fee",
        price: 550,
      },
      {
        name: "Shipping",
        recordType: "Fee",
        price: sentRate?.amount,
      },
    ].filter(a => a.price > 0)
  }
}
