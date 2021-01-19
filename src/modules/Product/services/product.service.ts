import * as url from "url"

import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { S3_BASE } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BottomSizeType,
  Customer,
  CustomerWhereUniqueInput,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
  ProductFunction,
  ProductStatus,
  ProductTier,
  ProductTierName,
  ProductType,
  ProductVariant,
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
import { bottomSizeRegex } from "../constants"
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
    // Bottom size name validation
    if (input.type === "Bottom") {
      for (const variant of input.variants) {
        this.validateInternalBottomSizeName(variant.internalSizeName)
      }
    }

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

    const { season } = input
    const productSeason =
      season && (await this.upsertProductSeason(season, slug))

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
        "photographyStatus",
        "buyNewEnabled",
      ]),
      season: productSeason && { connect: { id: productSeason.id } },
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

    // Add the product tier
    const tier = await this.getProductTier(product)
    await this.prisma.client.updateProduct({
      where: { id: product.id },
      data: { tier: { connect: { id: tier.id } } },
    })

    const sequenceNumbers = await this.physicalProductUtils.groupedSequenceNumbers(
      input.variants
    )

    await Promise.all(
      input.variants.map((a, i) => {
        return this.deepUpsertProductVariant({
          sequenceNumbers: sequenceNumbers[i],
          variant: a,
          productID: slug,
          ...pick(input, ["type", "colorCode", "retailPrice", "status"]),
        })
      })
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
    let bagItem: any = head(bagItems)

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
    const status = await this.prisma.client
      .customer({ id: customer.id })
      .status()

    if (status !== "Active") {
      throw new Error("Your account must be active to reserve items.")
    }

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

    const skus = sizeNames.map(sizeName => {
      const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
      return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
    })

    // This check was added because Judy Turner had some colliding SKUs
    // that most likely arose from a manual record delete. It's hard to say
    // exactly what went wrong, so we just check for collisions
    const collidingVariants = await this.prisma.client.productVariants({
      where: { sku_in: skus },
    })
    if (collidingVariants.length > 0) {
      throw new Error(`SKU collisions: ${collidingVariants.map(a => a.sku)}`)
    }

    return skus
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

  getSizeKey(productType: "Top" | "Bottom") {
    let sizesKey
    let internalSizeWhereInputCreateFunc
    switch (productType) {
      case "Top":
        sizesKey = "topSizes"
        internalSizeWhereInputCreateFunc = sizes => ({
          top: {
            letter_in: sizes,
          },
        })
        break
      case "Bottom":
        sizesKey = "waistSizes"
        internalSizeWhereInputCreateFunc = sizes => ({
          display_in: sizes.map(a => `${a}`), // typecasting,
        })
        break
      default:
        throw new Error(`Invalid product type: ${productType}`)
    }

    return { sizesKey, internalSizeWhereInputCreateFunc }
  }

  async availableProductVariantsForCustomer(
    where: CustomerWhereUniqueInput,
    info: GraphQLResolveInfo
  ) {
    const productTypes = ["Top", "Bottom"]
    const customer = await this.prisma.binding.query.customer(
      {
        where,
      },
      `{
        id
        detail {
          topSizes
          waistSizes
        }
      }`
    )

    let productVariants = [] as ProductVariant[]

    for (const productType of productTypes) {
      const { sizesKey, internalSizeWhereInputCreateFunc } = this.getSizeKey(
        productType as "Top" | "Bottom"
      )

      const preferredSizes = customer.detail[sizesKey]

      const variantsOfType = (await this.prisma.binding.query.productVariants(
        {
          where: {
            AND: [
              {
                internalSize: internalSizeWhereInputCreateFunc(preferredSizes),
              },
              { reservable_gte: 1 },
              {
                product: {
                  AND: [
                    { status: "Available" },
                    { type: productType as ProductType },
                  ],
                },
              },
            ],
          },
        },
        info
      )) as ProductVariant[]

      productVariants = [...productVariants, ...variantsOfType]
    }

    return productVariants
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
      variants,
      photographyStatus,
      season,
      ...updateData
    } = data
    let functionIDs
    let imageIDs
    let modelSizeID
    let tagIDs
    let productSeason
    const product: PrismaBindingProduct = await this.prisma.binding.query.product(
      { where },
      `{
          id
          name
          slug
          type
          status
          variants {
            id
          }
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

    // If they're unstoring, that should be all they're doing
    if (product.status === "Stored" && status !== "Stored") {
      if (Object.keys(data).length !== 1) {
        throw new Error(
          "To reduce the surface area of potential errors, do not make other changes when unstoring a product"
        )
      }
    }

    if (
      !!status &&
      status === "Available" &&
      (!product?.variants?.length || photographyStatus !== "Done")
    ) {
      throw new ApolloError(
        "Can not set product status to Available. Check that there are product variants and the photography status is done."
      )
    }

    if (!!status && status === "Available" && product.status !== "Available") {
      updateData.publishedAt = DateTime.local().toISO()
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

    if (season) {
      productSeason = await this.upsertProductSeason(season, product.slug)
    }

    if (images) {
      // Form appropriate image names
      const imageNames = images.map((_image, index) => {
        return this.productUtils.getProductImageName(
          product.brand.brandCode,
          product.name,
          product.color.name,
          index + 1
        )
      })

      imageIDs = await this.imageService.upsertImages(
        images,
        imageNames,
        product.slug
      )
    }

    await this.storeProductIfNeeded(where, status)
    await this.restoreProductIfNeeded(where, status)
    await this.prisma.client.updateProduct({
      where,
      data: {
        ...updateData,
        functions: functionIDs && { set: functionIDs },
        images: imageIDs && { set: imageIDs },
        modelSize: modelSizeID && { connect: { id: modelSizeID } },
        tags: tagIDs && { set: tagIDs },
        status,
        season: productSeason && { connect: { id: productSeason.id } },
        photographyStatus,
      },
    })

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
    sequenceNumbers,
    variant,
    type,
    colorCode,
    retailPrice,
    productID,
    status,
  }: {
    sequenceNumbers
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
      display: this.internalSizeNameToDisplaySize({
        type,
        sizeName: variant.internalSizeName,
      }),
      topSizeData: type === "Top" && {
        letter: (variant.internalSizeName as LetterSize) || null,
        ...pick(variant, ["sleeve", "shoulder", "chest", "neck", "length"]),
      },
      bottomSizeData: type === "Bottom" && {
        type: (variant.bottomSizeType as BottomSizeType) || null,
        value: variant.internalSizeName || "",
        ...pick(variant, ["waist", "rise", "hem", "inseam"]),
      },
    })

    const manufacturerSizeIDs = await this.productVariantService.getManufacturerSizeIDs(
      variant,
      type
    )

    const displayShort = await this.productUtils.getVariantDisplayShort(
      manufacturerSizeIDs,
      internalSize.id
    )

    const shopifyProductVariantData = variant.shopifyProductVariant
      ? {
          shopifyProductVariant: {
            create: variant.shopifyProductVariant,
          },
        }
      : {}

    const data = {
      displayShort,
      productID,
      product: { connect: { slug: productID } },
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
      ...shopifyProductVariantData,
      ...pick(variant, ["weight", "total", "sku"]),
    }

    const prodVar = await this.prisma.client.upsertProductVariant({
      where: { sku: variant.sku },
      create: data,
      update: data,
    })

    variant.physicalProducts.forEach(async (physProdData, index) => {
      const sequenceNumber = sequenceNumbers[index]
      await this.prisma.client.upsertPhysicalProduct({
        where: { seasonsUID: physProdData.seasonsUID },
        create: {
          ...physProdData,
          sequenceNumber,
          productVariant: { connect: { id: prodVar.id } },
          price: {
            create: physProdData.price || variant.price,
          },
        },
        update: {
          ...physProdData,
          price: {
            upsert: {
              update: physProdData.price || variant.price,
              create: physProdData.price || variant.price,
            },
          },
        },
      })
    })

    return prodVar
  }

  async getProductTier(prod: Product): Promise<ProductTier> {
    const allProductCategories = await this.productUtils.getAllCategories(prod)
    const luxThreshold = allProductCategories
      .map(a => a.name)
      .includes("Outerwear")
      ? 400
      : 300
    const tierName = prod.retailPrice > luxThreshold ? "Luxury" : "Standard"
    const tiers = await this.prisma.client.productTiers({
      where: { tier: tierName },
    })
    return head(tiers)
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

  private async upsertProductSeason(season, productSlug) {
    let internalSeason
    let vendorSeason
    const {
      wearableSeasons,
      internalSeasonSeasonCode,
      internalSeasonYear,
      vendorSeasonSeasonCode,
      vendorSeasonYear,
    } = season
    if (internalSeasonSeasonCode || internalSeasonYear) {
      let where
      if (internalSeasonSeasonCode && internalSeasonYear) {
        where = {
          AND: [
            { year: internalSeasonYear },
            { seasonCode: internalSeasonSeasonCode },
          ],
        }
      } else {
        throw new Error("You must provide both a season and a year")
      }
      const existingSeason = head(
        await this.prisma.binding.query.seasons(
          {
            where,
          },
          `{
            id
        }`
        )
      ) as any
      if (existingSeason?.id) {
        internalSeason = existingSeason
      } else {
        internalSeason = await this.prisma.client.createSeason({
          year: internalSeasonYear,
          seasonCode: internalSeasonSeasonCode,
        })
      }
    }

    if (vendorSeasonSeasonCode || vendorSeasonYear) {
      let where
      if (vendorSeasonSeasonCode && vendorSeasonYear) {
        where = {
          AND: [
            { year: vendorSeasonYear },
            { seasonCode: vendorSeasonSeasonCode },
          ],
        }
      } else {
        throw new Error("You must provide both a season and a year")
      }
      const existingSeason = head(
        await this.prisma.binding.query.seasons(
          {
            where,
          },
          `{
            id
        }`
        )
      ) as any

      if (existingSeason?.id) {
        vendorSeason = existingSeason
      } else {
        vendorSeason = await this.prisma.client.createSeason({
          year: vendorSeasonYear,
          seasonCode: vendorSeasonSeasonCode,
        })
      }
    }

    const product = await this.prisma.binding.query.product(
      {
        where: { slug: productSlug },
      },
      `{
        id
        season {
          id
        }
      }`
    )

    const upsertData = {
      internalSeason: {
        connect: internalSeason && { id: internalSeason?.id },
      },
      vendorSeason: vendorSeason && {
        connect: { id: vendorSeason?.id },
      },
      wearableSeasons: wearableSeasons && { set: wearableSeasons },
    }

    return await this.prisma.client.upsertProductSeason({
      where: { id: product?.season?.id || "" },
      create: upsertData,
      update: upsertData,
    })
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

  private async restoreProductIfNeeded(
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
            physicalProducts {
              inventoryStatus
              seasonsUID
            }
          }
        }`
    )
    if (status !== "Stored" && productBeforeUpdate.status === "Stored") {
      // Update product status
      if (status !== "NotAvailable") {
        throw new Error(
          "When restoring a product, must mark it as NotAvailable"
        )
      }
      await this.prisma.client.updateProduct({
        where: { id: productBeforeUpdate.id },
        data: { status },
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
            data: { inventoryStatus: "NonReservable" },
          })
        }
      }

      // Update counts on downstream product variants
      for (const prodVar of productBeforeUpdate.variants) {
        const numUnitsRestored = (
          await this.prisma.client.physicalProducts({
            where: {
              AND: [
                { productVariant: { id: prodVar.id } },
                { inventoryStatus: "NonReservable" },
              ],
            },
          })
        ).length
        await this.prisma.client.updateProductVariant({
          where: { id: prodVar.id },
          data: {
            nonReservable: numUnitsRestored,
            stored: 0,
          },
        })
      }
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

  private internalSizeNameToDisplaySize({
    type,
    sizeName,
  }: {
    type: ProductType
    sizeName
  }) {
    let displaySize
    switch (type) {
      case "Bottom":
        this.validateInternalBottomSizeName(sizeName)
        displaySize = sizeName.split("x")[0]
        break
      default:
        displaySize = sizeName
    }

    return displaySize
  }

  private validateInternalBottomSizeName(sizeName) {
    if (!sizeName.match(bottomSizeRegex)) {
      throw new Error(`Invalid bottom size name: ${sizeName}`)
    }
  }
}
