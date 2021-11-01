import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
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
  RentalInvoice,
  Reservation,
  ReservationPhysicalProduct,
  ShippingCode,
  WarehouseLocation,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import cuid from "cuid"
import { merge } from "lodash"

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
            physicalProducts: { select: { id: true } },
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

    // Create reservation records in prisma
    const {
      promises: reservationCreatePromises,
      datas: { reservationId, reservationPhysicalProductCreateDatas },
    } = await this.createReservation({
      lastReservation: lastReservationWithData,
      customer: customerWithData,
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
            connect: reservationPhysicalProductCreateDatas.map(a => ({
              id: a.id,
            })),
          },
        },
      })
    )

    // Update bag items
    const bagItemPromises = await this.updateBagItemsForReservation(
      activeBagItemsWithData,
      reservationPhysicalProductCreateDatas
    )
    promises.push(...bagItemPromises)

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
    // await this.emails.sendReservationConfirmationEmail({
    //   customerWithData.user,
    //   newProductVariantIDs,
    //   reservation,
    //   seasonsToCustomerTransaction.tracking_number,
    //   seasonsToCustomerTransaction.tracking_url_provider
    // })

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
          physicalProducts: Array<Pick<PhysicalProduct, "id">>
        }
      }
    >,
    reservationPhysicalProductCreateDatas: {
      id: string
      physicalProductId: string
    }[]
  ) {
    const promises = []
    const bagItemsToUpdate = activeBagItemsWithData.filter(
      a => a.status === "Added"
    )

    for (const bagItem of bagItemsToUpdate) {
      const physicalProductIds = bagItem.productVariant.physicalProducts.map(
        a => a.id
      )
      const reservationPhysicalProductToConnect = reservationPhysicalProductCreateDatas.find(
        a => physicalProductIds.includes(a.physicalProductId)
      )

      promises.push(
        this.prisma.client.bagItem.update({
          where: { id: bagItem.id },
          data: {
            physicalProduct: {
              connect: {
                id: reservationPhysicalProductToConnect.physicalProductId,
              },
            },
            reservationPhysicalProduct: {
              connect: { id: reservationPhysicalProductToConnect.id },
            },
            status: "Reserved",
          },
        })
      )
    }

    return promises
  }

  // TODO: EIther deprcate or update for new logic
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
  }: {
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
    physicalProductsBeingReserved: ReserveItemsPhysicalProduct[]
    heldPhysicalProducts: ReserveItemsPhysicalProduct[]
    shippingCode: ShippingCode | null
  }): Promise<{
    promises: PrismaPromise<Reservation | ReservationPhysicalProduct[]>[]
    datas: {
      reservationId: string
      reservationPhysicalProductCreateDatas: {
        id: string
        physicalProductId: string
      }[]
    }
  }> {
    const promises = []

    const allPhysicalProductsInReservation = [
      ...physicalProductsBeingReserved,
      ...heldPhysicalProducts,
    ]

    const returnPackagesToCarryOver =
      lastReservation?.returnPackages?.filter(a => a.events.length === 0) || []

    const uniqueReservationNumber = await this.utils.getUniqueReservationNumber()

    const reservationId = cuid()
    const reservationPhysicalProductCreateDatas = allPhysicalProductsInReservation.map(
      physicalProduct =>
        Prisma.validator<
          Prisma.ReservationPhysicalProductUncheckedCreateWithoutReservationInput
        >()({
          id: cuid(),
          physicalProductId: physicalProduct.id,
          isNew: true,
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
      returnPackages: {
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
      // TODO: Update this for new world
      previousReservationWasPacked: lastReservation?.status === "Packed",
    })

    promises.push(
      this.prisma.client.reservation.create({ data: reservationCreateData })
    )

    return {
      promises,
      datas: {
        reservationId: reservationCreateData.id,
        reservationPhysicalProductCreateDatas,
      },
    }
  }
}
