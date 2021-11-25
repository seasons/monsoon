import { ApplicationType } from "@app/decorators/application.decorator"
import { WinstonLogger } from "@app/lib/logger"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { PushNotificationService } from "@app/modules/PushNotification"
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
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  Reservation,
  ReservationFeedback,
  ReservationStatus,
  ShippingCode,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
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

  async inboundReservations(select) {
    const reservationPhysicalProducts = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        distinct: ["customerId"],
        where: {
          status: "ReturnPending",
        },
        orderBy: {
          updatedAt: "asc",
        },
        select: merge(select, {
          id: true,
          customer: {
            select: {
              reservationPhysicalProducts: {
                where: {
                  status: "ReturnPending",
                },
                select: {
                  id: true,
                },
              },
            },
          },
        }),
      }
    )

    return reservationPhysicalProducts
  }

  async outboundReservations(select) {
    const reservationPhysicalProducts = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        distinct: ["customerId"],
        where: {
          status: "Queued",
        },
        orderBy: {
          updatedAt: "asc",
        },
        select: merge(select, {
          id: true,
          customer: {
            select: {
              id: true,
              reservationPhysicalProducts: {
                where: {
                  status: "Queued",
                },
                select: {
                  id: true,
                },
              },
            },
          },
        }),
      }
    )

    return reservationPhysicalProducts
  }

  async cancelReturn(customer: Customer, bagItemId: string) {
    if (bagItemId) {
      // If one bagItemId is passed just cancel the single return
      const bagItem = await this.prisma.client.bagItem.findUnique({
        where: {
          id: bagItemId,
        },
        select: {
          reservationPhysicalProduct: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      })

      const reservationPhysicalProduct = await this.prisma.client.reservationPhysicalProduct.update(
        {
          where: {
            id: bagItem.reservationPhysicalProduct.id,
          },
          data: {
            status: "DeliveredToCustomer",
          },
          select: {
            id: true,
          },
        }
      )

      return [reservationPhysicalProduct]
    } else {
      // Cancel all the returns if no specific bag item is passed
      const bagItems = await this.prisma.client.bagItem.findMany({
        where: {
          customer: {
            id: customer.id,
          },
          saved: false,
        },
        select: {
          reservationPhysicalProduct: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      })

      const returnPendingBagItems = bagItems.filter(bagItem => {
        return bagItem.reservationPhysicalProduct.status === "ReturnPending"
      })

      await this.prisma.client.reservationPhysicalProduct.updateMany({
        where: {
          id: {
            in: returnPendingBagItems.map(
              item => item.reservationPhysicalProduct.id
            ),
          },
        },
        data: {
          status: "DeliveredToCustomer",
        },
      })

      return this.prisma.client.reservationPhysicalProduct.findMany({
        where: {
          id: {
            in: returnPendingBagItems.map(
              item => item.reservationPhysicalProduct.id
            ),
          },
        },
        select: {
          id: true,
        },
      })
    }
  }

  async returnItems(items: string[], customer: Customer) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
      select: {
        physicalProduct: {
          select: {
            id: true,
          },
        },
        reservationPhysicalProduct: {
          select: {
            id: true,
          },
        },
      },
    })

    const bagItemsToUpdate = bagItems.filter(bagItem => {
      return items.includes(bagItem.physicalProduct.id)
    })

    const reservationPhysicalProductIds = bagItemsToUpdate.map(
      item => item.reservationPhysicalProduct.id
    )

    await this.prisma.client.reservationPhysicalProduct.updateMany({
      where: {
        id: {
          in: reservationPhysicalProductIds,
        },
      },
      data: {
        status: "ReturnPending",
        hasCustomerReturnIntent: true,
        customerReturnIntentAt: new Date(),
      },
    })

    return this.prisma.client.reservationPhysicalProduct.findMany({
      where: {
        id: {
          in: reservationPhysicalProductIds,
        },
      },
      select: {
        id: true,
      },
    })
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
    application,
    reservation,
    customer,
    filterBy = ReservationLineItemsFilter.AllItems,
    shippingCode = ShippingCode.UPSGround,
  }: {
    application: ApplicationType
    reservation?: Pick<Reservation, "id">
    customer: Customer
    filterBy?: ReservationLineItemsFilter
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

    if (application !== "spring" && customerWithUser.membership === null) {
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
        const reservationWithProducts = await this.prisma.client.reservation.findUnique(
          {
            where: {
              id: reservation.id,
            },
            select: {
              id: true,
              reservationPhysicalProducts: {
                select: {
                  physicalProduct: {
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
              },
            },
          }
        )

        lines = reservationWithProducts.reservationPhysicalProducts.map(rpp => {
          const variant = rpp.physicalProduct.productVariant
          const product = variant.product
          const price = product.computedRentalPrice * 100

          return {
            name: product.name,
            recordType: "ProductVariant",
            recordID: variant.id,
            price,
          }
        })

        variantIDs = reservationWithProducts.reservationPhysicalProducts.map(
          rpp => rpp.physicalProduct.productVariant.id
        )
        updatedShippingCode =
          (reservationWithProducts as any)?.shippingOption?.shippingMethod
            ?.code || shippingCode
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

      const chargebeeCharges = [...lines, ...processingFeeLines]
        .map(line => {
          return {
            amount: line.price,
            description: line.name,
            taxable: line.recordType !== "Fee",
          }
        })
        .filter(l => l.amount > 0)

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
    const includeSentPackage = hasFreeSwap
      ? false
      : shippingCode === ShippingCode.Pickup
      ? false
      : true

    const {
      sentRate,
    } = await this.shippingService.getShippingRateForVariantIDs(variantIDs, {
      customer,
      includeSentPackage,
      includeReturnPackage: false,
      serviceLevel:
        shippingCode === "UPSGround"
          ? UPSServiceLevel.Ground
          : UPSServiceLevel.Select,
    })

    return shippingCode === "Pickup"
      ? []
      : [
          {
            name: "Shipping",
            recordType: "Fee",
            price: sentRate?.amount || 0,
          },
        ]
  }
}
