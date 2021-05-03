import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BottomSizeType,
  CustomerWhereUniqueInput,
  ID_Input,
  InventoryStatus,
  LetterSize,
  Product,
  ProductFunction,
  ProductStatus,
  ProductTier,
  ProductType,
  ProductVariant,
  ProductWhereUniqueInput,
  RecentlyViewedProduct,
  Tag,
} from "@prisma/index"
import {
  Customer,
  Product as PrismaBindingProduct,
  ProductVariantConnection,
} from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"
import { GraphQLResolveInfo } from "graphql"
import { head, pick, tail } from "lodash"
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
      color.name,
      input.createNew
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
        modelSizeDisplay: input.modelSizeDisplay,
        sizeType: input.modelSizeType,
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
    console.log("297", "about to call upsert product")
    const product = await this.prisma.client.upsertProduct({
      create: data,
      update: data,
      where: { slug },
    })
    console.log("297", "finished calling upsert product")

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
          ...pick(input, [
            "type",
            "colorCode",
            "retailPrice",
            "status",
            "buyUsedEnabled",
            "buyUsedPrice",
          ]),
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
    const { brandID, colorCode, sizeNames, productID } = input
    const skuData = await this.getSKUData({ brandID, colorCode, productID })
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

  async getGeneratedSeasonsUIDs({ brandID, colorCode, sizes, productID }) {
    const skuData = await this.getSKUData({ brandID, colorCode, productID })
    if (!skuData) {
      return null
    }

    const { brandCode, styleCode } = skuData

    return sizes
      .map(({ internalSize, manufacturerSize, count }) => {
        // FIXME: eventually we may want to create the sizeCode using the manufacturer name
        const sizeCode = this.utils.sizeNameToSizeCode(internalSize)
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

  async availableProductVariantsConnectionForCustomer(
    customerID: string,
    info: GraphQLResolveInfo,
    args: any
  ) {
    const customer = await this.prisma.binding.query.customer(
      {
        where: { id: customerID },
      },
      `{
        id
        detail {
          topSizes
          waistSizes
        }
      }`
    )

    return (await this.prisma.binding.query.productVariantsConnection(
      {
        ...args,
        where: {
          OR: [
            {
              AND: [
                {
                  internalSize: {
                    top: {
                      letter_in: customer.detail.topSizes,
                    },
                  },
                },
                { reservable_gte: 1 },
                {
                  product: {
                    AND: [{ status: "Available" }, { type: "Top" }],
                  },
                },
              ],
            },
            {
              AND: [
                {
                  internalSize: {
                    display_in: customer.detail.waistSizes.map(a => `${a}`),
                  },
                },
                { reservable_gte: 1 },
                {
                  product: {
                    AND: [{ status: "Available" }, { type: "Bottom" }],
                  },
                },
              ],
            },
          ],
        },
      },
      info
    )) as ProductVariantConnection
  }

  async availableProductVariantsForCustomer(
    where: CustomerWhereUniqueInput,
    info: GraphQLResolveInfo
  ) {
    const customer = (await this.prisma.binding.query.customer(
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
    )) as Customer

    return (await this.prisma.binding.query.productVariants(
      {
        where: {
          OR: [
            {
              AND: [
                {
                  internalSize: {
                    top: {
                      letter_in: customer.detail.topSizes as LetterSize[],
                    },
                  },
                },
                { reservable_gte: 1 },
                {
                  product: {
                    AND: [{ status: "Available" }, { type: "Top" }],
                  },
                },
              ],
            },
            {
              AND: [
                {
                  internalSize: {
                    display_in: customer.detail.waistSizes.map(a => `${a}`),
                  },
                },
                { reservable_gte: 1 },
                {
                  product: {
                    AND: [{ status: "Available" }, { type: "Bottom" }],
                  },
                },
              ],
            },
          ],
        },
      },
      info
    )) as ProductVariant[]
  }

  async getSKUData({ brandID, colorCode, productID }) {
    const brand = await this.prisma.client.brand({ id: brandID })
    const color = await this.prisma.client.color({ colorCode })

    if (!brand || !color) {
      return null
    }

    let styleNumber
    if (!!productID) {
      // valid style code if variants exist on the product, null otherwise
      styleNumber = await this.productUtils.getProductStyleCode(productID)
      if (!styleNumber) {
        throw new Error(`No style number found for productID: ${productID}`)
      }
    } else {
      const allStyleCodesForBrand = (
        await this.productUtils.getAllStyleCodesForBrand(brandID)
      ).sort()
      const highestStyleNumber = Number(allStyleCodesForBrand.pop()) || 0
      styleNumber = highestStyleNumber + 1
    }

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
      internalSizeType,
      functions,
      images,
      modelSizeDisplay,
      modelSizeName,
      modelSizeType,
      tags,
      status,
      variants,
      photographyStatus,
      season,
      buyUsedEnabled,
      buyUsedPrice,
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
            physicalProducts {
              id
            }
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
        modelSizeDisplay,
        sizeType: modelSizeType,
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

    if (buyUsedEnabled != null || buyUsedPrice != null) {
      await Promise.all(
        product?.variants
          ?.flatMap(variant => variant.physicalProducts)
          ?.map(physicalProduct =>
            this.prisma.client.updatePhysicalProduct({
              where: {
                id: physicalProduct.id,
              },
              data: {
                price: {
                  upsert: {
                    create: {
                      buyUsedEnabled,
                      buyUsedPrice,
                    },
                    update: {
                      buyUsedEnabled,
                      buyUsedPrice,
                    },
                  },
                },
              },
            })
          )
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
    buyUsedEnabled,
    buyUsedPrice,
  }: {
    sequenceNumbers
    variant
    type: ProductType
    colorCode: string
    retailPrice?: number
    productID: string
    status: ProductStatus
    buyUsedEnabled?: boolean
    buyUsedPrice?: number
  }) {
    const internalSize = await this.productUtils.deepUpsertSize({
      slug: `${variant.sku}-internal`,
      type,
      display: variant.internalSizeName,
      topSizeData: type === "Top" && {
        // TODO: letter is deprecated, can eventually remove
        letter: (variant.internalSizeName as LetterSize) || null,
        ...pick(variant, ["sleeve", "shoulder", "chest", "neck", "length"]),
      },
      bottomSizeData: type === "Bottom" && {
        // TODO: type and value are deprecated, can eventually remove
        type: (variant.internalSizeType as BottomSizeType) || null,
        value: variant.internalSizeName || "",
        ...pick(variant, ["waist", "rise", "hem", "inseam"]),
      },
      sizeType: variant.internalSizeType,
    })

    const manufacturerSizeIDs = await this.productVariantService.getManufacturerSizeIDs(
      variant,
      type
    )

    const displayShort = await this.productUtils.getVariantDisplayShort(
      manufacturerSizeIDs,
      internalSize.id
    )

    const shopifyProductVariant = variant.shopifyProductVariant
    const shopifyProductVariantCreateData =
      shopifyProductVariant && shopifyProductVariant.externalId
        ? {
            shopifyProductVariant: {
              connect: variant.shopifyProductVariant,
            },
          }
        : {}
    const shopifyProductVariantUpdateData =
      shopifyProductVariant && shopifyProductVariant.externalId
        ? {
            shopifyProductVariant: {
              connect: variant.shopifyProductVariant,
            },
          }
        : shopifyProductVariant
        ? {
            shopifyProductVariant: {
              disconnect: true,
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
      create: {
        ...data,
        ...shopifyProductVariantCreateData,
        manufacturerSizes: manufacturerSizeIDs && {
          connect: manufacturerSizeIDs,
        },
      },
      update: {
        ...data,
        ...shopifyProductVariantUpdateData,
        manufacturerSizes: manufacturerSizeIDs && {
          set: manufacturerSizeIDs,
        },
      },
    })

    variant.physicalProducts.forEach(async (physProdData, index) => {
      const sequenceNumber = sequenceNumbers[index]
      const price =
        buyUsedPrice == null && buyUsedEnabled == null
          ? physProdData.price || variant.price
          : { buyUsedEnabled, buyUsedPrice }
      await this.prisma.client.upsertPhysicalProduct({
        where: { seasonsUID: physProdData.seasonsUID },
        create: {
          ...physProdData,
          sequenceNumber,
          productVariant: { connect: { id: prodVar.id } },
          ...(price && {
            price: {
              create: price,
            },
          }),
        },
        update: {
          ...physProdData,
          ...(price && {
            price: {
              upsert: {
                update: price,
                create: price,
              },
            },
          }),
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

  async newestBrandProducts(args, info): Promise<[Product]> {
    const newestProducts = await this.prisma.binding.query.products(
      {
        where: {
          AND: [{ tags_none: { name: "Vintage" } }, { status: "Available" }],
        },
        orderBy: "publishedAt_DESC",
        first: 1,
      },
      `{
        id
        brand {
          id
        }
      }`
    )

    const newestProduct = head(newestProducts)

    if (!newestProduct) {
      return null
    }

    return await this.prisma.binding.query.products(
      {
        ...args,
        where: {
          AND: [
            { brand: { id: newestProduct.brand.id } },
            { status: "Available" },
          ],
        },
        orderBy: "publishedAt_DESC",
      },
      info
    )
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

  private validateInternalBottomSizeName(sizeName) {
    if (!sizeName.match(bottomSizeRegex)) {
      throw new Error(`Invalid bottom size name: ${sizeName}`)
    }
  }
}
