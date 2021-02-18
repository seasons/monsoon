import { Injectable } from "@nestjs/common"
import {
  BottomSizeType,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
  ProductVariant,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"
import { lowerFirst, pick } from "lodash"

import {
  PhysicalProductUtilsService,
  PhysicalProductWithReservationSpecificData,
} from "./physicalProduct.utils.service"
import { ProductUtilsService } from "./product.utils.service"

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly physicalProductUtilsService: PhysicalProductUtilsService
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

    const physicalProducts = await this.physicalProductUtilsService.getPhysicalProductsWithReservationSpecificData(
      items
    )

    // Are there any unavailable variants? If so, throw an error
    const unavailableVariants = prismaProductVariants.filter(
      v => v.reservable <= 0
    )
    let unavailableVariantsIDS = unavailableVariants.map(a => a.id)

    // Double check that the product variants have a sufficient number of available
    // physical products
    const availablePhysicalProducts = this.physicalProductUtilsService.extractUniqueReservablePhysicalProducts(
      physicalProducts
    )

    const unavailablePhysicalProducts = this.physicalProductUtilsService.extractUniqueNonreservablePhysicalProducts(
      physicalProducts
    )

    if (unavailablePhysicalProducts.length > 0) {
      unavailableVariantsIDS = unavailablePhysicalProducts.map(
        a => a.productVariant.id
      )
    }

    if (unavailableVariantsIDS.length > 0) {
      // Move the items from the bag to saved items
      await this.prisma.client.updateManyBagItems({
        where: {
          productVariant: {
            id_in: unavailableVariantsIDS,
          },
        },
        data: {
          saved: true,
          status: "Added",
        },
      })

      throw new ApolloError(
        "The following item is not reservable",
        "511",
        unavailableVariantsIDS
      )
    }

    const productsBeingReserved = [] as Product[]
    const rollbackFuncs = []
    try {
      for (const prismaProductVariant of prismaProductVariants) {
        const iProduct = await this.prisma.client
          .productVariant({ id: prismaProductVariant.id })
          .product()
        productsBeingReserved.push(iProduct)

        // Update product variant counts in prisma
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

  async updateCountsForStatusChange({
    id,
    oldInventoryStatus,
    newInventoryStatus,
  }: {
    id: ID_Input
    oldInventoryStatus: InventoryStatus
    newInventoryStatus: InventoryStatus
  }) {
    const prodVar = await this.prisma.client.productVariant({ id })
    const data = {}
    const oldInventoryCountKey = lowerFirst(oldInventoryStatus)
    const newInventoryCountKey = lowerFirst(newInventoryStatus)
    data[oldInventoryCountKey] = prodVar[oldInventoryCountKey] - 1
    data[newInventoryCountKey] = prodVar[newInventoryCountKey] + 1

    await this.prisma.client.updateProductVariant({
      where: { id },
      data,
    })
  }

  async getManufacturerSizeIDs(variant, type) {
    const IDs =
      variant.manufacturerSizeNames &&
      (await Promise.all(
        variant.manufacturerSizeNames?.map(async sizeValue => {
          if (!variant.sku) {
            throw new Error("No variant sku present in getManufacturerSizeIDs")
          }
          const sizeType = type === "Bottom" ? variant.bottomSizeType : "Letter"
          const slug = `${variant.sku}-manufacturer-${sizeType}-${sizeValue}`
          const size = await this.productUtils.deepUpsertSize({
            slug,
            type,
            display: sizeValue,
            topSizeData: type === "Top" && {
              letter: (sizeValue as LetterSize) || null,
            },
            bottomSizeData: type === "Bottom" && {
              type: (sizeType as BottomSizeType) || null,
              value: sizeValue || "",
            },
          })
          return { id: size.id }
        })
      ))
    return IDs
  }

  async updateProductVariant(input, info): Promise<ProductVariant> {
    const {
      id,
      productType,
      weight,
      manufacturerSizeNames,
      shopifyProductVariant,
    } = input
    const prodVarSize = await this.prisma.client
      .productVariant({ id })
      .internalSize()
    if (!prodVarSize) {
      return null
    }
    switch (productType) {
      case "Top":
        const topSizeValues = {
          ...pick(input, ["sleeve", "shoulder", "chest", "neck", "length"]),
        }
        await this.prisma.client.updateSize({
          data: { top: { update: topSizeValues } },
          where: { id: prodVarSize.id },
        })
        break
      case "Bottom":
        const bottomSizeValues = {
          ...pick(input, ["waist", "rise", "hem", "inseam"]),
        }
        await this.prisma.client.updateSize({
          data: { bottom: { update: bottomSizeValues } },
          where: { id: prodVarSize.id },
        })
        break
    }

    const data = { weight } as any

    const variantWithSku = await this.prisma.binding.query.productVariant(
      { where: { id } },
      `
      {
        id
        sku
      }
    `
    )

    if (!!manufacturerSizeNames?.length) {
      const manufacturerSizeIDs = await this.getManufacturerSizeIDs(
        { input, sku: variantWithSku.sku },
        productType
      )
      data.manufacturerSizes = {
        connect: manufacturerSizeIDs,
      }
    }

    if (shopifyProductVariant) {
      data.shopifyProductVariant = {
        upsert: {
          create: { externalId: shopifyProductVariant.externalId },
          update: { externalId: shopifyProductVariant.externalId },
        },
      }
    }

    const prodVar = await this.prisma.client.updateProductVariant({
      where: { id },
      data,
    })
    return await this.prisma.binding.query.productVariant(
      { where: { id: prodVar.id } },
      info
    )
  }
}
