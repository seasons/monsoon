import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  InventoryStatus,
  Prisma,
  ReservationPhysicalProductStatus,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { camelCase } from "lodash"
import { DateTime } from "luxon"

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
  Hold = "Hold",
  Lost = "Lost",

  // Added sections: These combine multiple other statuses
  Inbound = "Inbound",
  Outbound = "Outbound",
}

@Injectable()
export class BagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService,
    private readonly productUtils: ProductUtilsService
  ) {}

  async bagSection(status: BagSectionStatus, customer, application) {
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
        physicalProduct: {
          select: {
            id: true,
          },
        },
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
            hasCustomerReturnIntent: true,
          },
        },
      },
    })

    return this.getSection(
      status,
      bagItems,
      application === "spring" ? "admin" : "client"
    )
  }

  async bagSections(customer, application) {
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
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
            outboundPackage: {
              select: {
                shippingLabel: {
                  select: {
                    trackingURL: true,
                  },
                },
              },
            },
            inboundPackage: {
              select: {
                shippingLabel: {
                  select: {
                    trackingURL: true,
                  },
                },
              },
            },
          },
        },
        physicalProduct: {
          select: {
            id: true,
          },
        },
      },
    })

    if (application === "spring") {
      const sections = [
        BagSectionStatus.Queued,
        BagSectionStatus.Picked,
        BagSectionStatus.Packed,
        BagSectionStatus.Outbound,
        BagSectionStatus.DeliveredToCustomer,
        BagSectionStatus.ReturnPending,
        BagSectionStatus.Inbound,
      ]

      return sections.map(status => {
        return this.getSection(status, bagItems, "admin")
      })
    } else {
      const sections: BagSectionStatus[] = [
        BagSectionStatus.Added,
        BagSectionStatus.ReturnPending,

        // Outbound
        BagSectionStatus.Packed,
        BagSectionStatus.InTransitOutbound,
        BagSectionStatus.DeliveredToCustomer,

        // Inbound
        BagSectionStatus.ScannedOnInbound,
        BagSectionStatus.InTransitInbound,
        BagSectionStatus.DeliveredToBusiness,

        BagSectionStatus.AtHome,
      ]

      return sections.map(status => {
        return this.getSection(status, bagItems, "client")
      })
    }
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
          },
        },
      },
    })

    const bag = custWithData.bagItems?.filter(a => a.saved === false)
    const savedItems = custWithData.bagItems?.filter(a => a.saved === true)
    const customerPlanItemCount = custWithData.membership?.plan?.itemCount || 6

    if (bag.some(i => i.productVariant?.id === itemId)) {
      throw new ApolloError("Item already in bag", "515")
    }

    if (bag.length >= customerPlanItemCount) {
      throw new ApolloError("Bag is full", "514")
    }

    const existingSavedItemForVariant = savedItems.find(
      a => a.productVariant.id === itemId
    )
    const result = await this.prisma.client.bagItem.upsert({
      where: { id: existingSavedItemForVariant?.id || "" },
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
        status: "Added",
      },
      update: { saved: false },
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

    if (!["Queued", "Hold"].includes(lastReservation.status)) {
      throw Error(
        "Only reservations with status Hold or Queued can have a bag item swapped"
      )
    }

    if (oldBagItem.status !== "Reserved") {
      throw Error("Only Reserved bag items can be swapped")
    }

    if (newItemAlreadyInBag && itemInBag?.status === "Reserved") {
      throw Error("This item is in the customer's bag and has been reserved")
    }

    const oldPhysicalProduct = oldBagItem.physicalProduct

    promises.push(
      this.prisma.client.reservation.update({
        where: {
          id: lastReservation.id,
        },
        data: {
          products: {
            disconnect: {
              id: oldPhysicalProduct.id,
            },
          },
          newProducts: {
            disconnect: {
              id: oldPhysicalProduct.id,
            },
          },
          sentPackage: {
            update: {
              items: {
                disconnect: {
                  id: oldPhysicalProduct.id,
                },
              },
            },
          },
        },
      })
    )
    promises.push(
      this.prisma.client.rentalInvoice.update({
        where: { id: activeRentalInvoice.id },
        data: {
          products: {
            disconnect: { id: oldPhysicalProduct.id },
            connect: { id: newPhysicalProduct.id },
          },
        },
      })
    )

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
    const newProductVariantID = newPhysicalProduct.productVariant.id
    const [
      productVariantsCountsUpdatePromises,
      productsBeingReserved,
    ] = await this.productVariantService.updateProductVariantCounts(
      [newProductVariantID],
      customerID
    )
    promises.push(productVariantsCountsUpdatePromises)

    const newPhysicalProductID = newPhysicalProduct.id
    const newPhysicalProductIDConnect = {
      connect: { id: newPhysicalProductID },
    }

    promises.push(
      this.prisma.client.reservation.update({
        where: {
          id: lastReservation.id,
        },
        data: {
          newProducts: newPhysicalProductIDConnect,
          products: newPhysicalProductIDConnect,
          sentPackage: {
            update: {
              items: newPhysicalProductIDConnect,
            },
          },
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
      this.prisma.client.bagItem.upsert({
        where: { id: itemInBag?.id || "" },
        create: {
          customer: {
            connect: { id: customerID },
          },
          productVariant: {
            connect: { id: newProductVariantID },
          },
          physicalProduct: newPhysicalProductIDConnect,
          status: "Reserved",
          saved: false,
        },
        update: {
          physicalProduct: newPhysicalProductIDConnect,
          status: "Reserved",
          saved: false,
        },
        select,
      })
    )

    const results = await this.prisma.client.$transaction(promises.flat())
    const addedBagItem = results.pop()

    await this.productUtils.removeRestockNotifications(
      [newProductVariantID],
      customerID
    )

    return addedBagItem
  }

  async processLostItems(lostBagItemsIds) {
    const lostResPhysProds = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          id: {
            in: lostBagItemsIds,
          },
        },
        select: {
          id: true,
          status: true,
        },
      }
    )

    lostResPhysProds.forEach(resPhysProd => {
      if (
        ([
          "ScannedOnInbound",
          "InTransitInbound",
          "DeliveredToCustomer",
          "ScannedOnOutbound",
          "InTransitOutbound",
          "DeliveredToBusiness",
        ] as ReservationPhysicalProductStatus[]).includes(resPhysProd.status)
      ) {
        throw new Error(
          "Items that are inbound or outbound can only be marked as lost"
        )
      }
    })

    const promises = []

    promises.push(
      this.prisma.client.bagItem.deleteMany({
        where: {
          id: {
            in: lostBagItemsIds,
          },
        },
      })
    )
    const lostOutboundResPhysProds = lostResPhysProds.filter(a =>
      ([
        "ScannedOnOutbound",
        "InTransitOutbound",
        "DeliveredToCustomer",
      ] as ReservationPhysicalProductStatus[]).includes(a.status)
    )
    const lostInboundItemsResPhysProds = lostResPhysProds.filter(a =>
      ([
        "ScannedOnInbound",
        "InTransitInbound",
        "DeliveredToBusiness",
      ] as ReservationPhysicalProductStatus[]).includes(a.status)
    )

    if (lostOutboundResPhysProds) {
      promises.push(
        this.prisma.client.reservationPhysicalProduct.updateMany({
          where: {
            id: {
              in: lostOutboundResPhysProds.map(a => a.id),
            },
          },
          data: {
            lostAt: new Date(),
            lostInPhase: "BusinessToCustomer",
            hasBeenLost: true,
          },
        })
      )
    }

    if (lostInboundItemsResPhysProds) {
      promises.push(
        this.prisma.client.reservationPhysicalProduct.updateMany({
          where: {
            id: {
              in: lostInboundItemsResPhysProds.map(a => a.id),
            },
          },
          data: {
            lostAt: new Date(),
            lostInPhase: "CustomerToBusiness",
            hasBeenLost: true,
          },
        })
      )
    }

    const physicalProducts = await this.prisma.client.physicalProduct.findMany({
      where: {
        bagItems: {
          some: {
            id: {
              in: lostBagItemsIds,
            },
          },
        },
      },
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
    })

    physicalProducts.forEach(physicalProduct => {
      const productVariantData = this.productVariantService.getCountsForStatusChange(
        {
          productVariant: physicalProduct.productVariant,
          oldInventoryStatus: "Reserved",
          newInventoryStatus: "NonReservable",
        }
      )

      promises.push(
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
    })

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

  private getSection(
    status: BagSectionStatus,
    bagItems,
    application: "client" | "admin"
  ) {
    const checkIfUpdatedMoreThan24HoursAgo = item => {
      return (
        item?.updatedAt &&
        // @ts-ignore
        DateTime.fromISO(item?.updatedAt.toISOString()).diffNow("days")?.values
          ?.days <= -1
      )
    }
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
          const status = item.reservationPhysicalProduct?.status
          return (
            status === "ScannedOnOutbound" || status === "InTransitOutbound"
          )
        })
        title = "Shipped"
        break
      case "Inbound":
        filteredBagItems = bagItems.filter(item => {
          const status = item.reservationPhysicalProduct?.status
          return status === "ScannedOnInbound" || status === "InTransitInbound"
        })
        title = "On the way back"
        break
      case "ReturnPending":
        title = "Returning"
        break
      case "Added":
        filteredBagItems = bagItems.filter(item => item.status === "Added")
        title = "Reserving"
        break
      case "AtHome":
        filteredBagItems = bagItems.filter(item => {
          const updatedMoreThan24HoursAgo = checkIfUpdatedMoreThan24HoursAgo(
            item
          )

          const delivered =
            item.reservationPhysicalProduct?.status === "DeliveredToCustomer"

          const noReturnPending = !item.reservationPhysicalProduct
            ?.hasCustomerReturnIntent

          return updatedMoreThan24HoursAgo && noReturnPending && delivered
        })
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
        // 2. Inbound step 3
        filteredBagItems = filteredBagItems.filter(item => {
          const updatedMoreThan24HoursAgo = checkIfUpdatedMoreThan24HoursAgo(
            item
          )

          return !updatedMoreThan24HoursAgo
        })
        title = "Order returned"
        deliveryStep = 3
        deliveryStatusText = "Shipped"
        deliveryTrackingUrl = this.getTrackingUrl(filteredBagItems, "inbound")
        break
      case "Packed":
        // 1. Outbound step 1
        title = isAdmin ? "Packed" : "Order received"
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
        filteredBagItems = filteredBagItems.filter(item => {
          const updatedMoreThan24HoursAgo = checkIfUpdatedMoreThan24HoursAgo(
            item
          )

          const noReturnPending = !item.reservationPhysicalProduct
            ?.hasCustomerReturnIntent

          return !updatedMoreThan24HoursAgo && noReturnPending
        })
        title = "Order delivered"
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
