import { Injectable } from "@nestjs/common"
import {
  BottomSizeType,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
  ProductVariant,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { lowerFirst, omit, pick, uniq, uniqBy } from "lodash"

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

  async addPhysicalProducts(productVariantID: string, count: number) {
    const productVariant = await this.prisma.client.productVariant({
      id: productVariantID,
    })
    const physicalProducts = await this.prisma.binding.query.physicalProducts(
      {
        where: {
          productVariant: {
            id: productVariant.id,
          },
        },
      },
      `{
            id
            seasonsUID
            inventoryStatus
            price {
              id
              buyUsedPrice
              buyUsedEnabled
            }
            productVariant {
                id
            }
        }`
    )

    const SUIDs = []
    const newTotal = physicalProducts.length + count
    for (let i = physicalProducts.length; i < newTotal; i++) {
      const num = String(i + 1).padStart(2, "0")
      SUIDs.push(productVariant.sku + "-" + num)
    }
    const nextSequenceNumber = await this.physicalProductUtilsService.nextSequenceNumber()

    const price = omit(physicalProducts?.[0]?.price, "id") || {
      buyUsedEnabled: false,
      buyUsedPrice: 0,
    }

    const newPhysicalProducts = await Promise.all(
      SUIDs.map(async (SUID, i) => {
        return await this.prisma.client.createPhysicalProduct({
          seasonsUID: SUID,
          productStatus: "New",
          inventoryStatus: "NonReservable",
          sequenceNumber: nextSequenceNumber + i,
          productVariant: { connect: { id: productVariant.id } },
          price: {
            create: price,
          },
        })
      })
    )

    try {
      await this.prisma.client.updateProductVariant({
        where: {
          id: productVariant.id,
        },
        data: {
          total: productVariant.total + count,
          nonReservable: productVariant.nonReservable + count,
        },
      })
    } catch (err) {
      // Makeshift rollback
      for (const physProd of newPhysicalProducts) {
        await this.prisma.client.deletePhysicalProduct({ id: physProd.id })
      }
      throw err
    }

    return newPhysicalProducts
  }

  async updateProductVariantCounts(
    /* array of product variant ids */
    items: ID_Input[],
    customerId: ID_Input,
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

    if (items.length > availablePhysicalProducts?.length) {
      const availableVariantIDs = uniq(
        availablePhysicalProducts.map(physProd => physProd.productVariant.id)
      )

      unavailableVariantsIDS = uniq(
        physicalProducts
          .filter(
            physProd =>
              !availableVariantIDs.includes(physProd.productVariant.id)
          )
          .map(physProd => physProd.productVariant.id)
      )
    }

    if (unavailableVariantsIDS.length > 0) {
      // Move the items from the bag to saved items
      await this.prisma.client.updateManyBagItems({
        where: {
          customer: {
            id: customerId,
          }
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
          const sizeType = variant.manufacturerSizeType
          const slug = `${variant.sku}-manufacturer-${sizeType}-${sizeValue}`
          const size = await this.productUtils.deepUpsertSize({
            slug,
            type,
            display: sizeValue,
            sizeType,
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

    const internalSize = await this.prisma.client
      .productVariant({ id })
      .internalSize()

    if (!internalSize) {
      return null
    }
    switch (productType) {
      case "Top":
        const topSizeValues = {
          ...pick(input, ["sleeve", "shoulder", "chest", "neck", "length"]),
        }
        await this.prisma.client.updateSize({
          data: { top: { update: topSizeValues } },
          where: { id: internalSize.id },
        })
        break
      case "Bottom":
        const bottomSizeValues = {
          ...pick(input, ["waist", "rise", "hem", "inseam"]),
        }
        await this.prisma.client.updateSize({
          data: { bottom: { update: bottomSizeValues } },
          where: { id: internalSize.id },
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
      const variant = { ...input, sku: variantWithSku.sku }
      const manufacturerSizeIDs = await this.getManufacturerSizeIDs(
        variant,
        productType
      )
      data.manufacturerSizes = {
        set: manufacturerSizeIDs,
      }
      const displayShort = await this.productUtils.getVariantDisplayShort(
        manufacturerSizeIDs,
        internalSize.id
      )
      data.displayShort = displayShort
    }

    if (shopifyProductVariant) {
      data.shopifyProductVariant = shopifyProductVariant.externalId
        ? {
            connect: { externalId: shopifyProductVariant.externalId },
          }
        : {
            disconnect: true,
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
