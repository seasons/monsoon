import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  BottomSizeCreateInput,
  BottomSizeType,
  Customer,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
  ProductCreateInput,
  ProductFunction,
  ProductStatus,
  ProductType,
  ProductUpdateInput,
  ProductVariantCreateWithoutProductInput,
  ProductWhereUniqueInput,
  RecentlyViewedProduct,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { GraphQLResolveInfo } from "graphql"
import { head, pick } from "lodash"

import { UtilsService } from "../../Utils/services/utils.service"
import { ProductWithPhysicalProducts } from "../product.types"
import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly physicalProductUtils: PhysicalProductUtilsService,
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

  async deepUpsertProduct(input) {
    // get records whose associated data we need for other parts of the upsert
    const brand = await this.prisma.client.brand({ id: input.brandID })
    const color = await this.prisma.client.color({ id: input.colorID })
    const model = await this.prisma.client.productModel({ id: input.modelID })

    // Get the functionIDs which we will connect to the product
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

    // Generate the product slug
    const slug = await this.productUtils.getProductSlug(
      brand.brandCode,
      input.name,
      color.name
    )

    // Store images and get their record ids to connect to the product
    const imageDatas: ImageData[] = await Promise.all(
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
    const imageIDs = await this.productUtils.getImageIDs(imageDatas)

    // Deep upsert the model size
    const modelSize = await this.productUtils.upsertModelSize({
      slug,
      type: input.type,
      modelSizeName: input.modelSizeName,
      modelSizeDisplay: input.modelSizeDisplay,
      bottomSizeType: input.bottomSizeType,
    })

    // Create all necessary tag records
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

    const data = {
      slug,
      ...pick(input, [
        "name",
        "type",
        "description",
        "retailPrice",
        "status",
        "season",
        "architecture",
      ]),
      brand: {
        connect: { id: input.brandID },
      },
      category: {
        connect: { id: input.categoryID },
      },
      images: {
        connect: imageIDs,
      },
      modelHeight: model.height,
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
    }
    const product = await this.prisma.client.upsertProduct({
      create: data,
      update: data,
      where: { slug },
    })
    await Promise.all(
      input.variants.map(a =>
        this.deepUpsertProductVariant({
          variant: a,
          productID: product.id,
          ...pick(input, ["type", "colorID", "retailPrice", "status"]),
        })
      )
    )
    return product
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

  /**
   * Deep upserts a product variant, including deep upserts for the child size record
   * and upsert for the child physical product records
   * @param variant of type UpsertVariantInput from productVariant.graphql
   * @param type type of the parent Product
   * @param colorID: colorID for the color record to attach
   * @param retailPrice: retailPrice of the product variant
   * @param productID: id of the parent product
   */
  private async deepUpsertProductVariant({
    variant,
    type,
    colorID,
    retailPrice,
    productID,
    status,
  }: {
    variant
    type: ProductType
    colorID: ID_Input
    retailPrice: number
    productID: string
    status: ProductStatus
  }) {
    const internalSize = await this.productUtils.deepUpsertSize({
      slug: `${variant.sku}-internal`,
      type,
      display: variant.internalSizeName,
      topSizeData: type === "Top" && {
        letter: (variant.internalSizeName as LetterSize) || null,
        ...pick(variant, ["sleeve", "shoulder", "bamboo", "neck", "length"]),
      },
      bottomSizeData: type === "Bottom" && {
        type: (variant.bottomSizeType as BottomSizeType) || null,
        value: variant.internalSizeName || "",
        ...pick(variant, ["waist", "rise", "hem", "inseam"]),
      },
    })

    const data = {
      productID,
      product: { connect: { id: productID } },
      color: {
        connect: { id: colorID },
      },
      internalSize: {
        connect: { id: internalSize.id },
      },
      retailPrice,
      reservable: status === "Available" ? variant.total : 0,
      reserved: 0,
      nonReservable: status === "NotAvailable" ? variant.total : 0,
      offloaded: 0,
      stored: 0,
      ...pick(variant, ["weight", "total", "sku"]),
      physicalProducts: {
        connect: await Promise.all(
          variant.physicalProducts.map(a =>
            this.prisma.client.upsertPhysicalProduct({
              where: { seasonsUID: a.seasonsUID },
              create: a,
              update: a,
            })
          )
        ),
      },
    }

    const prodVar = await this.prisma.client.upsertProductVariant({
      where: { sku: variant.sku },
      create: data,
      update: data,
    })

    return prodVar
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
