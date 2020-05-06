import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

import {
  PhysicalProductOffloadMethod,
  PhysicalProductWhereUniqueInput,
  InventoryStatus,
  PhysicalProductUpdateInput,
  ID_Input,
  WarehouseLocationType,
  WarehouseLocationUpdateOneWithoutPhysicalProductsInput,
  WarehouseLocationCreateWithoutPhysicalProductsInput,
  WarehouseLocationUpdateWithoutPhysicalProductsDataInput,
  PhysicalProduct,
  WarehouseLocationConstraint,
  Category,
} from "@app/prisma"
import { GraphQLResolveInfo } from "graphql"
import { pick, head, curryRight, assign, identity } from "lodash"
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

    // Validate warehouse location data if its on there
    if (!!data.warehouseLocation) {
      await this.validateWarehouseLocationOnPhysicalProductUpateInput(
        where,
        data.warehouseLocation
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

  private async validateWarehouseLocationOnPhysicalProductUpateInput(
    where: PhysicalProductWhereUniqueInput,
    data: WarehouseLocationUpdateOneWithoutPhysicalProductsInput
  ) {
    // To avoid needless complexity, we do not alow the setting of constraints through the updating of a physical product
    if (
      !!data?.create?.constraints ||
      !!data?.update?.constraints ||
      !!data?.upsert?.create?.constraints ||
      data?.upsert?.update?.constraints
    ) {
      throw new Error(
        "Can not create or update warehouse location constraints on a call to updatePhysicalProducts"
      )
    }

    // Validate if they are creating
    if (!!data.create) await this.validateFromInput(where, data.create)

    // Validate if they are updating
    if (!!data.update) await this.validateFromInput(where, data.update)

    // Validate if they are upserting
    if (!!data.upsert) {
      await this.validateFromInput(where, data.upsert.create)
      await this.validateFromInput(where, data.upsert.update)
    }

    return true
  }

  private async validateFromInput(
    where: PhysicalProductWhereUniqueInput,
    input:
      | WarehouseLocationCreateWithoutPhysicalProductsInput
      | WarehouseLocationUpdateWithoutPhysicalProductsDataInput
  ) {
    const existingWarehouseLocation = head(
      await this.prisma.binding.query.warehouseLocations(
        {
          where: { barcode: input.barcode },
        },
        `{
         constraints {
           id
           category {
             name
           }
           limit
         }
       }`
      )
    ) as any
    if (!!existingWarehouseLocation.constraints) {
      await this.validateWarehouseLocationConstraints(
        await this.prisma.client.physicalProduct(where),
        input.barcode,
        existingWarehouseLocation.constraints
      )
    }
    await this.validateWarehouseLocationStructure(
      pick(input, [
        "type, barcode, locationCode, itemCode",
      ]) as ValidateWarehouseLocationStructureInput
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
      !/^\w{4}$/.test(barcodeItemCode) // barcode is 4 alphanumeric chars
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

  private async validateWarehouseLocationConstraints(
    physProd: PhysicalProduct,
    locationBarcode: string,
    constraints: WarehouseLocationConstraint[]
  ) {
    const allCategoriesOnPhysProd = (
      await this.physicalProductUtils.getAllCategories(physProd)
    ).map(a => a.name)

    const applicableConstraints = (
      await this.prisma.binding.query.warehouseLocationConstraints(
        { where: { id_in: constraints.map(a => a.id) } },
        `{
          category {
            name
          }
          limit
        }`
      )
    )
      .map(a => identity({ limit: a.limit, name: a.category.name }))
      .filter(b => allCategoriesOnPhysProd.includes(b.name))

    for (const { name, limit } of applicableConstraints) {
      const otherUnitsAtLocation = (
        await this.prisma.client.physicalProducts({
          where: { warehouseLocation: { barcode: locationBarcode } },
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

      if (otherUnitsAlreadyConstrained?.length || 0 > limit - 1) {
        throw new Error(
          `Cannot add ${physProd.seasonsUID} to ${locationBarcode} due to constraint (${name}, ${limit}).` +
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
