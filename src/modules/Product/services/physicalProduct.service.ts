import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"
import {
  PhysicalProductOffloadMethod,
  PhysicalProductWhereUniqueInput,
  InventoryStatus,
} from "@app/prisma"
import { GraphQLResolveInfo } from "graphql"
import { PhysicalProductUpdateInput } from "@app/prisma/prisma.binding"
import { pick } from "lodash"

interface OffloadPhysicalProductIfNeededInput {
  where: PhysicalProductWhereUniqueInput
  inventoryStatus: InventoryStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
}
@Injectable()
export class PhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly physicalProductService: PhysicalProductUtilsService,
    private readonly airtableService: AirtableService
  ) {}

  async updatePhysicalroduct(
    where: PhysicalProductWhereUniqueInput,
    data: PhysicalProductUpdateInput,
    info: GraphQLResolveInfo
  ) {
    await this.offloadPhysicalProductIfNeeded({
      where,
      ...pick(data, ["inventoryStatus", "offloadMethod", "offloadNotes"]),
    } as OffloadPhysicalProductIfNeededInput)
    return await this.prisma.binding.mutation.updatePhysicalProduct(
      {
        where,
        data,
      },
      info
    )
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
      if (!offloadMethod) {
        //TODO: Supply specific error code here
        throw new Error(
          "Must supply offloadMethod if offloading physical product"
        )
      }
      if (
        this.physicalProductInActiveReservation(physicalProductBeforeUpdate.id)
      ) {
        throw new Error(
          "Can not offload a physical product on an active reservation"
        )
      }
    }
  }
}
