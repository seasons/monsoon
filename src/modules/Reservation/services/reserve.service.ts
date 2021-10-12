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
  BagItem,
  Customer,
  Location,
  Package,
  PaymentPlan,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  ProductVariant,
  RentalInvoice,
  Reservation,
  ReservationFeedback,
  ReservationPhysicalProduct,
  ReservationStatus,
  ShippingCode,
  ShippingMethod,
  ShippingOption,
  WarehouseLocation,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import chargebee from "chargebee"
import cuid from "cuid"
import { intersection, merge } from "lodash"
import { DateTime } from "luxon"

import { ReservationUtilsService } from "./reservation.utils.service"

type ReserveItemsPhysicalProduct = Pick<
  PhysicalProduct,
  "seasonsUID" | "id"
> & {
  warehouseLocation: Pick<WarehouseLocation, "id">
}

@Injectable()
export class ReserveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly error: ErrorService,
    private readonly utils: UtilsService,
    private readonly productUtils: ProductUtilsService
  ) {}

  async reserveItems(
    shippingCode: ShippingCode,
    customer: Pick<Customer, "id">,
    select: Prisma.ReservationSelect = { id: true }
  ) {
    const promises = []
    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        status: true,
        detail: {
          select: {
            shippingAddress: {
              select: {
                id: true,
                address1: true,
                address2: true,
                city: true,
                state: true,
                zipCode: true,
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
        membership: {
          select: {
            plan: { select: { itemCount: true } },
            rentalInvoices: {
              select: { id: true, status: true },
            },
          },
        },
        user: {
          select: { id: true, email: true, firstName: true },
        },
      },
    })
    const activeBagItemsWithData = await this.prisma.client.bagItem.findMany({
      where: {
        customer: { id: customer.id },
        status: { in: ["Reserved", "Added"] },
        saved: false,
      },
      select: {
        id: true,
        status: true,
        productVariant: {
          select: {
            id: true,
            physicalProducts: { select: { seasonsUID: true } },
          },
        },
        physicalProduct: {
          select: {
            id: true,
            seasonsUID: true,
            warehouseLocation: { select: { id: true } },
          },
        },
      },
    })
    const lastReservationWithData = await this.prisma.client.reservation.findFirst(
      {
        where: {
          customer: {
            id: customer.id,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          sentPackage: { select: { transactionID: true } },
          returnPackages: {
            select: { id: true, events: { select: { id: true } } },
          },
        },
      }
    )

    const productVariantIDs = activeBagItemsWithData.map(
      a => a.productVariant.id
    )

    // Need to run valdiate before getting active rental invoice
    await this.validateReserveState(customerWithData, productVariantIDs)
    const activeRentalInvoice = customerWithData.membership.rentalInvoices.find(
      a => a.status === "Draft"
    )

    const newProductVariantIDs = activeBagItemsWithData
      .filter(a => a.status === "Added")
      .map(a => a.productVariant.id)
    const heldPhysicalProducts = activeBagItemsWithData
      .filter(a => a.status === "Reserved")
      .map(b => b.physicalProduct)

    const [
      productVariantsCountsUpdatePromises,
      physicalProductsBeingReserved,
      _,
    ] = await this.productVariantService.updateProductVariantCounts(
      newProductVariantIDs,
      customer.id
    )
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
      newProductVariantIDs,
      customer,
      shippingCode
    )

    // Update bag items
    const bagItemPromises = await this.updateBagItemsForReservation(
      activeBagItemsWithData,
      physicalProductsBeingReserved
    )
    promises.push(...bagItemPromises)

    const lastReservationPromises = await this.updateLastReservation(
      lastReservationWithData
    )
    promises.push(...lastReservationPromises)

    // Create reservation records in prisma
    const shipmentWeight = await this.shippingService.calcShipmentWeightFromProductVariantIDs(
      newProductVariantIDs
    )
    const {
      promises: reservationCreatePromises,
      datas: { reservationId, reservationPhysicalProductIds },
    } = await this.createReservation({
      seasonsToCustomerTransaction,
      customerToSeasonsTransaction,
      lastReservation: lastReservationWithData,
      customer: customerWithData,
      shipmentWeight,
      physicalProductsBeingReserved,
      heldPhysicalProducts,
      shippingCode,
    })

    promises.push(...reservationCreatePromises)

    promises.push(
      this.prisma.client.rentalInvoice.update({
        where: { id: activeRentalInvoice.id },
        data: {
          reservations: { connect: { id: reservationId } },
          reservationPhysicalProducts: {
            connect: reservationPhysicalProductIds.map(id => ({ id })),
          },
        },
      })
    )

    await this.prisma.client.$transaction(promises.flat())

    const reservation = (await this.prisma.client.reservation.findUnique({
      where: { id: reservationId },
      select: merge(select, {
        id: true,
        reservationNumber: true,
        products: { select: { seasonsUID: true } },
      }),
    })) as any

    // Send confirmation email
    await this.emails.sendReservationConfirmationEmail(
      customerWithData.user,
      newProductVariantIDs,
      reservation,
      seasonsToCustomerTransaction.tracking_number,
      seasonsToCustomerTransaction.tracking_url_provider
    )

    try {
      await this.productUtils.removeRestockNotifications(
        productVariantIDs,
        customer.id
      )
    } catch (err) {
      this.error.setUserContext(customerWithData.user)
      this.error.setExtraContext({ productVariantIDs })
      this.error.captureError(err)
    }

    return reservation
  }

  private async validateReserveState(
    customerWithData: Pick<Customer, "status"> & {
      detail: {
        shippingAddress: Pick<
          Location,
          "state" | "address1" | "address2" | "city" | "zipCode"
        >
      }
    } & {
      membership: {
        plan: Pick<PaymentPlan, "itemCount">
        rentalInvoices: Pick<RentalInvoice, "id" | "status">[]
      }
    },
    productVariantIDs
  ) {
    if (customerWithData.status !== "Active") {
      throw new Error(`Only Active customers can place a reservation`)
    }

    // Validate address and provide suggested one if needed
    const shippingAddress = customerWithData.detail.shippingAddress
    const {
      isValid: shippingAddressIsValid,
    } = await this.shippingService.shippoValidateAddress({
      street1: shippingAddress.address1,
      street2: shippingAddress.address2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zipCode,
    })
    if (!shippingAddressIsValid) {
      throw new Error("Shipping address is invalid")
    }

    // Rental Invoice check
    const numDraftRentalInvoices = customerWithData.membership.rentalInvoices.filter(
      a => a.status === "Draft"
    ).length
    if (numDraftRentalInvoices !== 1) {
      const errorMessageSuffix =
        numDraftRentalInvoices === 0
          ? "no draft rental invoices"
          : "more than 1 draft rental invoice"
      throw new ApolloError(
        `Invalid State. Customer has ${errorMessageSuffix}`,
        "400"
      )
    }

    // Count check
    // TODO: Should we pass in the items instead?
    const customerPlanItemCount = customerWithData.membership.plan.itemCount
    if (!!customerPlanItemCount && productVariantIDs > customerPlanItemCount) {
      throw new ApolloError(
        `Your reservation cannot contain more than ${customerPlanItemCount} items`,
        "515"
      )
    }
  }

  private async updateBagItemsForReservation(
    activeBagItemsWithData: Array<
      Pick<BagItem, "status" | "id"> & {
        productVariant: {
          physicalProducts: Array<Pick<PhysicalProduct, "seasonsUID">>
        }
      }
    >,
    physicalProductsBeingReserved
  ) {
    const promises = []
    const bagItemsToUpdate = activeBagItemsWithData.filter(
      a => a.status === "Added"
    )

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

  private async updateLastReservation(
    lastReservation: Pick<Reservation, "status" | "id"> & {
      sentPackage: Pick<Package, "transactionID">
    }
  ) {
    const promises = []

    if (!lastReservation) {
      return promises
    }

    switch (lastReservation.status) {
      case "Queued":
      case "Picked":
      case "Packed":
        promises.push(
          this.prisma.client.reservation.update({
            where: {
              id: lastReservation.id,
            },
            data: {
              status: "Completed",
            },
          })
        )
        break
      case "Shipped":
      case "Delivered":
        promises.push(
          this.prisma.client.reservation.update({
            where: {
              id: lastReservation.id,
            },
            data: {
              status: "ReturnPending",
            },
          })
        )
        break
      default:
      // noop
    }

    try {
      if (["Queued", "Picked", "Packed"].includes(lastReservation.status)) {
        await this.shippingService.voidLabel(lastReservation.sentPackage)
      }
    } catch (err) {
      this.error.captureError(err)
    }

    return promises
  }

  private async createReservation({
    customer,
    physicalProductsBeingReserved,
    heldPhysicalProducts,
    lastReservation,
    shippingCode,
    seasonsToCustomerTransaction,
    customerToSeasonsTransaction,
    shipmentWeight,
  }: {
    seasonsToCustomerTransaction
    customerToSeasonsTransaction
    lastReservation: Pick<Reservation, "status"> & {
      returnPackages: Array<
        Pick<Package, "id"> & { events: Array<{ id: string }> }
      >
    }
    customer: Pick<Customer, "id"> & {
      detail: {
        shippingAddress: Pick<Location, "id"> & {
          shippingOptions: Array<
            Pick<ShippingOption, "id"> & {
              shippingMethod: Pick<ShippingMethod, "code">
            }
          >
        }
      }
    }
    shipmentWeight: number
    physicalProductsBeingReserved: ReserveItemsPhysicalProduct[]
    heldPhysicalProducts: ReserveItemsPhysicalProduct[]
    shippingCode: ShippingCode | null
  }): Promise<{
    promises: PrismaPromise<Reservation | ReservationPhysicalProduct[]>[]
    datas: { reservationId: string; reservationPhysicalProductIds: string[] }
  }> {
    const promises = []

    const allPhysicalProductsInReservation = [
      ...physicalProductsBeingReserved,
      ...heldPhysicalProducts,
    ]

    const newPhysicalProductSUIDs = allPhysicalProductsInReservation
      .filter(a => !!a.warehouseLocation?.id)
      .map(a => a.seasonsUID)

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
      const shippingOption = customer.detail.shippingAddress.shippingOptions.find(
        a => a.shippingMethod.code === shippingCode
      )
      if (!shippingOption) {
        throw `Shipping option ${shippingCode} not found for customer`
      }
      shippingOptionId = shippingOption.id
    }

    const customerShippingAddressRecordID = customer.detail.shippingAddress.id
    const uniqueReservationNumber = await this.utils.getUniqueReservationNumber()

    const reservationId = cuid()
    const outboundPackageId = cuid()
    const reservationPhysicalProductCreateDatas = allPhysicalProductsInReservation.map(
      physicalProduct =>
        Prisma.validator<
          Prisma.ReservationPhysicalProductUncheckedCreateWithoutReservationInput
        >()({
          id: cuid(),
          outboundPackageId,
          physicalProductId: physicalProduct.id,
          isNew: newPhysicalProductSUIDs.includes(physicalProduct.seasonsUID), // TODO: Should always be true, since reservations are now atomic
        })
    )

    const reservationCreateData = Prisma.validator<
      Prisma.ReservationCreateInput
    >()({
      id: reservationId,
      reservationPhysicalProducts: {
        create: reservationPhysicalProductCreateDatas,
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
      phase: "BusinessToCustomer",
      sentPackage: {
        create: {
          id: outboundPackageId,
          ...createPartialPackageCreateInput(seasonsToCustomerTransaction),
          weight: shipmentWeight,
          // TODO: Connect here
          // reservationPhysicalProductsOnOutboundPackage: {
          //   connect: reservationPhysicalProductCreateDatas
          //     .filter(a => a.isNew)
          //     .map(a => ({ id: a.id })),
          // },
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
      previousReservationWasPacked: lastReservation?.status === "Packed",
    })

    promises.push(
      this.prisma.client.reservation.create({ data: reservationCreateData })
    )

    return {
      promises,
      datas: {
        reservationId: reservationCreateData.id,
        reservationPhysicalProductIds: reservationPhysicalProductCreateDatas.map(
          a => a.id
        ),
      },
    }
  }
}
