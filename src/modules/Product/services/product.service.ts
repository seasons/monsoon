import * as url from "url"

import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { S3_BASE } from "@modules/Image/services/image.service"
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
  ProductFunction,
  ProductStatus,
  ProductType,
  ProductUpdateInput,
  ProductWhereUniqueInput,
  RecentlyViewedProduct,
  Tag,
} from "@prisma/index"
import { Product as PrismaBindingProduct } from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"
import { GraphQLResolveInfo } from "graphql"
import { head, pick } from "lodash"
import { DateTime } from "luxon"

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
    const products = await this.prisma.binding.query.products(
      { ...args, ...queryOptions },
      info
    )
    return products
  }

  async getProductsConnection(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    const products = await this.prisma.binding.query.productsConnection(
      { ...args, ...queryOptions },
      info
    )
    return products
  }

  async publishProducts(productIDs) {
    const productsWithData = await this.prisma.binding.query.products(
      {
        where: {
          id_in: productIDs,
        },
      },
      `{
        id
        photographyStatus
        variants {
          id
        }
      }`
    )

    const validatedIDs = []
    const unvalidatedIDs = []

    productIDs.forEach(async id => {
      const product = productsWithData.find(p => p.id === id)
      if (product.variants?.length && product.photographyStatus === "Done") {
        validatedIDs.push(id)
        await this.prisma.client.updateProduct({
          where: { id },
          data: {
            status: "Available",
            publishedAt: DateTime.local().toISO(),
          },
        })
      } else {
        unvalidatedIDs.push(id)
      }
    })

    let message
    let status
    if (productIDs.length === validatedIDs.length) {
      message = "Successfully published all products."
      status = "success"
    } else {
      message = `Some of the products weren't published, check that these products have variants and their photography status is complete: ${unvalidatedIDs.join(
        ", "
      )}.`
      status = "error"
    }

    return {
      message,
      unvalidatedIDs,
      validatedIDs,
      status,
    }
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
    const color = await this.prisma.client.color({ colorCode: input.colorCode })
    const model =
      input.modelID &&
      (await this.prisma.client.productModel({ id: input.modelID }))

    // Get the functionIDs which we will connect to the product
    const functionIDs = await this.upsertFunctions(input.functions)

    // Generate the product slug
    const slug = await this.productUtils.getProductSlug(
      brand.brandCode,
      input.name,
      color.name
    )

    // Store images and get their record ids to connect to the product
    const imageDatas: ImageData[] = await Promise.all(
      input.images.map((image, index) => {
        const s3ImageName = this.productUtils.getProductImageName(
          brand.brandCode,
          input.name,
          color.name,
          index + 1
        )
        return this.imageService.uploadImage(image, {
          imageName: s3ImageName,
        })
      })
    )
    const imageIDs = await this.productUtils.getImageIDs(imageDatas, slug)

    // Deep upsert the model size
    let modelSize
    if (input.modelSizeDisplay && input.modelSizeName) {
      modelSize = await this.productUtils.upsertModelSize({
        slug,
        type: input.type,
        modelSizeName: input.modelSizeName,
        modelSizeDisplay: input.modelSizeDisplay,
        bottomSizeType: input.bottomSizeType,
      })
    }

    // Create all necessary tag records
    const tagIDs = await this.upsertTags(input.tags)

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
        connect: { name: input.categoryName },
      },
      images: {
        connect: imageIDs,
      },
      materialCategory: input.materialCategorySlug && {
        connect: { slug: input.materialCategorySlug },
      },
      modelHeight: model && model.height,
      model: model && {
        connect: { id: model.id },
      },
      modelSize: modelSize && {
        connect: { id: modelSize.id },
      },
      color: {
        connect: { colorCode: input.colorCode },
      },
      secondaryColor: input.secondaryColorCode && {
        connect: { colorCode: input.secondaryColorCode },
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
          ...pick(input, ["type", "colorCode", "retailPrice", "status"]),
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
    const { brandID, colorCode, sizeNames } = input
    const skuData = await this.getSKUData({ brandID, colorCode })
    if (!skuData) {
      return null
    }

    const { brandCode, styleCode } = skuData

    return sizeNames.map(sizeName => {
      const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
      return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
    })
  }

  async getGeneratedSeasonsUIDs({ brandID, colorCode, sizes }) {
    const skuData = await this.getSKUData({ brandID, colorCode })
    if (!skuData) {
      return null
    }

    const { brandCode, styleCode } = skuData

    return sizes
      .map(({ sizeName, count }) => {
        const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
        return Array.from(Array(count).keys()).map((_, index) => {
          const physicalProductIndex = `${index + 1}`.padStart(2, "0")
          return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}-${physicalProductIndex}`
        })
      })
      .flat()
  }

  async getSKUData({ brandID, colorCode }) {
    const brand = await this.prisma.client.brand({ id: brandID })
    const color = await this.prisma.client.color({ colorCode })

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
    return {
      brandCode: brand.brandCode,
      styleCode,
    }
  }

  async updateProduct({
    where,
    data,
    info,
  }: {
    where: ProductWhereUniqueInput
    data: any // for convenience
    info: GraphQLResolveInfo
  }) {
    // Extract custom fields out
    const {
      bottomSizeType,
      functions,
      images,
      modelSizeDisplay,
      modelSizeName,
      tags,
      status,
      ...updateData
    } = data
    let functionIDs
    let imageIDs
    let modelSizeID
    let tagIDs
    const product: PrismaBindingProduct = await this.prisma.binding.query.product(
      { where },
      `{
          id
          name
          slug
          type
          status
          brand {
            id
            brandCode
          }
          color {
            id
            name
          }
        }`
    )
    // For now, throw an error if trying to unstore a product. We need to
    // add code to handle this case properly.
    if (product.status === "Stored" && status !== "Stored") {
      throw new ApolloError(
        "Unable to unstore a product. Code needs to be written"
      )
    }
    if (functions) {
      functionIDs = await this.upsertFunctions(functions)
    }
    if (tags) {
      tagIDs = await this.upsertTags(tags)
    }
    if (modelSizeName && modelSizeDisplay) {
      const modelSize = await this.productUtils.upsertModelSize({
        slug: product.slug,
        type: product.type,
        modelSizeName,
        modelSizeDisplay,
        bottomSizeType,
      })
      modelSizeID = modelSize.id
    }
    if (images) {
      imageIDs = await this.upsertImages(images, product)
    }
    await this.storeProductIfNeeded(where, status)
    await this.prisma.client.updateProduct({
      where,
      data: {
        ...updateData,
        functions: functionIDs && { set: functionIDs },
        images: imageIDs && { set: imageIDs },
        modelSize: modelSizeID && { connect: { id: modelSizeID } },
        tags: tagIDs && { set: tagIDs },
        status,
      },
    })
    if (!!status) {
      await this.prisma.client.createProductStatusChange({
        old: product.status,
        new: status,
        product: { connect: { id: product.id } },
      })
    }

    return await this.prisma.binding.query.product({ where }, info)
  }

  /**
   * Checks if all downstream physical products have been offloaded.
   * If so, marks the product as offloaded.
   */
  async offloadProductIfAppropriate(id: ID_Input) {
    const prodWithPhysicalProducts = await this.prisma.binding.query.product(
      { where: { id } },
      `{
        status
        variants {
          physicalProducts {
            inventoryStatus
          }
        }
       }`
    )
    const downstreamPhysProds = this.productUtils.physicalProductsForProduct(
      prodWithPhysicalProducts as ProductWithPhysicalProducts
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
      await this.prisma.client.createProductStatusChange({
        old: prodWithPhysicalProducts.status,
        new: "Offloaded",
        product: { connect: { id } },
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
  async deepUpsertProductVariant({
    variant,
    type,
    colorCode,
    retailPrice,
    productID,
    status,
  }: {
    variant
    type: ProductType
    colorCode: string
    retailPrice?: number
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

    const manufacturerSizeIDs: { id: string }[] | null =
      variant.manufacturerSizeNames &&
      (await Promise.all(
        variant.manufacturerSizeNames?.map(async sizeName => {
          // sizeName is of the format "[size type] [size value]"", i.e. "WxL 32x30"
          const [sizeType, sizeValue] = sizeName.split(" ")
          const slug = `${variant.sku}-manufacturer-${sizeValue.replace(
            "x",
            ""
          )}`
          const size = await this.productUtils.deepUpsertSize({
            slug,
            type,
            display: sizeName,
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

    const data = {
      productID,
      product: { connect: { id: productID } },
      color: {
        connect: { colorCode },
      },
      internalSize: {
        connect: { id: internalSize.id },
      },
      manufacturerSizes: manufacturerSizeIDs && {
        connect: manufacturerSizeIDs,
      },
      retailPrice,
      reservable: status === "Available" ? variant.total : 0,
      reserved: 0,
      nonReservable: status === "NotAvailable" ? variant.total : 0,
      offloaded: 0,
      stored: 0,
      ...pick(variant, ["weight", "total", "sku"]),
    }

    const prodVar = await this.prisma.client.upsertProductVariant({
      where: { sku: variant.sku },
      create: data,
      update: data,
    })

    for (const physProdData of variant.physicalProducts) {
      await this.prisma.client.upsertPhysicalProduct({
        where: { seasonsUID: physProdData.seasonsUID },
        create: {
          ...physProdData,
          sequenceNumber: await this.physicalProductUtils.nextSequenceNumber(),
          productVariant: { connect: { id: prodVar.id } },
        },
        update: physProdData,
      })
    }

    return prodVar
  }

  private async upsertFunctions(
    functions: string[]
  ): Promise<{ id: ID_Input }[]> {
    const productFunctions = await Promise.all(
      functions.map(
        async functionName =>
          await this.prisma.client.upsertProductFunction({
            create: { name: functionName },
            update: { name: functionName },
            where: { name: functionName },
          })
      )
    )
    return productFunctions
      .filter(Boolean)
      .map((func: ProductFunction) => ({ id: func.id }))
  }

  private async upsertTags(tags: string[]): Promise<{ id: ID_Input }[]> {
    const prismaTags = await Promise.all(
      tags.map(
        async tag =>
          await this.prisma.client.upsertTag({
            create: { name: tag },
            update: { name: tag },
            where: { name: tag },
          })
      )
    )
    return prismaTags.filter(Boolean).map((tag: Tag) => ({ id: tag.id }))
  }

  /**
   * Upserts images for a given product, uploading new ones to S3 when needed.
   * The [images] argument is either an imageURL or an image file object
   * @param images of type (string | File)[]
   * @param product: of type Product as is defined in prisma.binding
   */
  private async upsertImages(
    images: any[],
    product: PrismaBindingProduct
  ): Promise<{ id: ID_Input }[]> {
    const imageDatas = await Promise.all(
      images.map(async (image, index) => {
        const data = await image
        if (typeof data === "string") {
          // This means that we received an image URL in which case
          // we just have perfom an upsertImage with the url

          // This URL is sent by the client which means it an Imgix URL.
          // Thus, we need to convert it to s3 format and strip any query params as needed.
          const s3BaseURL = S3_BASE.replace(/\/$/, "") // Remove trailing slash
          const s3ImageURL = `${s3BaseURL}${url.parse(data).pathname}`
          const prismaImage = await this.prisma.client.upsertImage({
            create: { url: s3ImageURL, title: product.slug },
            update: { url: s3ImageURL, title: product.slug },
            where: { url: s3ImageURL },
          })
          return { id: prismaImage.id }
        } else {
          // This means that we received a new image in the form of
          // a file in which case we have to upload the image to S3

          // Form appropriate image name
          const s3ImageName = await this.productUtils.getProductImageName(
            product.brand.brandCode,
            product.name,
            product.color.name,
            index + 1
          )

          // Upload to S3 and retrieve metadata
          const { height, url, width } = await this.imageService.uploadImage(
            data,
            {
              imageName: s3ImageName,
            }
          )

          // Purge this image url in imgix cache
          await this.imageService.purgeS3ImageFromImgix(url)

          // Upsert the image with the s3 image url
          const prismaImage = await this.prisma.client.upsertImage({
            create: { height, url, width, title: product.slug },
            update: { height, width, title: product.slug },
            where: { url },
          })
          return { id: prismaImage.id }
        }
      })
    )
    return imageDatas
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
      // Don't create a `ProductStatusChange` record here because this function should
      // only be called from the `updateProduct` function, which handles the creation of that record.
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
          await this.prisma.client.createPhysicalProductInventoryStatusChange({
            old: inventoryStatus,
            new: "Stored",
            physicalProduct: { connect: { seasonsUID } },
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
