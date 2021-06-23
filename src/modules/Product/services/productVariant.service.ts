import { Injectable } from "@nestjs/common"
import { Prisma, ProductVariant } from "@prisma/client"
import {
  BottomSizeType,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { difference, head, lowerFirst, omit, pick, uniq, uniqBy } from "lodash"

import {
  PhysicalProductUtilsService,
  PhysicalProductWithReservationSpecificData,
} from "./physicalProduct.utils.service"
import { ProductUtilsService } from "./product.utils.service"
import { PrismaPromise } from ".prisma/client"

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly physicalProductUtilsService: PhysicalProductUtilsService
  ) {}

  async addPhysicalProducts(productVariantID: string, count: number) {
    const productVariant = await this.prisma.client2.productVariant.findUnique({
      where: { id: productVariantID },
      select: { id: true, sku: true, total: true, nonReservable: true },
    })
    const physicalProducts = await this.prisma.client2.physicalProduct.findMany(
      {
        where: {
          productVariant: {
            every: { id: productVariant.id },
          },
        },
        select: {
          id: true,
          price: {
            select: { id: true, buyUsedEnabled: true, buyUsedPrice: true },
          },
        },
      }
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

    const physProdPromises = SUIDs.map((SUID, i) => {
      return this.prisma.client2.physicalProduct.create({
        data: {
          seasonsUID: SUID,
          productStatus: "New",
          inventoryStatus: "NonReservable",
          sequenceNumber: nextSequenceNumber + i,
          productVariant: { connect: { id: productVariant.id } },
          price: {
            create: price,
          },
        },
      })
    })
    const prodVarPromise = this.prisma.client2.productVariant.update({
      where: {
        id: productVariant.id,
      },
      data: {
        total: productVariant.total + count,
        nonReservable: productVariant.nonReservable + count,
      },
    })

    await this.prisma.client2.$transaction([
      ...physProdPromises,
      prodVarPromise,
    ])
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
          },
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

  updateCountsForStatusChange({
    productVariant,
    oldInventoryStatus,
    newInventoryStatus,
  }: {
    productVariant: {
      reservable: number
      reserved: number
      nonReservable: number
    }
    oldInventoryStatus: InventoryStatus
    newInventoryStatus: InventoryStatus
  }) {
    const oldInventoryCountKey = lowerFirst(oldInventoryStatus)
    const newInventoryCountKey = lowerFirst(newInventoryStatus)

    return {
      [oldInventoryCountKey]: productVariant[oldInventoryCountKey] - 1,
      [newInventoryCountKey]: productVariant[newInventoryCountKey] + 1,
    }
  }

  async getManufacturerSizeIDs(variant, type): Promise<{ id: string }[]> {
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
    return IDs as { id: string }[]
  }

  async updateProductVariant(input, select): Promise<ProductVariant> {
    const {
      id,
      productType,
      weight,
      manufacturerSizeType,
      manufacturerSizeNames,
      shopifyProductVariant,
    } = input

    // Input validation
    if (manufacturerSizeNames.length > 1) {
      throw new Error(`Please pass no more than 1 manufacturer size name`)
    }

    const _prodVar = await this.prisma.client2.productVariant.findUnique({
      where: { id },
      select: {
        internalSize: { select: { id: true, display: true, type: true } },
        manufacturerSizes: { select: { slug: true } },
        id: true,
        sku: true,
      },
    })
    const prodVar = this.prisma.sanitizePayload(_prodVar, "ProductVariant")

    let manufacturerSizes
    let displayShort
    if (manufacturerSizeNames.length === 1) {
      manufacturerSizes = {
        update: this.productUtils.getManufacturerSizeMutateInput(
          {
            ...prodVar,
            manufacturerSizeType,
          },
          head(manufacturerSizeNames),
          productType,
          "update"
        ),
      }

      displayShort = this.productUtils.getVariantDisplayShort(
        manufacturerSizes.update.data,
        prodVar.internalSize
      )
    }

    const topSizeValues = {
      ...pick(input, ["sleeve", "shoulder", "chest", "neck", "length"]),
    }
    const accessorySizeValues = {
      ...pick(input, ["bridge", "length", "width"]),
    }
    const bottomSizeValues = {
      ...pick(input, ["waist", "rise", "hem", "inseam"]),
    }
    const updateData = Prisma.validator<Prisma.ProductVariantUpdateInput>()({
      internalSize: {
        update: {
          accessory:
            productType === "Accessory"
              ? { update: accessorySizeValues }
              : undefined,
          top: productType === "Top" ? { update: topSizeValues } : undefined,
          bottom:
            productType === "Bottom" ? { update: bottomSizeValues } : undefined,
        },
      },
      manufacturerSizes,
      displayShort,
      shopifyProductVariant: !!shopifyProductVariant
        ? !!shopifyProductVariant.externalId
          ? { connect: { externalId: shopifyProductVariant.externalId } }
          : { disconnect: true }
        : undefined,
      weight,
    })
    const result = (await this.prisma.client2.productVariant.update({
      where: { id },
      data: updateData,
      select,
    })) as ProductVariant
    return this.prisma.sanitizePayload(result, "ProductVariant")
  }
}
