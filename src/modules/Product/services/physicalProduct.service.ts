import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

import {
  PhysicalProductOffloadMethod,
  PhysicalProductWhereUniqueInput,
  InventoryStatus,
  PhysicalProductUpdateInput,
  ID_Input,
} from "@app/prisma"
import { GraphQLResolveInfo } from "graphql"
import { pick, head } from "lodash"
import { ApolloError } from "apollo-server"
import { ProductVariantService } from "./productVariant.service"
import { ProductService } from "./product.service"

interface OffloadPhysicalProductIfNeededInput {
  where: PhysicalProductWhereUniqueInput
  inventoryStatus: InventoryStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: string
}
@Injectable()
export class PhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly productService: ProductService
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

    // Use two separate queries because the schema for update data differs
    // between the client and the binding, and we expose the client's schema
    await this.prisma.client.updatePhysicalProduct({ where, data })
    return await this.prisma.binding.query.physicalProduct({ where }, info)
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
}
