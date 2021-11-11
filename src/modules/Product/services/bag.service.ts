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
import { DateTime } from "luxon"

import { ProductVariantService } from "../services/productVariant.service"

enum BagSectionStatus {
  Added = "Added",
  AtHome = "AtHome",
  CustomerToBusiness = "CustomerToBusiness",
  BusinessToCustomer = "BusinessToCustomer",
  ReturnPending = "ReturnPending",
}

@Injectable()
export class BagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService,
    private readonly productUtils: ProductUtilsService
  ) {}

  async bagSection(status: BagSectionStatus, customer) {
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

    switch (status) {
      case "Added":
        return await this.getAddedSection(bagItems)
      case "AtHome":
        return await this.getAtHomeSection(bagItems)
      case "CustomerToBusiness":
        return this.getCustomerToBusinessSection(bagItems)
      case "BusinessToCustomer":
        return await this.getBusinessToCustomerSection(bagItems)
      case "ReturnPending":
        return await this.getReturnPendingSection(bagItems)
      default:
        return null
    }
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
            hasBeenScannedOnInbound: true,
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
      return [
        this.getQueuedSection(bagItems),
        this.getPickedSection(bagItems),
        this.getPackedSection(bagItems, "spring"),
        this.getBusinessToCustomerSection(bagItems),
        this.getAtHomeSection(bagItems),
        this.getReturnPendingSection(bagItems),
        this.getCustomerToBusinessSection(bagItems),
      ]
    } else {
      return [
        this.getAddedSection(bagItems),
        this.getReturnPendingSection(bagItems),

        // Step 1 outbound,
        this.getPackedSection(bagItems, "client"),

        // Step 2 outbound
        this.getBusinessToCustomerSection(bagItems),

        // Step 3 outbound
        this.getDeliveredToCustomerSection(bagItems),

        // Step 1 inbound
        this.getHasBeenScannedOutboundSection(bagItems),

        // Step 2 inbound
        this.getCustomerToBusinessSection(bagItems),

        // Step 3 inbound
        this.getDeliveredToBusinessSection(bagItems),

        this.getAtHomeSection(bagItems),
      ]
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
        reservationPhysicalProduct: {
          select: {
            id: true,
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

    const newReservationPhysicalProduct = await this.prisma.client.reservationPhysicalProduct.create(
      {
        data: {
          isNew: true,
          physicalProduct: {
            connect: {
              id: newPhysicalProductID,
            },
          },
        },
        select: {
          id: true,
        },
      }
    )

    promises.push(
      this.prisma.client.reservation.update({
        where: {
          id: lastReservation.id,
        },
        data: {
          reservationPhysicalProducts: {
            disconnect: {
              id: oldReservationPhysicalProduct.id,
            },
            connect: {
              id: newReservationPhysicalProduct.id,
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
      this.prisma.client.rentalInvoice.update({
        where: { id: activeRentalInvoice.id },
        data: {
          reservationPhysicalProducts: {
            disconnect: {
              id: oldReservationPhysicalProduct.id,
            },
            connect: {
              id: newReservationPhysicalProduct.id,
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
              id: newReservationPhysicalProduct.id,
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

  private async getQueuedSection(bagItems) {
    const filteredBagItems = bagItems.filter(
      b => b.reservationPhysicalProduct?.status === "Queued"
    )

    return {
      id: "queued",
      title: "Queued",
      status: "Queued",
      bagItems: filteredBagItems,
    }
  }

  private getAtHomeSection(bagItems) {
    const filteredBagItems = bagItems.filter(item => {
      const updatedMoreThan24HoursAgo =
        item?.updatedAt &&
        // @ts-ignore
        DateTime.fromISO(item?.updatedAt.toISOString()).diffNow("days")?.values
          ?.days <= -1

      const noReturnPending = !item.reservationPhysicalProduct
        ?.hasCustomerReturnIntent

      return (
        item.reservationPhysicalProduct?.status === "DeliveredToCustomer" &&
        updatedMoreThan24HoursAgo &&
        noReturnPending
      )
    })

    return {
      id: "atHome",
      title: "At home",
      status: "AtHome",
      bagItems: filteredBagItems,
    }
  }

  private getPickedSection(bagItems) {
    const filteredBagItems = bagItems.filter(
      b => b.reservationPhysicalProduct?.status === "Picked"
    )
    return {
      id: "picked",
      title: "Picked",
      status: "Picked",
      bagItems: filteredBagItems,
    }
  }

  // 1. Inbound step 1
  private getHasBeenScannedOutboundSection(bagItems) {
    const filteredBagItems = bagItems.filter(b => {
      return b.reservationPhysicalProduct?.hasBeenScannedOnInbound
    })

    return {
      id: "customerToBusiness",
      title: "On the way back",
      status: "CustomerToBusiness",
      bagItems: filteredBagItems,
      deliveryStep: 1,
      deliveryStatusText: "Received by UPS",
      deliveryTrackingUrl: this.getInboundTrackingUrl(filteredBagItems),
    }
  }

  // 2. Inbound step 2
  private getCustomerToBusinessSection(bagItems) {
    const filteredBagItems = bagItems.filter(b => {
      const resPhysProdStatus = b.reservationPhysicalProduct?.status
      return resPhysProdStatus === "ShippedToBusiness"
    })

    return {
      id: "customerToBusiness",
      title: "On the way back",
      status: "CustomerToBusiness",
      bagItems: filteredBagItems,
      deliveryStep: 2,
      deliveryStatusText: "Shipped",
      deliveryTrackingUrl: this.getInboundTrackingUrl(filteredBagItems),
    }
  }

  // 3. Inbound step 3
  private getDeliveredToBusinessSection(bagItems) {
    const filteredBagItems = bagItems.filter(b => {
      const updatedMoreThan24HoursAgo =
        b?.updatedAt &&
        // @ts-ignore
        DateTime.fromISO(b?.updatedAt.toISOString()).diffNow("days")?.values
          ?.days <= -1
      const resPhysProdStatus = b.reservationPhysicalProduct?.status
      return (
        resPhysProdStatus === "DeliveredToBusiness" &&
        !updatedMoreThan24HoursAgo
      )
    })

    return {
      id: "customerToBusiness",
      title: "Order returned",
      status: "CustomerToBusiness",
      bagItems: filteredBagItems,
      deliveryStep: 3,
      deliveryStatusText: "Shipped",
      deliveryTrackingUrl: this.getInboundTrackingUrl(filteredBagItems),
    }
  }

  // 1. Outbound step 1
  private getPackedSection(bagItems: any, application: "spring" | "client") {
    const isSpring = application === "spring"
    const filteredBagItems = bagItems.filter(
      b => b.reservationPhysicalProduct?.status === "Packed"
    )

    return {
      id: "packed",
      title: isSpring ? "Packed" : "Order received",
      status: "Packed",
      bagItems: filteredBagItems,
      deliveryStep: 1,
      deliveryStatusText: "Received",
      deliveryTrackingUrl: this.getOutboundTrackingUrl(filteredBagItems),
    }
  }

  // 2. Outbound step 2
  private getBusinessToCustomerSection(bagItems) {
    const filteredBagItems = bagItems.filter(b => {
      return b.reservationPhysicalProduct?.status === "ShippedToCustomer"
    })

    return {
      id: "businessToCustomer",
      title: "Order on the way",
      status: "BusinessToCustomer",
      bagItems: filteredBagItems,
      deliveryStep: 2,
      deliveryStatusText: "Shipped",
      deliveryTrackingUrl: this.getOutboundTrackingUrl(filteredBagItems),
    }
  }

  // 3. Outbound step 3
  private async getDeliveredToCustomerSection(bagItems) {
    const filteredBagItems = bagItems.filter(b => {
      const updatedMoreThan24HoursAgo =
        b?.updatedAt &&
        // @ts-ignore
        DateTime.fromISO(b?.updatedAt.toISOString()).diffNow("days")?.values
          ?.days <= -1

      const noReturnPending = !b.reservationPhysicalProduct
        ?.hasCustomerReturnIntent

      return (
        !updatedMoreThan24HoursAgo &&
        b.reservationPhysicalProduct?.status === "DeliveredToCustomer" &&
        noReturnPending
      )
    })

    return {
      id: "deliveredToCustomer",
      title: "Order delivered",
      status: "DeliveredToCustomer",
      bagItems: filteredBagItems,
      deliveryStep: 3,
      deliveryStatusText: "Shipped",
      deliveryTrackingUrl: this.getOutboundTrackingUrl(filteredBagItems),
    }
  }

  private async getReturnPendingSection(bagItems) {
    const filteredBagItems = bagItems.filter(
      b =>
        b.reservationPhysicalProduct?.status === "DeliveredToCustomer" &&
        b.reservationPhysicalProduct?.hasCustomerReturnIntent
    )

    return {
      id: "returnPending",
      title: "Returning",
      status: "ReturnPending",
      bagItems: filteredBagItems,
    }
  }

  private getOutboundTrackingUrl(bagItems) {
    return (
      bagItems?.find(
        b =>
          b.reservationPhysicalProduct?.outboundPackage?.shippingLabel
            ?.trackingURL
      ) ?? ""
    )
  }

  private getInboundTrackingUrl(bagItems) {
    return (
      bagItems?.find(
        b =>
          b.reservationPhysicalProduct?.inboundPackage?.shippingLabel
            ?.trackingURL
      ) ?? ""
    )
  }

  private getAddedSection(bagItems) {
    const addedBagItems = bagItems.filter(item => item.status === "Added")

    return {
      id: "added",
      title: "Reserving",
      status: "Added",
      bagItems: addedBagItems,
    }
  }
}
