import {
  ID_Input,
  InventoryStatus,
  PhysicalProduct,
  PhysicalProductOffloadMethod,
  PhysicalProductUpdateInput,
  PhysicalProductWhereUniqueInput,
  WarehouseLocation,
  WarehouseLocationType,
  WarehouseLocationWhereUniqueInput,
} from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"
import { GraphQLResolveInfo } from "graphql"
import { cloneDeep, head, identity, pick } from "lodash"

import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"
import { ProductService } from "./product.service"
import { ProductVariantService } from "./productVariant.service"

interface OffloadPhysicalProductIfNeededInput {
  where: PhysicalProductWhereUniqueInput
  inventoryStatus: InventoryStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: string
}

interface ValidateWarehouseLocationStructureInput {
  type: WarehouseLocationType
  barcode: string
  locationCode: string
  itemCode: string
}

const unstoreErrorMessage =
  "Can not unstore a physical product directly. Must do so from parent product."

@Injectable()
export class PhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly productService: ProductService,
    private readonly physicalProductUtils: PhysicalProductUtilsService
  ) {}

  async updatePhysicalProduct({
    where,
    data,
    info,
  }: {
    where: PhysicalProductWhereUniqueInput
    data: PhysicalProductUpdateInput
    info: GraphQLResolveInfo
  }) {
    const physProdBeforeUpdate = (await this.prisma.binding.query.physicalProduct(
      { where },
      `{
      id
      seasonsUID
      inventoryStatus
      productStatus
      warehouseLocation {
        barcode
      }
    }`
    )) as PhysicalProduct & { warehouseLocation: WarehouseLocation }

    let newData = cloneDeep(data)

    // Need to do this before we check for a changing inventory status because this
    // may update the inventoryStatus on data
    if (!!data.warehouseLocation) {
      newData = await this.preprocessUpdateWithWarehouseLocation({
        physProdBeforeUpdate,
        data,
      })
    } else if (
      newData.warehouseLocation === { disconnect: true } &&
      newData.inventoryStatus === "NonReservable"
    ) {
      // continue if we are picking this physical product
    } else if (
      !!physProdBeforeUpdate.warehouseLocation?.barcode &&
      newData.inventoryStatus !== "Reservable"
    ) {
      throw new ApolloError(
        "Physical Products with warehouse locations can only be set to a status of Reservable"
      )
    }

    if (this.changingInventoryStatus(newData, physProdBeforeUpdate)) {
      if (physProdBeforeUpdate.inventoryStatus === "Stored") {
        throw new ApolloError(unstoreErrorMessage)
      }

      if (physProdBeforeUpdate.inventoryStatus === "Offloaded") {
        throw new ApolloError(
          "Can not un-offload a physical product. Learn to let go. Try a buddha board: https://tinyurl.com/yabmmcc7"
        )
      }

      // Must update counts before calling any other methods because they
      // might update the inventoryStatus, i.e. in offloadPhysicalProductIfNeeded
      await this.updateVariantCountsIfNeeded({
        where,
        inventoryStatus: newData.inventoryStatus,
      })
    }

    await this.offloadPhysicalProductIfNeeded({
      where,
      ...pick(newData, ["inventoryStatus", "offloadMethod", "offloadNotes"]),
    } as OffloadPhysicalProductIfNeededInput)

    await this.prisma.client.updatePhysicalProduct({ where, data: newData })

    // Do this at the end so it only happens *after* any status changes have occured
    if (this.changingInventoryStatus(newData, physProdBeforeUpdate)) {
      await this.prisma.client.createPhysicalProductInventoryStatusChange({
        old: physProdBeforeUpdate.inventoryStatus,
        new: newData.inventoryStatus,
        physicalProduct: { connect: where },
      })
    }

    return await this.prisma.binding.query.physicalProduct({ where }, info)
  }

  async activeReservationWithPhysicalProduct(id: ID_Input) {
    return head(
      await this.prisma.client.reservations({
        where: {
          AND: [
            { products_some: { id } },
            { status_not_in: ["Cancelled", "Completed"] },
          ],
        },
      })
    )
  }

  /**
   * Applies type-specific rules to validate a warehouse location
   * Throws an error if invalid
   */
  async validateWarehouseLocationStructure({
    type,
    barcode,
    locationCode,
    itemCode,
  }: ValidateWarehouseLocationStructureInput) {
    if (!type) {
      throw new Error("Must include warehouse location type")
    }
    if (!barcode) {
      throw new Error("Must include barcode")
    }

    // Ensure locationCode and itemCode are what is implied by the barcode
    const [typePrefix, barcodeLocationCode, barcodeItemCode] = barcode.split(
      "-"
    )
    if (
      !/^C$|^SR$|^DB$/.test(typePrefix) || // type prefix is C, SR, or DB
      !/^\w{4}$/.test(barcodeLocationCode) || // locationCode is 4 alphanumeric chars
      !/^[A-Za-z0-9.]{3,5}$/.test(barcodeItemCode) // barcode is 3-5 alphanumeric chars
    ) {
      throw new Error(
        "Invalid barcode. Must be of form typeprefix-locationcode-itemcode e.g SR-A200-ABES"
      )
    }
    if (barcodeLocationCode !== locationCode) {
      throw new Error("locationCode must match barcode")
    }
    if (barcodeItemCode !== itemCode) {
      throw new Error("itemCode must match barcode")
    }

    // Validate the location code
    const modIndexErrorString =
      "Must be of form xy where x is in [A-Z] and y is in [100, 110, ..., 990]"
    if (!this.validModIndexLocationCode(locationCode)) {
      throw new Error(`Invalid locationcode. ${modIndexErrorString}`)
    }

    // Validate type-specific details
    switch (type) {
      case "Conveyor":
        if (typePrefix !== "C") {
          throw new Error(
            "Conveyer Warehouse Locations barcodes must begin with 'C'"
          )
        }
        // 4 digit number
        if (!/^\d\d\d\d$/.test(itemCode)) {
          //
          throw new Error(
            "Invalid itemCode. Must be in [0001, 0002, ..., 9999]"
          )
        }
        break
      case "Rail":
        if (typePrefix !== "SR") {
          throw new Error(
            "Rail Warehouse Locations barcodes must begin with 'SR'"
          )
        }
        if (
          !(await this.prisma.client.brand({
            brandCode: itemCode,
          }))
        ) {
          throw new Error(
            `Invalid itemcode. No brand exists with code ${itemCode}`
          )
        }
        break
      case "Bin":
        if (typePrefix !== "DB") {
          throw new Error(
            "Bin Warehouse Locations barcodes must begin with 'DB'"
          )
        }
        if (!this.validModIndexLocationCode(itemCode)) {
          throw new Error(`Ivalid itemcode. ${modIndexErrorString}`)
        }
        break
      default:
        throw new Error(`Invalid type: ${type}`)
    }

    return true
  }

  /*
  Enforces a variety if rules that need to stay in place whenever we set
  a warehouse location on a physical product
  */
  private async preprocessUpdateWithWarehouseLocation({
    physProdBeforeUpdate,
    data,
  }: {
    physProdBeforeUpdate: PhysicalProduct
    data: PhysicalProductUpdateInput
  }) {
    // Copy the data object to keep the function pure
    const newData = cloneDeep(data) as PhysicalProductUpdateInput

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
        if (!!newData.inventoryStatus && newData.inventoryStatus !== "Stored") {
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
    physProd: PhysicalProduct,
    where: WarehouseLocationWhereUniqueInput
  ) {
    const warehouseLocation = await this.prisma.binding.query.warehouseLocation(
      { where },
      `{
        id
        barcode
        constraints {
          category {
            name
          }
          limit
        }
      }`
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
        await this.prisma.client.physicalProducts({
          where: { warehouseLocation: { barcode: warehouseLocation.barcode } },
        })
      ).filter(a => a.seasonsUID !== physProd.seasonsUID) // other products at the location

      const otherUnitsAlreadyConstrained = (
        await Promise.all(
          otherUnitsAtLocation.map(async a =>
            identity({
              seasonsUID: a.seasonsUID,
              categories: await this.physicalProductUtils.getAllCategories(a),
            })
          )
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

  private async offloadPhysicalProductIfNeeded({
    where,
    inventoryStatus,
    offloadMethod,
    offloadNotes,
  }: OffloadPhysicalProductIfNeededInput) {
    const physicalProductBeforeUpdate = await this.prisma.binding.query.physicalProduct(
      { where },
      `{
          id
          inventoryStatus
          productVariant {
              id
              product {
                  id
              }
          }
      }`
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
      // Note that we do not create a PhysicalProductInventoryStatusChange record here
      // because this function is only called from the updatePhysicalProduct, where we
      // do create that record.
      await this.prisma.client.updatePhysicalProduct({
        where,
        data: { inventoryStatus, offloadMethod, offloadNotes },
      })
      await this.productService.offloadProductIfAppropriate(
        physicalProductBeforeUpdate.productVariant.product.id
      )
    }
  }

  private async updateVariantCountsIfNeeded({
    where,
    inventoryStatus,
  }: {
    where: PhysicalProductWhereUniqueInput
    inventoryStatus: InventoryStatus
  }) {
    const physicalProductBeforeUpdate = await this.prisma.binding.query.physicalProduct(
      { where },
      `{
          id
          inventoryStatus
          productVariant {
              id
          }
      }`
    )

    if (inventoryStatus !== physicalProductBeforeUpdate.inventoryStatus) {
      await this.productVariantService.updateCountsForStatusChange({
        id: physicalProductBeforeUpdate.productVariant.id,
        oldInventoryStatus: physicalProductBeforeUpdate.inventoryStatus,
        newInventoryStatus: inventoryStatus,
      })
    }
  }

  private changingInventoryStatus(
    data: PhysicalProductUpdateInput,
    physProdBeforeUpdate: PhysicalProduct
  ) {
    return (
      !!data.inventoryStatus &&
      data.inventoryStatus !== physProdBeforeUpdate.inventoryStatus
    )
  }
}
