import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  BottomSizeType,
  Customer,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
  ProductFunction,
  ProductStatus,
  ProductUpdateInput,
  ProductVariantCreateWithoutProductInput,
  ProductWhereUniqueInput,
  RecentlyViewedProduct,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { GraphQLResolveInfo } from "graphql"
import { head } from "lodash"

import { UtilsService } from "../../Utils/services/utils.service"
import { ProductWithPhysicalProducts } from "../product.types"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService
  ) {}

  async getProducts(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.prisma.binding.query.products(
      { ...args, ...queryOptions },
      info
    )
  }

  async getProductsConnection(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.prisma.binding.query.productsConnection(
      { ...args, ...queryOptions },
      info
    )
  }

  async addViewedProduct(item, customer) {
    const viewedProducts = await this.prisma.client.recentlyViewedProducts({
      where: {
        customer: { id: customer.id },
        product: { id: item },
      },
    })
    const viewedProduct: RecentlyViewedProduct = head(viewedProducts)

    if (viewedProduct) {
      return await this.prisma.client.updateRecentlyViewedProduct({
        where: {
          id: viewedProduct.id,
        },
        data: {
          viewCount: viewedProduct.viewCount++,
        },
      })
    } else {
      return await this.prisma.client.createRecentlyViewedProduct({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        product: {
          connect: {
            id: item,
          },
        },
        viewCount: 1,
      })
    }
  }

  async isSaved(
    product: { id: ID_Input } | Product,
    customer: { id: ID_Input } | Customer | null
  ) {
    if (!customer) {
      return false
    }
    const productVariants = await this.prisma.client.productVariants({
      where: {
        product: {
          id: product.id,
        },
      },
    })

    const bagItem = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id_in: productVariants.map(a => a.id),
        },
        saved: true,
      },
    })

    return bagItem.length > 0
  }

  async upsertProduct(input) {
    const brand = await this.prisma.client.brand({ id: input.brandID })
    const color = await this.prisma.client.color({ id: input.colorID })
    const model = await this.prisma.client.productModel({ id: input.modelID })
    const productFunctions = await Promise.all(
      input.functions.map(
        async functionName =>
          await this.prisma.client.upsertProductFunction({
            create: { name: functionName },
            update: { name: functionName },
            where: { name: functionName },
          })
      )
    )
    const functionIDs = productFunctions
      .filter(Boolean)
      .map((func: ProductFunction) => ({ id: func.id }))
    const slug = await this.productUtils.getProductSlug(
      brand.brandCode,
      input.name,
      color.name
    )

    const imageURLs: string[] = await Promise.all(
      input.images.map(async (image, index) => {
        const s3ImageName = await this.productUtils.getProductImageName(
          brand.brandCode,
          input.name,
          index + 1
        )
        return await this.imageService.uploadImage(image, {
          imageName: s3ImageName,
        })
      })
    )
    const imageIDs = await this.productUtils.getImageIDsForURLs(imageURLs)

    const modelSize = await this.productUtils.upsertModelSize({
      slug,
      type: input.type,
      modelSizeName: input.modelSizeName,
      modelSizeDisplay: input.modelSizeDisplay,
      bottomSizeType: input.bottomSizeType,
    })

    const tagIDs: { id: string }[] = await Promise.all(
      input.tags.map(async tag => {
        const prismaTag = await this.prisma.client.upsertTag({
          create: { name: tag },
          update: { name: tag },
          where: { name: tag },
        })
        return { id: prismaTag.id }
      })
    )

    const productData = {
      slug,
      name,
      brand: {
        connect: { id: input.brandID },
      },
      category: {
        connect: { id: input.categoryID },
      },
      type: input.type,
      description: input.description,
      images: {
        connect: imageIDs,
      },
      modelHeight: model.height,
      retailPrice: input.retailPrice,
      model: {
        connect: { id: model.id },
      },
      modelSize: {
        connect: { id: modelSize.id },
      },
      color: {
        connect: { id: input.colorID },
      },
      secondaryColor: {
        connect: { id: input.secondaryColorID },
      },
      tags: {
        connect: tagIDs,
      },
      functions: {
        connect: functionIDs,
      },
      innerMaterials: { set: input.innerMaterials },
      outerMaterials: { set: input.outerMaterials },
      status: input.status,
      season: input.season,
      architecture: input.architecture,
    }
    const productCreateData = {
      ...productData,
      variants: {
        create: input.variants.map(variant =>
          this.getVariantData(
            variant,
            input.type,
            input.colorID,
            input.slug,
            input.retailPrice,
            true
          )
        ),
      },
    }
    const productUpdateData = {
      ...productData,
      variants: {
        upsert: input.variants.map(variant => ({
          create: this.getVariantData(
            variant,
            input.type,
            input.colorID,
            input.slug,
            input.retailPrice,
            true
          ),
          update: this.getVariantData(
            variant,
            input.type,
            input.colorID,
            input.slug,
            input.retailPrice,
            false
          ),
          where: { sku: variant.sku },
        })),
      },
    }
    const product = await this.prisma.client.upsertProduct({
      create: productCreateData,
      update: productUpdateData,
      where: { slug },
    })
    return product
  }

  async getVariantData(variant, type, colorID, slug, retailPrice, isCreate) {
    const internalSize = await this.productUtils.deepUpsertSize({
      slug: `${variant.sku}-internal`,
      type,
      display: variant.internalSizeName,
      topSizeData: type === "Top" && {
        letter: (variant.internalSizeName as LetterSize) || null,
        sleeve: variant.sleeve,
        shoulder: variant.shoulder,
        chest: variant.chest,
        neck: variant.neck,
        length: variant.length,
      },
      bottomSizeData: type === "Bottom" && {
        type: (variant.bottomSizeType as BottomSizeType) || null,
        value: variant.internalSizeName || "",
        waist: variant.waist,
        rise: variant.rise,
        hem: variant.hem,
        inseam: variant.inseam,
      },
    })

    let physicalProductsData
    if (isCreate) {
      physicalProductsData = { create: variant.physicalProducts }
    } else {
      physicalProductsData = {
        upsert: variant.physicalProducts.map(physicalProduct => ({
          create: physicalProduct,
          update: physicalProduct,
          where: { seasonsUID: physicalProduct.seasonsUID },
        })),
      }
    }

    return {
      sku: variant.sku,
      color: {
        connect: { id: colorID },
      },
      internalSize: {
        connect: { id: internalSize.id },
      },
      weight: variant.weight,
      productID: slug,
      retailPrice,
      total: variant.total,
      reservable: status === "Available" ? variant.total : 0,
      reserved: 0,
      nonReservable: status === "NotAvailable" ? variant.total : 0,
      physicalProducts: physicalProductsData,
    }
  }

  async saveProduct(item, save, info, customer) {
    const bagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id: item,
          },
          saved: true,
        },
      },
      info
    )
    let bagItem: BagItem = head(bagItems)

    if (bagItem && !save) {
      await this.prisma.client.deleteBagItem({
        id: bagItem.id,
      })
    } else if (!bagItem && save) {
      bagItem = await this.prisma.client.createBagItem({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        productVariant: {
          connect: {
            id: item,
          },
        },
        position: 0,
        saved: save,
        status: "Added",
      })
    }

    if (save) {
      return this.prisma.binding.query.bagItem(
        {
          where: {
            id: bagItem.id,
          },
        },
        info
      )
    }

    return bagItem ? bagItem : null
  }

  async checkItemsAvailability(items, customer) {
    const reservedBagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id_in: items,
          },
          status_not: "Added",
        },
      },
      `{
        productVariant {
          id
        }
      }`
    )

    const reservedIds = reservedBagItems.map(a => a.productVariant.id)
    const newItems = items.filter(a => !reservedIds.includes(a))

    await this.productVariantService.updateProductVariantCounts(newItems, {
      dryRun: true,
    })

    return true
  }

  async getGeneratedVariantSKUs({ input }) {
    const { brandID, colorID, sizeNames } = input
    const brand = await this.prisma.client.brand({ id: brandID })
    const color = await this.prisma.client.color({ id: colorID })

    if (!brand || !color) {
      return null
    }

    const brandCount = await this.prisma.client
      .productsConnection({
        where: { brand: { id: brandID } },
      })
      .aggregate()
      .count()
    if (brandCount === null) {
      return null
    }

    const styleNumber = brandCount + 1
    const styleCode = styleNumber.toString().padStart(3, "0")
    return sizeNames.map(sizeName => {
      const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
      return `${brand.brandCode}-${color.colorCode}-${sizeCode}-${styleCode}`
    })
  }

  async updateProduct(
    where: ProductWhereUniqueInput,
    { status, ...data }: ProductUpdateInput,
    info: GraphQLResolveInfo
  ) {
    await this.storeProductIfNeeded(where, status)
    await this.prisma.client.updateProduct({ where, data: { status, ...data } })
    return await this.prisma.binding.query.product({ where }, info)
  }

  /**
   * Checks if all downstream physical products have been offloaded.
   * If so, marks the product as offloaded.
   */
  async offloadProductIfAppropriate(id: ID_Input) {
    const downstreamPhysProds = this.productUtils.physicalProductsForProduct(
      await this.prisma.binding.query.product(
        { where: { id } },
        `{
          variants {
            physicalProducts {
              inventoryStatus
            }
          }
         }`
      )
    )
    const allPhysProdsOffloaded = downstreamPhysProds.reduce(
      (acc, curPhysProd: { inventoryStatus: InventoryStatus }) =>
        acc && curPhysProd.inventoryStatus === "Offloaded",
      true
    )
    if (allPhysProdsOffloaded) {
      await this.prisma.client.updateProduct({
        where: { id },
        data: { status: "Offloaded" },
      })
    }
  }

  private async storeProductIfNeeded(
    where: ProductWhereUniqueInput,
    status: ProductStatus
  ) {
    const productBeforeUpdate = await this.prisma.binding.query.product(
      {
        where,
      },
      `{
          id
          status
          variants {
            id
            total
            offloaded
            reserved
            physicalProducts {
              inventoryStatus
              seasonsUID
            }
          }
        }`
    )
    if (status === "Stored" && productBeforeUpdate.status !== "Stored") {
      // Update product status
      await this.prisma.client.updateProduct({
        where: { id: productBeforeUpdate.id },
        data: { status: "Stored" },
      })

      // Update statuses on downstream physical products
      for (const {
        inventoryStatus,
        seasonsUID,
      } of this.productUtils.physicalProductsForProduct(
        productBeforeUpdate as ProductWithPhysicalProducts
      )) {
        if (!["Offloaded", "Reserved"].includes(inventoryStatus)) {
          await this.prisma.client.updatePhysicalProduct({
            where: { seasonsUID },
            data: { inventoryStatus: "Stored" },
          })
        }
      }

      // Update counts on downstream product variants
      for (const prodVar of productBeforeUpdate.variants) {
        const numUnitsStored = (
          await this.prisma.client.physicalProducts({
            where: {
              AND: [
                { productVariant: { id: prodVar.id } },
                { inventoryStatus: "Stored" },
              ],
            },
          })
        ).length
        await this.prisma.client.updateProductVariant({
          where: { id: prodVar.id },
          data: {
            nonReservable:
              prodVar.total -
              prodVar.offloaded -
              prodVar.reserved -
              numUnitsStored,
            stored: numUnitsStored,
            reservable: 0,
          },
        })
      }
    }
  }
}
