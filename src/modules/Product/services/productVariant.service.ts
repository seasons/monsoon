import { ApolloError } from "apollo-server"

import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { Injectable } from "@nestjs/common"
import { ID_Input, Product } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"

import {
  PhysicalProductService,
  PhysicalProductWithReservationSpecificData,
} from "./physicalProduct.utils.service"

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly physicalProductService: PhysicalProductService,
    private readonly airtableService: AirtableService
  ) {}

  async updateProductVariantCounts(
    /* array of product variant ids */
    items: ID_Input[],
    { dryRun } = { dryRun: false }
  ): Promise<
    [Product[], PhysicalProductWithReservationSpecificData[], () => void]
  > {
    const prismaProductVariants = await this.prisma.client.productVariants({
      where: { id_in: items },
    })

    const physicalProducts = await this.physicalProductService.getPhysicalProductsWithReservationSpecificData(
      items
    )

    // Are there any unavailable variants? If so, throw an error
    const unavailableVariants = prismaProductVariants.filter(
      v => v.reservable <= 0
    )
    if (unavailableVariants.length > 0) {
      // Remove items in the bag that are not available anymore
      await this.prisma.client.deleteManyBagItems({
        productVariant: {
          id_in: unavailableVariants.map(a => a.id),
        },
        saved: false,
        status: "Added",
      })

      throw new ApolloError(
        "The following item is not reservable",
        "511",
        unavailableVariants
      )
    }

    // Double check that the product variants have a sufficient number of available
    // physical products
    const availablePhysicalProducts = this.physicalProductService.extractUniqueReservablePhysicalProducts(
      physicalProducts
    )
    if (availablePhysicalProducts.length < items.length) {
      // TODO: list out unavailable items
      throw new ApolloError(
        "One or more product variants does not have an available physical product",
        "515"
      )
    }

    // Get the corresponding product variant records from airtable
    const allAirtableProductVariants = await this.airtableService.getAllProductVariants()
    const allAirtableProductVariantSlugs = prismaProductVariants.map(a => a.sku)
    const airtableProductVariants = allAirtableProductVariants.filter(a =>
      allAirtableProductVariantSlugs.includes(a.model.sKU)
    )

    const productsBeingReserved = [] as Product[]
    const rollbackFuncs = []
    try {
      for (const prismaProductVariant of prismaProductVariants) {
        const iProduct = await this.prisma.client
          .productVariant({ id: prismaProductVariant.id })
          .product()
        productsBeingReserved.push(iProduct)

        // Update product variant counts in prisma and airtable
        if (!dryRun) {
          const data = {
            reservable: prismaProductVariant.reservable - 1,
            reserved: prismaProductVariant.reserved + 1,
          }
          const rollbackData = {
            reservable: prismaProductVariant.reservable,
            reserved: prismaProductVariant.reserved,
          }

          await this.prisma.client.updateProductVariant({
            where: {
              id: prismaProductVariant.id,
            },
            data,
          })
          const rollbackPrismaProductVariantUpdate = async () => {
            await this.prisma.client.updateProductVariant({
              where: {
                id: prismaProductVariant.id,
              },
              data: rollbackData,
            })
          }
          rollbackFuncs.push(rollbackPrismaProductVariantUpdate)

          // Airtable record of product variant
          const airtableProductVariant = airtableProductVariants.find(
            a => a.model.sKU === prismaProductVariant.sku
          )
          if (airtableProductVariant) {
            await airtableProductVariant.patchUpdate({
              "Reservable Count": data.reservable,
              "Reserved Count": data.reserved,
            })
            const rollbackAirtableProductVariantUpdate = async () => {
              await airtableProductVariant.patchUpdate({
                "Reservable Count": rollbackData.reservable,
                "Reserved Count": rollbackData.reserved,
              })
            }
            rollbackFuncs.push(rollbackAirtableProductVariantUpdate)
          }
        }
      }
    } catch (err) {
      for (const rollbackFunc of rollbackFuncs) {
        await rollbackFunc()
      }
      throw err
    }

    const rollbackProductVariantCounts = async () => {
      for (const rollbackFunc of rollbackFuncs) {
        await rollbackFunc()
      }
    }

    return [
      productsBeingReserved,
      availablePhysicalProducts,
      rollbackProductVariantCounts,
    ]
  }
}
