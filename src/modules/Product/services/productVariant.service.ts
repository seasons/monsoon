import { Injectable } from "@nestjs/common"
import { Prisma, ProductVariant } from "@prisma/client"
import { InventoryStatus } from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { head, lowerFirst, omit, pick, uniq, uniqBy } from "lodash"

import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"
import { ProductUtilsService } from "./product.utils.service"

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
    items: string[],
    customerId: string,
    { dryRun } = { dryRun: false }
  ) {
    const _productVariants = await this.prisma.client2.productVariant.findMany({
      where: {
        id: {
          in: items,
        },
      },
      select: {
        id: true,
        reservable: true,
        reserved: true,
        product: true,
      },
    })
    const productVariants = this.prisma.sanitizePayload(
      _productVariants,
      "ProductVariant"
    )

    const physicalProducts = await this.physicalProductUtilsService.getPhysicalProductsWithReservationSpecificData(
      items
    )

    // Are there any unavailable variants? If so, throw an error
    const unavailableVariants = productVariants.filter(v => v.reservable <= 0)
    let unavailableVariantsIDS = unavailableVariants.map(a => a.id)

    // Double check that the product variants have a sufficient number of available
    // physical products
    const availablePhysicalProducts = uniqBy(
      physicalProducts.filter(a => a.inventoryStatus === "Reservable"),
      b => (b.productVariant as any).id
    )

    if (items.length > availablePhysicalProducts?.length) {
      const availableVariantIDs = uniq(
        availablePhysicalProducts.map(p => (p.productVariant as any).id)
      )

      unavailableVariantsIDS = uniq(
        physicalProducts
          .filter(
            p => !availableVariantIDs.includes((p.productVariant as any).id)
          )
          .map(p => (p.productVariant as any).id)
      )
    }

    if (unavailableVariantsIDS.length > 0) {
      // Move the items from the bag to saved items
      await this.prisma.client2.bagItem.updateMany({
        where: {
          customer: {
            id: customerId,
          },
          productVariant: {
            id: {
              in: unavailableVariantsIDS,
            },
          },
        },
        data: {
          saved: true,
          status: "Added",
        },
      })

      throw new ApolloError(
        "The following items are not reservable",
        "511",
        unavailableVariantsIDS
      )
    }

    const promises = []

    for (const productVariant of productVariants) {
      // Update product variant counts in prisma
      if (!dryRun) {
        const data = {
          reservable: productVariant.reservable - 1,
          reserved: productVariant.reserved + 1,
        }

        promises.push(
          this.prisma.client2.productVariant.update({
            where: {
              id: productVariant.id,
            },
            data,
          })
        )
      }
    }

    return [
      promises,
      availablePhysicalProducts,
      productVariants.map(p => p.product),
    ]
  }

  async getUpdateCountsForStatusChangePromise({
    productVariant,
    oldInventoryStatus,
    newInventoryStatus,
  }: {
    productVariant
    oldInventoryStatus: InventoryStatus
    newInventoryStatus: InventoryStatus
  }) {
    const data = this.getCountsForStatusChange({
      productVariant,
      oldInventoryStatus,
      newInventoryStatus,
    })

    return this.prisma.client2.productVariant.update({
      where: { id: productVariant.id },
      data,
    })
  }

  getCountsForStatusChange({
    productVariant,
    oldInventoryStatus,
    newInventoryStatus,
  }: {
    productVariant: Partial<
      Pick<
        ProductVariant,
        "reserved" | "reservable" | "offloaded" | "nonReservable" | "stored"
      >
    >
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
