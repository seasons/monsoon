import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

import {
  PhysicalProductOffloadMethod,
  PhysicalProductWhereUniqueInput,
  InventoryStatus,
  PhysicalProductUpdateInput,
  ID_Input,
  WarehouseLocationType,
  PhysicalProduct,
  WarehouseLocationWhereUniqueInput,
} from "@app/prisma"
import { GraphQLResolveInfo } from "graphql"
import { pick, head, identity } from "lodash"
import { ApolloError } from "apollo-server"
import { ProductVariantService } from "./productVariant.service"
import { ProductService } from "./product.service"
import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"

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
    await this.offloadPhysicalProductIfNeeded({
      where,
      ...pick(data, ["inventoryStatus", "offloadMethod", "offloadNotes"]),
    } as OffloadPhysicalProductIfNeededInput)

    if (!!data.warehouseLocation) {
      await this.validateWarehouseLocationConstraints(
        await this.prisma.client.physicalProduct(where),
        data.warehouseLocation.connect
      )
    }
    // Use two separate queries because the schema for update data differs
    // between the client and the binding, and we expose the client's schema
    await this.prisma.client.updatePhysicalProduct({ where, data })
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

      // Core logic
      await this.prisma.client.updatePhysicalProduct({
        where,
        data: { inventoryStatus, offloadMethod, offloadNotes },
      })
      await this.productVariantService.updateCountsForStatusChange({
        id: physicalProductBeforeUpdate.productVariant.id,
        oldInventoryStatus: physicalProductBeforeUpdate.inventoryStatus,
        newInventoryStatus: "Offloaded",
      })
      await this.productService.offloadProductIfAppropriate(
        physicalProductBeforeUpdate.productVariant.product.id
      )
    }
  }
}
