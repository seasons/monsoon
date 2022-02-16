import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import { Injectable } from "@nestjs/common"
import {
  Brand,
  InventoryStatus,
  PhysicalProductOffloadMethod,
  Product,
} from "@prisma/client"
import {
  AdminActionLog,
  PhysicalProduct,
  Prisma,
  ProductVariant,
  Reservation,
  WarehouseLocation,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { cloneDeep, identity, pick } from "lodash"

import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"
import { ProductService } from "./product.service"
import { ProductVariantService } from "./productVariant.service"

interface OffloadPhysicalProductIfNeededInput {
  where: Prisma.PhysicalProductWhereUniqueInput
  inventoryStatus: InventoryStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: string
}

const unstoreErrorMessage =
  "Can not unstore a physical product directly. Must do so from parent product."

@Injectable()
export class PhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService,
    private readonly productVariantService: ProductVariantService,
    private readonly productService: ProductService,
    private readonly physicalProductUtils: PhysicalProductUtilsService,
    private readonly utils: UtilsService,
    private readonly statements: StatementsService,
    private readonly emails: EmailService
  ) {}

  async updatePhysicalProduct({
    where,
    data,
    select,
  }: {
    where: Prisma.PhysicalProductWhereUniqueInput
    data: Prisma.PhysicalProductUpdateInput
    select: Prisma.PhysicalProductSelect
  }) {
    const promises = []

    const physProdBeforeUpdate = await this.prisma.client.physicalProduct.findUnique(
      {
        where,
        select: {
          id: true,
          seasonsUID: true,
          inventoryStatus: true,
          productStatus: true,
          warehouseLocation: { select: { barcode: true } },
          productVariant: {
            select: {
              id: true,
              reservable: true,
              reserved: true,
              offloaded: true,
              nonReservable: true,
              stored: true,
              product: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  images: {
                    select: {
                      url: true,
                      id: true,
                    },
                  },
                  brand: { select: { id: true, name: true } },
                  variants: {
                    select: {
                      id: true,
                      displayShort: true,
                    },
                  },
                },
              },
            },
          },
        },
      }
    )
    const productVariant = (physProdBeforeUpdate?.productVariant as unknown) as Pick<
      ProductVariant,
      "reservable" | "id"
    > & {
      product: Pick<Product, "id" | "slug" | "name"> & {
        brand: Pick<Brand, "name">
      }
    }

    let newData = cloneDeep(data)

    // Need to do this before we check for a changing inventory status because this
    // may update the inventoryStatus on data
    let notifyUsersIfNeeded = async () => null
    if (!!data.warehouseLocation) {
      newData = await this.preprocessUpdateWithWarehouseLocation({
        physProdBeforeUpdate,
        data,
      })

      const reservable = productVariant?.reservable

      // If the physical product is being stowed and there are currently no reservable units, notify users
      if (newData.warehouseLocation.connect && reservable === 0) {
        const product = productVariant?.product

        const notifications = await this.prisma.client.productNotification.findMany(
          {
            where: { productVariant: { id: productVariant.id } },
            select: {
              id: true,
              customer: {
                select: {
                  id: true,
                  user: { select: { id: true, email: true } },
                },
              },
            },
          }
        )

        const emails = notifications.map(notif => notif.customer?.user?.email)

        // Send the notification
        notifyUsersIfNeeded = async () => {
          await this.pushNotification.pushNotifyUsers({
            emails,
            pushNotifID: "ProductRestock",
            vars: {
              id: product?.id,
              slug: product?.slug,
              productName: product?.name,
              brandName: product?.brand?.name,
            },
          })

          await this.emails.sendRestockNotificationEmails(emails, product)
        }
      }
    } else if (
      !!physProdBeforeUpdate.warehouseLocation?.barcode &&
      !!newData.inventoryStatus &&
      newData.inventoryStatus !== "Reservable"
    ) {
      throw new ApolloError(
        "Physical Products with warehouse locations can only be set to a status of Reservable"
      )
    }

    if (this.changingInventoryStatus(newData, physProdBeforeUpdate)) {
      if (
        physProdBeforeUpdate.inventoryStatus === "Stored" &&
        newData.inventoryStatus !== "Offloaded"
      ) {
        throw new ApolloError(unstoreErrorMessage)
      }

      if (physProdBeforeUpdate.inventoryStatus === "Offloaded") {
        throw new ApolloError(
          "Can not un-offload a physical product. Learn to let go. Try a buddha board: https://tinyurl.com/yabmmcc7"
        )
      }

      promises.push(
        (
          await this.getUpdateVariantCountsPromiseIfNeeded({
            where,
            //@ts-ignore
            inventoryStatus: newData.inventoryStatus,
          })
        ).promise
      )
    }

    const offloadPromises = await this.getOffloadPhysicalProductPromisesIfNeeded(
      {
        where,
        ...pick(newData, ["inventoryStatus", "offloadMethod", "offloadNotes"]),
      } as OffloadPhysicalProductIfNeededInput
    )
    promises.push(offloadPromises)

    promises.push(
      this.prisma.client.physicalProduct.update({
        where,
        data: newData,
        select,
      })
    )

    const cleanPromises = promises.flat().filter(Boolean)
    const results = await this.prisma.client.$transaction(cleanPromises)
    await notifyUsersIfNeeded() // only run this if the transaction succeeded
    return results.pop()
  }

  async stowItems({
    ids,
    warehouseLocationBarcode,
  }: {
    ids: string[]
    warehouseLocationBarcode: string
  }) {
    const warehouseLocation = await this.prisma.client.warehouseLocation.findFirst(
      {
        where: {
          barcode: warehouseLocationBarcode,
        },
        select: {
          id: true,
          barcode: true,
          constraints: {
            select: {
              id: true,
              limit: true,
            },
          },
        },
      }
    )
    if (warehouseLocation.constraints.length > 0) {
      throw new Error(`
      This warehouse location has a constraint, please use single item stow for it. 
      `)
    }

    const location = await this.prisma.client.location.findUnique({
      where: {
        slug:
          process.env.SEASONS_CLEANER_LOCATION_SLUG ||
          "seasons-cleaners-official",
      },
      select: {
        id: true,
      },
    })

    const physProdsBeforeUpdate = await this.prisma.client.physicalProduct.findMany(
      {
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          seasonsUID: true,
          inventoryStatus: true,
          productStatus: true,
          warehouseLocation: { select: { barcode: true } },
          productVariant: {
            select: {
              id: true,
              reservable: true,
              reserved: true,
              offloaded: true,
              nonReservable: true,
              stored: true,
              product: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  images: {
                    select: {
                      url: true,
                      id: true,
                    },
                  },
                  brand: { select: { id: true, name: true } },
                  variants: {
                    select: {
                      id: true,
                      displayShort: true,
                    },
                  },
                },
              },
            },
          },
        },
      }
    )
    const storedPhysicalProducts = physProdsBeforeUpdate.filter(
      a => a.inventoryStatus === "Stored"
    )
    if (storedPhysicalProducts.length > 0) {
      const storedSUIDs = storedPhysicalProducts.map(a => a.seasonsUID)
      throw `The following items are stored. Please use single item stow for them: ${storedSUIDs}`
    }

    let promises = []

    const {
      prodVariantPromises,
      restockNotificationPromises,
    } = await this.prodVariantUpdatesForMultiItemStow(physProdsBeforeUpdate)
    promises.push(...prodVariantPromises)

    for (let physicalProduct of physProdsBeforeUpdate) {
      promises.push(
        this.prisma.client.physicalProduct.update({
          where: {
            id: physicalProduct.id,
          },
          data: {
            warehouseLocationId: warehouseLocation.id,
            locationId: location.id,
            productStatus:
              physicalProduct.productStatus === "New" ? "New" : "Clean",
            inventoryStatus: "Reservable",
          },
        })
      )
    }

    const results = await this.prisma.client.$transaction(promises)
    const stowedProducts = results.pop()
    await Promise.all(restockNotificationPromises)

    return stowedProducts.count > 0
  }

  private async prodVariantUpdatesForMultiItemStow(physProdsBeforeUpdate) {
    const prodVariantPromises = []
    const restockNotificationPromises = []

    for (const physicalProduct of physProdsBeforeUpdate) {
      const prodVariant = physicalProduct.productVariant

      const productVariantData = await this.productVariantService.getCountsForStatusChange(
        {
          productVariant: prodVariant,
          oldInventoryStatus: physicalProduct.inventoryStatus,
          newInventoryStatus: "Reservable",
        }
      )

      prodVariantPromises.push(
        this.prisma.client.productVariant.update({
          where: {
            id: prodVariant.id,
          },
          data: {
            ...productVariantData,
          },
        })
      )

      // If there are currently no reservable units, notify users of the restock
      if (prodVariant.reservable !== 0) {
        continue
      }
      const product = prodVariant.product
      const notifications = await this.prisma.client.productNotification.findMany(
        {
          where: {
            productVariant: {
              id: prodVariant.id,
            },
          },
          select: {
            id: true,
            customer: {
              select: {
                id: true,
                user: { select: { id: true, email: true } },
              },
            },
          },
        }
      )

      const emails = notifications.map(notif => notif.customer?.user?.email)
      // Send the notification
      restockNotificationPromises.push(() =>
        this.pushNotification.pushNotifyUsers({
          emails,
          pushNotifID: "ProductRestock",
          vars: {
            id: product?.id,
            slug: product?.slug,
            productName: product?.name,
            brandName: product?.brand?.name,
          },
        })
      )
      restockNotificationPromises.push(() =>
        this.emails.sendRestockNotificationEmails(emails, product)
      )
    }
    return { prodVariantPromises, restockNotificationPromises }
  }

  async activeReservationWithPhysicalProduct(id: string) {
    return await this.prisma.client.reservation.findFirst({
      where: {
        products: { some: { id } },
        status: {
          notIn: ["Cancelled", "Completed"],
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  interpretPhysicalProductLogs(
    logs: AdminActionLog[],
    warehouseLocations: Pick<WarehouseLocation, "id" | "barcode">[],
    reservations: (Pick<
      Reservation,
      | "id"
      | "createdAt"
      | "cancelledAt"
      | "completedAt"
      | "reservationNumber"
      | "status"
    > & { products: Pick<PhysicalProduct, "id">[] })[]
  ): (AdminActionLog & { interpretation: string })[] {
    const keysWeDontCareAbout = [
      "id",
      "price",
      "location",
      "dateOrdered",
      "dateReceived",
      "unitCost",
    ]
    const locationsMap = warehouseLocations.reduce((acc, curval) => {
      acc[curval["id"]] = curval["barcode"]
      return acc
    }, {})

    const filteredLogs = this.utils.filterAdminLogs(logs, keysWeDontCareAbout)
    const interpretedLogs = filteredLogs.map(a => {
      const changedFields = a.changedFields
      const keys = Object.keys(changedFields)
      let interpretation

      const getActiveReservation = () =>
        reservations.find(r => {
          const physProdInReservation = r.products.find(
            p => p.id === a.entityId
          )
          if (!physProdInReservation) {
            return false
          }

          const createdAt = new Date(r.createdAt)
          const cancelledAt = new Date(r.cancelledAt)
          const completedAt = new Date(r.completedAt)
          const logTimestamp = new Date(a.triggeredAt)

          const loggedAfterReservationCreated = createdAt < logTimestamp
          const loggedBeforeReservationEnded =
            this.statements.reservationIsActive(r) ||
            cancelledAt > logTimestamp ||
            completedAt > logTimestamp

          return loggedAfterReservationCreated && loggedBeforeReservationEnded
        })

      if (keys.includes("warehouseLocation")) {
        if (changedFields["warehouseLocation"] === null) {
          const activeReservation = getActiveReservation()
          if (!!activeReservation) {
            interpretation = `Picked for reservation ${activeReservation.reservationNumber}`
          } else {
            interpretation = "Picked (no reservation)"
          }
        } else {
          interpretation = `Stowed at ${
            locationsMap[changedFields["warehouseLocation"]]
          }`
        }
      } else if (keys.includes("barcoded")) {
        if (changedFields["barcoded"] === "t") {
          interpretation = "Applied barcode"
        }
      } else if (
        keys.includes("productStatus") &&
        keys.includes("inventoryStatus")
      ) {
        if (
          changedFields["productStatus"] === "Dirty" &&
          changedFields["inventoryStatus"] === "NonReservable"
        ) {
          interpretation = "Processed return from Reservation"
        }
      } else if (keys.includes("packedAt")) {
        const activeReservation = getActiveReservation()
        interpretation = `Packed for reservation ${activeReservation?.reservationNumber}`
      } else if (keys.includes("productStatus")) {
        if (changedFields["productStatus"] === "Lost") {
          interpretation = "Marked as Lost"
        }
      }
      return { ...a, interpretation }
    })
    return interpretedLogs
  }
  /*
  Enforces a variety if rules that need to stay in place whenever we set
  a warehouse location on a physical product
  */
  private async preprocessUpdateWithWarehouseLocation({
    physProdBeforeUpdate,
    data,
  }: {
    physProdBeforeUpdate: Pick<
      PhysicalProduct,
      "seasonsUID" | "inventoryStatus" | "productStatus"
    >
    data: Prisma.PhysicalProductUpdateInput
  }) {
    // Copy the data object to keep the function pure
    const newData = cloneDeep(data) as Prisma.PhysicalProductUpdateInput

    // If we're just disconnecting a warehouse location, then let it be
    if (newData.warehouseLocation.disconnect) {
      switch (physProdBeforeUpdate.inventoryStatus) {
        case "Stored":
          if (
            !!newData.inventoryStatus &&
            newData.inventoryStatus !== "Stored"
          ) {
            throw new Error(
              "If disconnecting a warehouse location from a stored physical product, you must keep it stored"
            )
          }
          break
        default:
          if (newData.inventoryStatus !== "NonReservable") {
            throw new Error(
              "If disconnecting a warehouse location from an unstored physical product, you must set it to NonReservable"
            )
          }
          break
      }
    } else {
      // If we're setting a warehouse location, apply constraints and checks

      // Make sure the barcode is valid and there is space for the item there
      await this.validateWarehouseLocationConstraints(
        physProdBeforeUpdate,
        newData.warehouseLocation.connect
      )

      // If we're stowing a physical product, one of two things can be true for its inventory status.
      // Either it's currently "Stored" and we keep it that way. Or it's some other status and we make sure it's marked as Reservable.
      // All stowed items should either be Stored or Reservable.
      switch (physProdBeforeUpdate.inventoryStatus) {
        case "Stored":
          if (
            !!newData.inventoryStatus &&
            newData.inventoryStatus !== "Stored"
          ) {
            throw new ApolloError(unstoreErrorMessage)
          }
          newData.inventoryStatus = "Stored"
          break
        default:
          if (
            !!newData.inventoryStatus &&
            newData.inventoryStatus !== "Reservable"
          ) {
            throw new ApolloError(
              `A physical product with a warehouse location can not be set to status ${newData.inventoryStatus}. It must be Reservable`
            )
          }
          newData.inventoryStatus = "Reservable"
          break
      }

      // All physical products with a warehouse location are located in the warehouse
      newData.location = {
        connect: {
          slug:
            process.env.SEASONS_CLEANER_LOCATION_SLUG ||
            "seasons-cleaners-official",
        },
      }

      // All physical products with a warehouse location are either clean or new
      if (physProdBeforeUpdate.productStatus !== "New") {
        newData.productStatus = "Clean"
      }
    }

    return newData
  }

  /**
   * Checks to ensure that adding the given physical product to the designated
   * warehouse location does not violate any warehouse location constraints.
   * Throws an error if it does.
   *
   * Assumes constraints can apply to leaf, parent, or ancestral categories.
   */
  private async validateWarehouseLocationConstraints(
    physProd: Pick<PhysicalProduct, "seasonsUID">,
    where: Prisma.WarehouseLocationWhereUniqueInput
  ) {
    const warehouseLocation = await this.prisma.client.warehouseLocation.findUnique(
      {
        where,
        select: {
          id: true,
          barcode: true,
          constraints: {
            select: { category: { select: { name: true } }, limit: true },
          },
        },
      }
    )
    if (warehouseLocation.constraints.length === 0) {
      return true
    }

    // Proceed to validate against constraints
    const allCategoriesOnPhysProd = (
      await this.physicalProductUtils.getAllCategories(physProd)
    ).map(a => a.name)

    const applicableConstraints = warehouseLocation.constraints
      .map(a => identity({ limit: a.limit, name: a.category.name }))
      .filter(b => allCategoriesOnPhysProd.includes(b.name))

    for (const { name, limit } of applicableConstraints) {
      const otherUnitsAtLocation = (
        await this.prisma.client.physicalProduct.findMany({
          where: { warehouseLocation: { barcode: warehouseLocation.barcode } },
          select: { seasonsUID: true },
        })
      ).filter(a => a.seasonsUID !== physProd.seasonsUID) // other products at the location

      const otherUnitsAlreadyConstrained = (
        await Promise.all(
          otherUnitsAtLocation.map(async a => ({
            seasonsUID: a.seasonsUID,
            categories: await this.physicalProductUtils.getAllCategories(a),
          }))
        )
      ).filter(b => b.categories.map(c => c.name).includes(name)) // with the same cateogry

      if (otherUnitsAlreadyConstrained.length === limit) {
        throw new Error(
          `Cannot add ${physProd.seasonsUID} to ${warehouseLocation.barcode} due to constraint (${name}, ${limit}).` +
            ` Other units there: ${otherUnitsAlreadyConstrained.map(
              a => a.seasonsUID
            )} `
        )
      }
    }
  }

  /**
   * Checks for a valid "mod index" location code, of the form xy, where
   * x is in the set [A, B, ..., Z] and y is in the set [100, 110, ..., 990]
   */
  private validModIndexLocationCode(code: string): boolean {
    return /^[A-Z][1-9]\d0$/.test(code)
  }

  /* 
  Note that this does not update product variant counts. It assumes the parent function
  is doing so.
  */
  private async getOffloadPhysicalProductPromisesIfNeeded({
    where,
    inventoryStatus,
    offloadMethod,
    offloadNotes,
  }: OffloadPhysicalProductIfNeededInput) {
    const physicalProductBeforeUpdate = await this.prisma.client.physicalProduct.findUnique(
      {
        where,
        select: {
          id: true,
          inventoryStatus: true,
          productVariant: {
            select: { id: true, product: { select: { id: true } } },
          },
        },
      }
    )

    if (
      inventoryStatus === "Offloaded" &&
      physicalProductBeforeUpdate.inventoryStatus !== "Offloaded"
    ) {
      // Validations
      const activeResyWithPhysProd = await this.activeReservationWithPhysicalProduct(
        physicalProductBeforeUpdate.id
      )
      if (!offloadMethod) {
        throw new ApolloError(
          "Must supply offload method when offloading physical product",
          "422"
        )
      }
      if (!!activeResyWithPhysProd) {
        throw new ApolloError(
          "Can not offload a physical product on an active reservation",
          "409",
          pick(activeResyWithPhysProd, "reservationNumber")
        )
      }
      if (physicalProductBeforeUpdate.inventoryStatus === "Reserved") {
        throw new ApolloError(
          "Corrupt data. No active reservation with physical product, but its current status is reserved",
          "409"
        )
      }

      // Core logic
      return [
        this.prisma.client.physicalProduct.update({
          where,
          data: { inventoryStatus, offloadMethod, offloadNotes },
        }),
        (
          await this.productService.getOffloadProductPromiseIfNeeded(
            (physicalProductBeforeUpdate.productVariant as any).product.id,
            physicalProductBeforeUpdate.id
          )
        ).promise,
      ]
    }

    return []
  }

  async undoOffload(where: Prisma.PhysicalProductWhereUniqueInput) {
    const promises = []

    const physProd = await this.prisma.client.physicalProduct.findUnique({
      where,
      select: {
        inventoryStatus: true,
        warehouseLocation: { select: { id: true } },
      },
    })

    if (physProd.inventoryStatus !== "Offloaded") {
      throw new ApolloError(`Item is not offloaded. Can not undo offload`)
    }

    const newStatus = !!physProd.warehouseLocation
      ? "Reservable"
      : "NonReservable"

    promises.push(
      (
        await this.getUpdateVariantCountsPromiseIfNeeded({
          where,
          //@ts-ignore
          inventoryStatus: newData.inventoryStatus,
        })
      ).promise
    )

    promises.push(
      this.prisma.client.physicalProduct.update({
        where,
        data: {
          inventoryStatus: newStatus,
          offloadMethod: null,
          offloadNotes: null,
        },
      })
    )

    await this.prisma.client.$transaction(promises)
  }

  private async getUpdateVariantCountsPromiseIfNeeded({
    where,
    inventoryStatus,
  }: {
    where: Prisma.PhysicalProductWhereUniqueInput
    inventoryStatus: InventoryStatus
  }) {
    const physicalProductBeforeUpdate = await this.prisma.client.physicalProduct.findUnique(
      {
        where,
        select: {
          id: true,
          inventoryStatus: true,
          productVariant: {
            select: {
              id: true,
              offloaded: true,
              reservable: true,
              reserved: true,
              nonReservable: true,
              stored: true,
            },
          },
        },
      }
    )

    if (inventoryStatus !== physicalProductBeforeUpdate.inventoryStatus) {
      return {
        promise: this.productVariantService.getUpdateCountsForStatusChangePromise(
          {
            productVariant: physicalProductBeforeUpdate.productVariant as any,
            oldInventoryStatus: physicalProductBeforeUpdate.inventoryStatus as InventoryStatus,
            newInventoryStatus: inventoryStatus,
          }
        ),
      }
    }

    return { promise: null }
  }

  private changingInventoryStatus(
    data: Prisma.PhysicalProductUpdateInput,
    physProdBeforeUpdate: Pick<PhysicalProduct, "inventoryStatus">
  ) {
    return (
      !!data.inventoryStatus &&
      data.inventoryStatus !== physProdBeforeUpdate.inventoryStatus
    )
  }
}
