import { ApplicationType } from "@app/decorators/application.decorator"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { ReservationUtilsService } from "@app/modules/Utils/services/reservation.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { BagItem, InventoryStatus, Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import cuid from "cuid"
import { camelCase, merge } from "lodash"

import { ProductVariantService } from "../services/productVariant.service"

enum BagSectionStatus {
  Added = "Added",
  AtHome = "AtHome",
  Queued = "Queued",
  Picked = "Picked",
  Packed = "Packed",
  ScannedOnInbound = "ScannedOnInbound",
  InTransitInbound = "InTransitInbound",
  ScannedOnOutbound = "ScannedOnOutbound",
  InTransitOutbound = "InTransitOutbound",
  DeliveredToCustomer = "DeliveredToCustomer",
  DeliveredToBusiness = "DeliveredToBusiness",
  ReturnProcessed = "ReturnProcessed",
  ReturnPending = "ReturnPending",
  ResetEarly = "ResetEarly",
  Lost = "Lost",

  // Added sections: These combine multiple other statuses
  Inbound = "Inbound",
  Outbound = "Outbound",
  Processing = "Processing",
}

@Injectable()
export class BagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService,
    private readonly productUtils: ProductUtilsService,
    private readonly reservationUtils: ReservationUtilsService
  ) {}

  async bagSection({
    application,
    customer,
    status,
  }: {
    customer: { id: string }
    status: BagSectionStatus
    application: ApplicationType
  }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        isInCart: true,
        physicalProduct: {
          select: {
            id: true,
          },
        },
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    return this.getSection({
      status,
      bagItems,
      application: application === "spring" ? "admin" : "client",
    })
  }

  async upsertCartItem({
    customerId,
    select,
    productVariantId,
    addToCart,
  }: {
    productVariantId: string
    customerId: string
    addToCart: boolean
    select
  }) {
    const existingBagItem = await this.prisma.client.bagItem.findFirst({
      where: {
        customer: {
          id: customerId,
        },
        productVariant: {
          id: productVariantId,
        },
      },
      select: merge(
        {
          saved: true,
          isInCart: true,
        },
        select
      ),
    })

    // 1. If we're switching a saved item or bag item to cart
    if (existingBagItem && addToCart && !existingBagItem.isInCart) {
      return await this.prisma.client.bagItem.update({
        where: { id: existingBagItem.id },
        data: {
          isInCart: true,
          saved: false,
        },
      })

      // 2. If we're deleting a cart item from cart
    } else if (existingBagItem && !addToCart && existingBagItem.isInCart) {
      await this.prisma.client.bagItem.delete({
        where: { id: existingBagItem.id },
      })

      // 3. If we're making a cart item for the first time
    } else if (!existingBagItem && addToCart) {
      return await this.prisma.client.bagItem.create({
        data: {
          customer: {
            connect: {
              id: customerId,
            },
          },
          productVariant: {
            connect: {
              id: productVariantId,
            },
          },
          position: 0,
          isInCart: addToCart,
          saved: false,
          status: "Added",
        },
        select,
      })
    }

    return null
  }

  async bagSections({
    application,
    customer,
  }: {
    customer: { id: string }
    application: ApplicationType
  }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        isInCart: true,
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
          },
        },
        physicalProduct: {
          select: {
            id: true,
          },
        },
      },
    })

    let sections: BagSectionStatus[] = []

    if (application === "spring") {
      sections = [
        BagSectionStatus.Added,
        BagSectionStatus.Queued,
        BagSectionStatus.Picked,
        BagSectionStatus.Packed,
        BagSectionStatus.Outbound,
        BagSectionStatus.DeliveredToCustomer,
        BagSectionStatus.ReturnPending,
        BagSectionStatus.Inbound,
        BagSectionStatus.DeliveredToBusiness,
        BagSectionStatus.Lost,
      ]
    } else {
      sections = [
        BagSectionStatus.Added,
        BagSectionStatus.ReturnPending,

        // Outbound
        BagSectionStatus.Processing,
        BagSectionStatus.InTransitOutbound,
        BagSectionStatus.DeliveredToCustomer,

        // Inbound
        BagSectionStatus.ScannedOnInbound,
        BagSectionStatus.InTransitInbound,
        BagSectionStatus.DeliveredToBusiness,

        BagSectionStatus.AtHome,
      ]
    }

    return sections.map(status =>
      this.getSection({
        status,
        bagItems,
        application: application === "spring" ? "admin" : "client",
      })
    )
  }

  async addToBag(
    itemId,
    customer,
    select: Prisma.BagItemSelect = { id: true }
  ): Promise<Partial<BagItem>> {
    const custWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        membership: { select: { plan: { select: { itemCount: true } } } },
        bagItems: {
          select: {
            id: true,
            productVariant: { select: { id: true } },
            saved: true,
            isInCart: true,
          },
        },
      },
    })

    const bag = custWithData.bagItems?.filter(
      a => a.saved === false && !a.isInCart
    )
    const customerPlanItemCount = custWithData.membership?.plan?.itemCount || 6

    const productVariant = await this.prisma.client.productVariant.findUnique({
      where: {
        id: itemId,
      },
      select: {
        product: {
          select: {
            status: true,
          },
        },
      },
    })

    if (productVariant.product.status === "Upcoming") {
      throw new Error("Upcoming products can not be added to bag")
    }

    if (bag.some(i => i.productVariant?.id === itemId)) {
      throw new ApolloError("Item already in bag", "515")
    }

    if (bag.length >= customerPlanItemCount) {
      throw new ApolloError("Bag is full", "514")
    }

    // Existing bag item from saved or cart
    const existingBagItem = custWithData.bagItems.find(
      a => a.productVariant.id === itemId && (a.isInCart || a.saved)
    )

    const result = await this.prisma.client.bagItem.upsert({
      where: { id: existingBagItem?.id || "" },
      create: {
        customer: {
          connect: {
            id: customer.id,
          },
        },
        productVariant: {
          connect: {
            id: itemId,
          },
        },
        position: 0,
        saved: false,
        isInCart: false,
        status: "Added",
      },
      update: { saved: false, isInCart: false },
      select,
    })
    return result
  }

  // Mutation for admins to swap a bagItem
  async swapBagItem(
    oldBagItemID,
    seasonsUID: string,
    select: Prisma.BagItemSelect
  ) {
    const oldBagItem = await this.prisma.client.bagItem.findUnique({
      where: {
        id: oldBagItemID,
      },
      select: {
        status: true,
        physicalProduct: {
          select: {
            id: true,
            warehouseLocation: true,
            inventoryStatus: true,
          },
        },
        productVariant: {
          select: {
            id: true,
            reservable: true,
            reserved: true,
            total: true,
            nonReservable: true,
            offloaded: true,
            stored: true,
          },
        },
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
            reservationId: true,
          },
        },
        customer: {
          select: {
            id: true,
            membership: {
              select: {
                plan: {
                  select: {
                    tier: true,
                  },
                },
              },
            },
            bagItems: {
              select: {
                id: true,
                productVariant: { select: { id: true } },
                physicalProductId: true,
                status: true,
              },
            },
          },
        },
      },
    })
    const customerID = oldBagItem.customer.id
    const activeRentalInvoice = await this.prisma.client.rentalInvoice.findFirst(
      {
        where: {
          membership: { customer: { id: customerID } },
          status: "Draft",
        },
        orderBy: { createdAt: "desc" },
      }
    )
    const oldReservationPhysicalProduct = oldBagItem.reservationPhysicalProduct

    let newPhysicalProduct = await this.prisma.client.physicalProduct.findUnique(
      {
        where: { seasonsUID: seasonsUID },
        select: {
          id: true,
          productVariant: {
            select: {
              id: true,
            },
          },
          inventoryStatus: true,
        },
      }
    )
    const promises = []

    const newItemAlreadyInBag = oldBagItem.customer.bagItems
      .map(a => a.productVariant.id)
      .includes(newPhysicalProduct.productVariant.id)
    const itemInBag = oldBagItem.customer.bagItems.find(
      a => a.productVariant.id === newPhysicalProduct.productVariant.id
    )

    const productVariant = oldBagItem.productVariant
    const lastReservation = (await this.utils.getLatestReservation(
      customerID
    )) as any

    if (!["Queued", "Picked"].includes(oldReservationPhysicalProduct.status)) {
      throw Error("Only bag items with status Picked, or Queued can be swapped")
    }

    if (oldBagItem.status !== "Reserved") {
      throw Error("Only Reserved bag items can be swapped")
    }

    if (newItemAlreadyInBag && itemInBag?.status === "Reserved") {
      throw Error("This item is in the customer's bag and has been reserved")
    }

    const oldPhysicalProduct = oldBagItem.physicalProduct

    const oldPhysicalProductNewInventoryStatus = !!oldPhysicalProduct.warehouseLocation
      ? "Reservable"
      : "NonReservable"

    const oldProductVariantData = this.productVariantService.getCountsForStatusChange(
      {
        productVariant,
        oldInventoryStatus: oldPhysicalProduct.inventoryStatus as InventoryStatus,
        newInventoryStatus: oldPhysicalProductNewInventoryStatus,
      }
    )

    promises.push(
      this.prisma.client.physicalProduct.update({
        where: { id: oldPhysicalProduct.id },
        data: {
          inventoryStatus: oldPhysicalProductNewInventoryStatus,
          productVariant: {
            update: {
              ...oldProductVariantData,
            },
          },
        },
      })
    )

    promises.push(
      this.prisma.client.bagItem.delete({ where: { id: oldBagItemID } })
    )

    promises.push(
      this.prisma.client.reservationPhysicalProduct.delete({
        where: {
          id: oldBagItem.reservationPhysicalProduct.id,
        },
      })
    )

    const newProductVariantID = newPhysicalProduct.productVariant.id
    const [
      productVariantsCountsUpdatePromises,
    ] = await this.productVariantService.updateProductVariantCounts(
      [newProductVariantID],
      customerID
    )
    promises.push(productVariantsCountsUpdatePromises)

    const newPhysicalProductID = newPhysicalProduct.id
    const newPhysicalProductIDConnect = {
      connect: { id: newPhysicalProductID },
    }
    const newReservationPhysProdId = cuid()
    promises.push(
      this.prisma.client.reservationPhysicalProduct.create({
        data: {
          id: newReservationPhysProdId,
          isNew: true,
          physicalProduct: {
            connect: {
              id: newPhysicalProductID,
            },
          },
          customer: {
            connect: {
              id: customerID,
            },
          },
          reservation: {
            connect: {
              id: lastReservation.id,
            },
          },
        },
        select: {
          id: true,
        },
      })
    )

    promises.push(
      this.prisma.client.physicalProduct.update({
        where: { id: newPhysicalProductID },
        data: { inventoryStatus: "Reserved" },
      })
    )

    promises.push(
      this.prisma.client.rentalInvoice.update({
        where: { id: activeRentalInvoice.id },
        data: {
          reservationPhysicalProducts: {
            connect: {
              id: newReservationPhysProdId,
            },
          },
        },
      })
    )

    promises.push(
      this.prisma.client.bagItem.upsert({
        where: { id: itemInBag?.id || "" },
        create: {
          customer: {
            connect: { id: customerID },
          },
          productVariant: {
            connect: { id: newProductVariantID },
          },
          reservationPhysicalProduct: {
            connect: {
              id: newReservationPhysProdId,
            },
          },
          physicalProduct: newPhysicalProductIDConnect,
          status: "Reserved",
          saved: false,
        },
        update: {
          physicalProduct: newPhysicalProductIDConnect,
          status: "Reserved",
          saved: false,
          reservationPhysicalProduct: {
            connect: {
              id: newReservationPhysProdId,
            },
          },
        },
        select,
      })
    )

    const results = await this.prisma.client.$transaction(promises.flat())
    const addedBagItem = results.pop()

    try {
      await this.productUtils.removeRestockNotifications(
        [newProductVariantID],
        customerID
      )
    } catch (e) {
      // noop
    }

    return addedBagItem
  }

  private getLostPhase(lostResPhysProd) {
    const lostOutboundResPhysProds = [
      "ScannedOnOutbound",
      "InTransitOutbound",
      "DeliveredToCustomer",
    ].includes(lostResPhysProd.status)

    const lostInboundItemsResPhysProds = [
      "AtHome",
      "ScannedOnInbound",
      "InTransitInbound",
      "DeliveredToBusiness",
      "ReturnPending",
    ].includes(lostResPhysProd.status)

    if (lostOutboundResPhysProds) {
      return "BusinessToCustomer"
    } else if (lostInboundItemsResPhysProds) {
      return "CustomerToBusiness"
    } else {
      throw new Error(
        "Lost phase is undefined, status does not match an inbound or outbound phase"
      )
    }
  }

  private updatePhysicalProductsOnLost(physicalProduct) {
    const physicalProductPromises = []
    const productVariantData = this.productVariantService.getCountsForStatusChange(
      {
        productVariant: physicalProduct.productVariant,
        oldInventoryStatus: "Reserved",
        newInventoryStatus: "NonReservable",
      }
    )

    physicalProductPromises.push(
      this.prisma.client.physicalProduct.update({
        where: {
          id: physicalProduct.id,
        },
        data: {
          productStatus: "Lost",
          inventoryStatus: "NonReservable",
          productVariant: {
            update: {
              ...productVariantData,
            },
          },
        },
      })
    )
    return physicalProductPromises
  }

  private async updateReservationOnLost(lostResPhysProd) {
    const currentReservation = await this.prisma.client.reservation.findUnique({
      where: {
        id: lostResPhysProd.reservationId,
      },
      select: {
        id: true,
        reservationPhysicalProducts: {
          select: {
            status: true,
          },
        },
      },
    })

    return await this.reservationUtils.updateReservationOnChange(
      [currentReservation.id],
      { [lostResPhysProd.id]: "Lost" }
    )
  }

  async markAsFound(
    lostBagItemId,
    status: "DeliveredToCustomer" | "DeliveredToBusiness"
  ) {}

  async markAsLost(lostBagItemId) {
    const bagItemWithData = await this.prisma.client.bagItem.findUnique({
      where: {
        id: lostBagItemId,
      },
      select: {
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
            reservationId: true,
          },
        },
        physicalProduct: {
          select: {
            id: true,
            productVariant: {
              select: {
                id: true,
                reserved: true,
                reservable: true,
                nonReservable: true,
              },
            },
          },
        },
      },
    })

    const physicalProduct = bagItemWithData.physicalProduct
    const lostResPhysProd = bagItemWithData.reservationPhysicalProduct

    const promises = []

    const lostInPhase = this.getLostPhase(lostResPhysProd)

    promises.push(...this.updatePhysicalProductsOnLost(physicalProduct))

    promises.push(
      this.prisma.client.reservationPhysicalProduct.update({
        where: {
          id: lostResPhysProd.id,
        },
        data: {
          status: "Lost",
          lostInPhase,
          lostAt: new Date().toISOString(),
          hasBeenLost: true,
        },
      })
    )

    promises.push(
      this.prisma.client.bagItem.delete({
        where: {
          id: lostBagItemId,
        },
      })
    )

    const updateReservationPromise = await this.updateReservationOnLost(
      lostResPhysProd
    )
    promises.push(...updateReservationPromise)

    await this.prisma.client.$transaction(promises)

    return true
  }

  async removeFromBag(item, saved, customer): Promise<BagItem> {
    // TODO: removeFromBag has been deprecated, use deleteBagItem
    const bagItem = await this.getBagItem(item, saved, customer, { id: true })

    if (!bagItem) {
      throw new ApolloError("Item can not be found", "514")
    }

    // has to return a promise because we roll it up in a transaction in at
    // least one parent function
    return await this.prisma.client.bagItem.delete({
      where: { id: bagItem.id },
    })
  }

  async getBagItem(
    item,
    saved,
    customer,
    select: Prisma.BagItemSelect = undefined // selects all scalars
  ): Promise<Partial<BagItem>> {
    const bagItem = await this.prisma.client.bagItem.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved,
      },
      select,
    })

    return bagItem
  }

  private getTrackingUrl(bagItems, direction: "inbound" | "outbound") {
    if (direction === "inbound") {
      return (
        bagItems?.find(
          b =>
            b.reservationPhysicalProduct?.inboundPackage?.shippingLabel
              ?.trackingURL
        ) ?? null
      )
    } else {
      return (
        bagItems?.find(
          b =>
            b.reservationPhysicalProduct?.outboundPackage?.shippingLabel
              ?.trackingURL
        ) ?? null
      )
    }
  }

  private async getSection({
    bagItems,
    status,
    application,
  }: {
    status: BagSectionStatus
    bagItems
    application: "client" | "admin"
  }) {
    const isAdmin = application === "admin"

    let filteredBagItems = bagItems.filter(
      item => item.reservationPhysicalProduct?.status === status
    )
    let title: string = status
    let deliveryStep
    let deliveryStatusText
    let deliveryTrackingUrl

    switch (status) {
      case "Outbound":
        filteredBagItems = bagItems.filter(item => {
          const itemStatus = item.reservationPhysicalProduct?.status
          return (
            itemStatus === "ScannedOnOutbound" ||
            itemStatus === "InTransitOutbound"
          )
        })
        title = "Shipped"
        break
      case "Inbound":
        filteredBagItems = bagItems.filter(item => {
          const itemStatus = item.reservationPhysicalProduct?.status
          return (
            itemStatus === "ScannedOnInbound" ||
            itemStatus === "InTransitInbound"
          )
        })
        title = "On the way back"
        break
      case "ReturnPending":
        title = "Returning"
        break
      case "Added":
        filteredBagItems = bagItems.filter(
          item => item.status === "Added" && !item.isInCart
        )
        title = "Rent"
        break
      case "AtHome":
        title = "At home"
        break
      case "ScannedOnInbound":
        // 1. Inbound step 1
        title = "On the way back"
        deliveryStep = 1
        deliveryStatusText = "Received by UPS"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "inbound")
        break
      case "InTransitInbound":
        // 2. Inbound step 2
        title = "On the way back"
        deliveryStep = 2
        deliveryStatusText = "Shipped"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "inbound")
        break
      case "DeliveredToBusiness":
        // 3. Inbound step 3
        title = "Order returned"
        deliveryStep = 3
        deliveryStatusText = "Shipped"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "inbound")
        break
      case "Processing":
        // 1. Outbound step 1
        filteredBagItems = bagItems.filter(item => {
          const itemStatus = item.reservationPhysicalProduct?.status

          return (
            itemStatus === "Queued" ||
            itemStatus === "Picked" ||
            itemStatus === "Packed"
          )
        })
        title = "Order received"
        deliveryStep = 1
        deliveryStatusText = "Received"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "outbound")
        break
      case "InTransitOutbound":
        // 2. Outbound step 2
        title = "Order on the way"
        deliveryStep = 2
        deliveryStatusText = "Shipped"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "outbound")
        break
      case "DeliveredToCustomer":
        // 3. Outbound step 3
        if (isAdmin) {
          filteredBagItems = bagItems.filter(item => {
            const itemStatus = item.reservationPhysicalProduct?.status

            return (
              itemStatus === "DeliveredToCustomer" || itemStatus === "AtHome"
            )
          })
        }
        title = isAdmin ? "At home" : "Order delivered"
        deliveryStep = 3
        deliveryStatusText = "Shipped"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "outbound")
        break
    }

    return {
      id: camelCase(status),
      title,
      status,
      bagItems: filteredBagItems,
      deliveryStep,
      deliveryStatusText,
      deliveryTrackingUrl,
    }
  }
}
