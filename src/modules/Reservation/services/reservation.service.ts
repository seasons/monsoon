import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { EmailService } from "@modules/Email/services/email.service"
import {
  ShippingService,
  UPSServiceLevel,
} from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  AdminActionLog,
  Customer,
  Package,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  Reservation,
  ReservationFeedback,
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

type ReserveItemsPhysicalProduct = Pick<
  PhysicalProduct,
  "seasonsUID" | "id"
> & {
  warehouseLocation: Pick<WarehouseLocation, "id">
}

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
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
    customer: Pick<Customer, "id">,
    select: Prisma.ReservationSelect = { id: true }
  ) {
    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        status: true,
        membership: {
          select: {
            plan: { select: { itemCount: true, tier: true } },
            rentalInvoices: {
              select: { id: true },
              where: { status: "Draft" },
            },
          },
        },
        user: {
          select: { id: true, email: true, firstName: true },
        },
      },
    })

    if (customerWithData.status !== "Active") {
      throw new Error(`Only Active customers can place a reservation`)
    }

    const promises = []

    // Do a quick validation on the data
    const customerPlanType = customerWithData.membership.plan.tier
    const numDraftRentalInvoices =
      customerWithData.membership.rentalInvoices.length
    const activeRentalInvoice =
      customerPlanType === "Access" &&
      customerWithData.membership.rentalInvoices[0]
    if (customerPlanType === "Access" && numDraftRentalInvoices !== 1) {
      const errorMessageSuffix =
        numDraftRentalInvoices === 0
          ? "no draft rental invoices"
          : "more than 1 draft rental invoice"
      throw new ApolloError(
        `Invalid State. Customer has ${errorMessageSuffix}`,
        "400"
      )
    }
    const customerPlanItemCount = customerWithData?.membership?.plan?.itemCount
    if (!!customerPlanItemCount && items.length > customerPlanItemCount) {
      throw new ApolloError(
        `Your reservation cannot contain more than ${customerPlanItemCount} items`,
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

    // Create reservation records in prisma
    const reservationData = await this.createReservationData(
      seasonsToCustomerTransaction,
      customerToSeasonsTransaction,
      lastReservation as any,
      customer,
      await this.shippingService.calcShipmentWeightFromProductVariantIDs(
        newProductVariantsBeingReserved as string[]
      ),
      physicalProductsBeingReserved,
      heldPhysicalProducts,
      shippingCode
    )

    const reservationPromise = this.prisma.client.reservation.create({
      data: reservationData,
    })

    promises.push(reservationPromise)

    if (customerPlanType === "Access") {
      const rentalInvoicePromise = this.prisma.client.rentalInvoice.update({
        where: { id: activeRentalInvoice.id },
        data: {
          reservations: { connect: { id: reservationData.id } },
          products: {
            connect: reservationData.products.connect,
          },
        },
      })
      promises.push(rentalInvoicePromise)
    }

    await this.prisma.client.$transaction(promises.flat())

    const reservation = (await this.prisma.client.reservation.findUnique({
      where: { id: reservationData.id },
      select: merge(select, {
        id: true,
        reservationNumber: true,
        products: { select: { seasonsUID: true } },
      }),
    })) as any

    // Send confirmation email
    await this.emails.sendReservationConfirmationEmail(
      customerWithData.user,
      productsBeingReserved,
      reservation,
      seasonsToCustomerTransaction.tracking_number,
      seasonsToCustomerTransaction.tracking_url_provider
    )

    try {
      await this.removeRestockNotifications(items, customer?.id)
    } catch (err) {
      this.error.setUserContext(customerWithData.user)
      this.error.setExtraContext({ items })
      this.error.captureError(err)
    }

    return reservation
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
        detail: {
          select: {
            id: true,
            shippingAddress: {
              select: {
                shippingOptions: {
                  select: {
                    id: true,
                    shippingMethod: true,
                    externalCost: true,
                  },
                },
              },
            },
          },
        },
      },
    })

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
              shippingOption: {
                select: {
                  shippingMethod: true,
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

      const processingTotal = processingFeeLines.reduce(
        (acc, curr) => acc + curr.price,
        0
      )
      const taxTotal = invoice_estimate.taxes.reduce(
        (acc, curr) => acc + curr.amount,
        0
      )

      const linesWithTotal = [
        ...lines,
        {
          name: "Processing + Tax",
          recordType: "Fee",
          recordID: customer.id,
          price: processingTotal + taxTotal,
        },
        ...(invoice_estimate?.discounts?.length > 0
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
                price: -invoice_estimate.discounts[0].amount,
              },
              {
                name: "Total",
                recordType: "Total",
                recordID: customer.id,
                price: invoice_estimate.total,
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
      returnRate,
    } = await this.shippingService.getShippingRateForVariantIDs(variantIDs, {
      customer,
      includeSentPackage: !hasFreeSwap,
      includeReturnPackage: true,
      serviceLevel:
        shippingCode === "UPSGround"
          ? UPSServiceLevel.Ground
          : UPSServiceLevel.Select,
    })

    return [
      {
        name: "Base Fee",
        recordType: "Fee",
        price: 550,
      },
      {
        name: "Inbound shipping",
        recordType: "Fee",
        price: sentRate?.amount,
      },
      {
        name: "Outbound shipping",
        recordType: "Fee",
        price: returnRate?.amount,
      },
    ].filter(a => a.price > 0)
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
        `Must have all items from last reservation included in the new reservation. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`
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
    customer: Pick<Customer, "id">,
    lastCompletedReservation
  ): Promise<ReserveItemsPhysicalProduct[]> {
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
    customer: Pick<Customer, "id">,
    shipmentWeight: number,
    physicalProductsBeingReserved: ReserveItemsPhysicalProduct[],
    heldPhysicalProducts: ReserveItemsPhysicalProduct[],
    shippingCode: ShippingCode | null
  ) {
    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        user: { select: { id: true } },
        detail: {
          select: {
            shippingAddress: {
              select: {
                id: true,
                shippingOptions: {
                  select: {
                    id: true,
                    shippingMethod: { select: { code: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
    const allPhysicalProductsInReservation = [
      ...physicalProductsBeingReserved,
      ...heldPhysicalProducts,
    ]

    const physicalProductSUIDs = allPhysicalProductsInReservation.map(p => ({
      seasonsUID: p.seasonsUID,
    }))
    const newPhysicalProductSUIDs = allPhysicalProductsInReservation
      .filter(a => !!a.warehouseLocation?.id)
      .map(a => ({ seasonsUID: a.seasonsUID }))

    const returnPackagesToCarryOver =
      lastReservation?.returnPackages?.filter(a => a.events.length === 0) || []
    const createPartialPackageCreateInput = (
      shippoTransaction
    ): Partial<Prisma.PackageCreateInput> => {
      return {
        transactionID: shippoTransaction.object_id,
        shippingLabel: {
          create: {
            image: shippoTransaction.label_url || "",
            trackingNumber: shippoTransaction.tracking_number || "",
            trackingURL: shippoTransaction.tracking_url_provider || "",
            name: "UPS",
          },
        },
        amount: Math.round(shippoTransaction.rate.amount * 100),
      }
    }

    let shippingOptionId
    if (!!shippingCode) {
      const shippingOption = customerWithData.detail.shippingAddress.shippingOptions.find(
        a => a.shippingMethod.code === shippingCode
      )
      shippingOptionId = shippingOption?.id
    }

    const customerShippingAddressRecordID =
      customerWithData.detail.shippingAddress.id
    const uniqueReservationNumber = await this.utils.getUniqueReservationNumber()
    let createData = Prisma.validator<Prisma.ReservationCreateInput>()({
      id: cuid(),
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
          id: customerWithData.user.id,
        },
      },
      phase: "BusinessToCustomer",
      sentPackage: {
        create: {
          ...createPartialPackageCreateInput(seasonsToCustomerTransaction),
          weight: shipmentWeight,
          items: {
            // need to include the type on the function passed into map
            // or we get build errors comlaining about the type here
            connect: physicalProductsBeingReserved.map(prod => {
              return { id: prod.id }
            }),
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
      } as any,
      returnPackages: {
        create: {
          ...createPartialPackageCreateInput(customerToSeasonsTransaction),
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
        } as any,
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
      ...(!!shippingOptionId
        ? {
            shippingOption: {
              connect: {
                id: shippingOptionId,
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
