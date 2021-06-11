import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  Brand,
  Customer,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  Product,
  ProductTier,
  ProductVariant,
  Season,
  Tag,
} from "@prisma/client"
import {
  BottomSizeType,
  ID_Input,
  InventoryStatus,
  LetterSize,
  ProductFunction,
  ProductStatus,
  ProductType,
  ProductWhereUniqueInput,
  RecentlyViewedProduct,
  SizeType,
} from "@prisma1/index"
import { Product as PrismaBindingProduct } from "@prisma1/prisma.binding"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { GraphQLResolveInfo } from "graphql"
import { flatten, head, pick } from "lodash"
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
    private readonly utils: UtilsService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  async getProducts(args, select) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    const findManyArgs = QueryUtilsService.prismaOneToPrismaTwoArgs(
      {
        ...args,
        ...queryOptions,
      },
      "Product"
    )

    return this.queryUtils.resolveFindMany(
      { ...findManyArgs, select },
      "Product"
    )
  }

  async getProductsConnection(args, select) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)

    return this.queryUtils.resolveConnection(
      { ...args, ...queryOptions, select },
      "Product"
    )
  }

  async publishProducts(productIDs) {
    const productsWithData = await this.prisma.client2.product.findMany({
      where: {
        id: { in: productIDs },
      },
      select: {
        id: true,
        photographyStatus: true,
        variants: { select: { id: true } },
      },
    })

    const validatedIDs = []
    const unvalidatedIDs = []

    productIDs.forEach(async id => {
      const product = productsWithData.find(p => p.id === id)
      if (product.variants?.length && product.photographyStatus === "Done") {
        validatedIDs.push(id)
        await this.prisma.client2.product.update({
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

  async addViewedProduct(
    productId: string,
    customer: Pick<Customer, "id">,
    select: Prisma.RecentlyViewedProductSelect
  ) {
    const viewedProduct = await this.prisma.client2.recentlyViewedProduct.findFirst(
      {
        where: { customer: { id: customer.id }, product: { id: productId } },
        select: { id: true, viewCount: true },
      }
    )

    const priorViewCount = viewedProduct?.viewCount || 0
    const result = await this.prisma.client2.recentlyViewedProduct.upsert({
      where: { id: viewedProduct?.id || "" },
      update: { viewCount: priorViewCount + 1 },
      create: {
        customer: {
          connect: {
            id: customer.id,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
        viewCount: 1,
      },
      select,
    })

    return result
  }

  async createProduct(input, select: Prisma.ProductSelect) {
    this.validateCreateProductInput(input)

    // get records whose associated data we need for other parts of the upsert
    const brand = await this.prisma.client2.brand.findUnique({
      where: { id: input.brandID },
      select: { id: true, brandCode: true },
    })
    const color = await this.prisma.client2.color.findUnique({
      where: { colorCode: input.colorCode },
      select: { name: true },
    })

    // Generate the product slug
    const slug = await this.productUtils.createProductSlug(
      brand.brandCode,
      input.name,
      color.name
    )

    const prodForSlug = await this.prisma.client2.product.findUnique({
      where: { slug },
      select: { id: true, season: { select: { id: true } } },
    })

    const {
      wearableSeasons,
      internalSeasonSeasonCode,
      internalSeasonYear,
      vendorSeasonSeasonCode,
      vendorSeasonYear,
    } = input.season

    const existingInternalSeason =
      !!internalSeasonSeasonCode &&
      (await this.prisma.client2.season.findFirst({
        where: {
          year: internalSeasonYear,
          seasonCode: internalSeasonSeasonCode,
        },
        select: { id: true },
      }))
    const existingVendorSeason =
      !!vendorSeasonSeasonCode &&
      (await this.prisma.client2.season.findFirst({
        where: {
          year: vendorSeasonYear,
          seasonCode: vendorSeasonSeasonCode,
        },
        select: { id: true },
      }))

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

    const modelSizeMutateData = {
      slug,
      productType: input.type,
      display: input.modelSizeDisplay,
      type: input.modelSizeType,
    }

    const createScalarListCreateInput = values =>
      this.queryUtils.createScalarListMutateInput(
        values,
        prodForSlug?.id,
        "create"
      )
    const createData = Prisma.validator<Prisma.ProductCreateInput>()({
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
      functions: {
        connectOrCreate: input.functions.map(name => ({
          create: { name },
          where: { name },
        })),
      },
      brand: {
        connect: { id: input.brandID },
      },
      category: {
        connect: { id: input.categoryID },
      },
      materialCategory: input.materialCategorySlug && {
        connect: { slug: input.materialCategorySlug },
      },
      model: { connect: { id: input.modelID } },
      color: {
        connect: { colorCode: input.colorCode },
      },
      secondaryColor: input.secondaryColorCode && {
        connect: { colorCode: input.secondaryColorCode },
      },
      season: {
        connectOrCreate: {
          where: { id: prodForSlug?.season?.id || "" },
          create: {
            wearableSeasons: this.queryUtils.createScalarListMutateInput(
              wearableSeasons,
              "",
              "create"
            ),
            internalSeason: {
              connectOrCreate: {
                where: { id: existingInternalSeason?.id },
                create: {
                  year: internalSeasonYear,
                  seasonCode: internalSeasonSeasonCode,
                },
              },
            },
            vendorSeason: {
              connectOrCreate: {
                where: { id: existingVendorSeason?.id },
                create: {
                  year: vendorSeasonYear,
                  seasonCode: vendorSeasonSeasonCode,
                },
              },
            },
          },
        },
      },
      images: {
        connectOrCreate: imageDatas.map(a => ({
          where: { url: a.url },
          create: { ...a, title: slug },
        })),
      },
      modelSize: {
        connectOrCreate: {
          where: { slug },
          create: modelSizeMutateData,
        },
      },
      tags: {
        connectOrCreate: input.tags.map(tag => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
      styles: createScalarListCreateInput(input.styles),
      innerMaterials: createScalarListCreateInput(input.innerMaterials),
      outerMaterials: createScalarListCreateInput(input.outerMaterials),
    })

    // TODO: Update the size data to also account for accesories
    const productPromise = this.prisma.client2.product.create({
      data: createData,
    })

    // Add the product tier
    // const tier = await this.getProductTier(product)
    // await this.prisma.client2.product.update({
    //   where: { id: product.id },
    //   data: { tier: { connect: { id: tier.id } } },
    // })

    const sequenceNumbers = await this.physicalProductUtils.groupedSequenceNumbers(
      input.variants
    )

    const variantAndPhysicalProductPromises = flatten(
      input.variants.map((a, i) => {
        return this.getDeepUpsertProductVariantPromises({
          sequenceNumbers: sequenceNumbers[i],
          variant: a,
          productSlug: slug,
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
    ) as PrismaPromise<ProductVariant | PhysicalProduct>[]
    try {
      const [product, ...records] = await this.prisma.client2.$transaction([
        productPromise,
        ...variantAndPhysicalProductPromises,
      ])

      return await this.prisma.client2.product.findUnique({
        where: { id: product.id },
        select,
      })
    } catch (err) {
      return null
    }
  }

  async saveProduct(item, save, select, customer) {
    const _bagItem = await this.prisma.client2.bagItem.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved: true,
      },
      select,
    })
    let bagItem = !!_bagItem && this.prisma.sanitizePayload(_bagItem, "BagItem")

    if (bagItem && !save) {
      await this.prisma.client2.bagItem.delete({
        where: { id: (bagItem as BagItem).id },
      })
    } else if (!bagItem && save) {
      bagItem = await this.prisma.client2.bagItem.create({
        data: {
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
        },
        select,
      })
    }

    return bagItem ? bagItem : null
  }

  async checkItemsAvailability(items, customer: Customer) {
    if (customer.status !== "Active") {
      throw new Error("Your account must be active to reserve items.")
    }

    const _reservedBagItems = await this.prisma.client2.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: { in: items },
        },
        status: { not: "Added" },
      },
      select: { productVariant: { select: { id: true } } },
    })
    const reservedBagItems = this.prisma.sanitizePayload(
      _reservedBagItems,
      "BagItem"
    )

    const reservedIds = reservedBagItems.map(a => a.productVariant.id)
    const newItems = items.filter(a => !reservedIds.includes(a))

    await this.productVariantService.updateProductVariantCounts(
      newItems,
      customer.id,
      {
        dryRun: true,
      }
    )

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
    const collidingVariants = await this.prisma.client2.productVariant.findMany(
      { where: { sku: { in: skus } }, select: { sku: true } }
    )
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
    args: any,
    select: any
  ) {
    const customer = this.prisma.sanitizePayload(
      await this.prisma.client2.customer.findUnique({
        where: { id: customerID },
        select: {
          id: true,
          detail: { select: { topSizes: true, waistSizes: true } },
        },
      }),
      "Product"
    )

    const argsWithCustomerWhere = {
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
    }

    return this.queryUtils.resolveConnection(
      { ...argsWithCustomerWhere, select },
      "ProductVariant"
    )
  }

  async availableProductVariantsForCustomer(
    where: { id: string },
    select: any
  ) {
    const _customer = await this.prisma.client2.customer.findUnique({
      where,
      select: {
        id: true,
        detail: { select: { topSizes: true, waistSizes: true } },
      },
    })
    const customer = this.prisma.sanitizePayload(_customer, "Customer")

    const _data = await this.prisma.client2.productVariant.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                internalSize: {
                  top: {
                    letter: {
                      in: (customer.detail.topSizes as unknown) as string[],
                    },
                  },
                },
              },
              { reservable: { gte: 1 } },
              {
                product: {
                  every: { AND: [{ status: "Available" }, { type: "Top" }] },
                },
              },
            ],
          },
          {
            AND: [
              {
                internalSize: {
                  display: { in: customer.detail.waistSizes.map(a => `${a}`) },
                },
              },
              { reservable: { gte: 1 } },
              {
                product: {
                  every: { AND: [{ status: "Available" }, { type: "Bottom" }] },
                },
              },
            ],
          },
        ],
      },
      select,
    })
    return this.prisma.sanitizePayload(_data, "ProductVariant")
  }

  async getSKUData({ brandID, colorCode, productID }) {
    const brand = this.prisma.sanitizePayload(
      await this.prisma.client2.brand.findUnique({
        where: { id: brandID },
      }),
      "Brand"
    )
    const color = this.prisma.sanitizePayload(
      await this.prisma.client2.color.findUnique({
        where: { colorCode },
      }),
      "Color"
    )

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
    select,
  }: {
    where: Prisma.ProductWhereUniqueInput
    data: any // for convenience
    select: Prisma.ProductSelect
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
    const _product = await this.prisma.client2.product.findUnique({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        variants: {
          select: { id: true, physicalProducts: { select: { id: true } } },
        },
        brand: { select: { id: true, brandCode: true } },
        color: { select: { id: true, name: true } },
      },
    })
    const product = this.prisma.sanitizePayload(_product, "Product")

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
        type: product.type as ProductType,
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
            this.prisma.client2.physicalProduct.update({
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
    const prismaOneUpdateData = {
      ...updateData,
      functions: functionIDs && { set: functionIDs },
      images: imageIDs && { set: imageIDs },
      modelSize: modelSizeID && { connect: { id: modelSizeID } },
      tags: tagIDs && { set: tagIDs },
      status,
      season: productSeason && { connect: { id: productSeason.id } },
      photographyStatus,
    }
    const prismaTwoUpdateData = this.queryUtils.prismaOneToPrismaTwoMutateArgs(
      prismaOneUpdateData,
      product,
      "Product",
      "update"
    )
    return await this.prisma.client2.product.update({
      where,
      data: prismaTwoUpdateData,
      select,
    })
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

  // getCreateProductVariantPromises({

  // })
  /**
   * Deep upserts a product variant, including deep upserts for the child size record
   * and upsert for the child physical product records
   * @param variant of type UpsertVariantInput from productVariant.graphql
   * @param type type of the parent Product
   * @param colorID: colorID for the color record to attach
   * @param retailPrice: retailPrice of the product variant
   * @param productSlug: slug of the parent product
   */
  getDeepUpsertProductVariantPromises({
    sequenceNumbers,
    variant,
    type,
    colorCode,
    retailPrice,
    productSlug,
    status,
    buyUsedEnabled,
    buyUsedPrice,
  }: {
    sequenceNumbers
    variant
    type: ProductType
    colorCode: string
    retailPrice?: number
    productSlug: string
    status: ProductStatus
    buyUsedEnabled?: boolean
    buyUsedPrice?: number
  }): PrismaPromise<ProductVariant | PhysicalProduct>[] {
    const shopifyProductVariantCreateData = !!variant.shopifyProductVariant
      ?.externalId
      ? {
          shopifyProductVariant: {
            connect: variant.shopifyProductVariant,
          },
        }
      : {}
    const shopifyProductVariantUpdateData = !!variant.shopifyProductVariant
      ?.externalId
      ? {
          shopifyProductVariant: {
            connect: variant.shopifyProductVariant,
          },
        }
      : !!variant.shopifyProductVariant
      ? {
          shopifyProductVariant: {
            disconnect: true,
          },
        }
      : {}

    const internalSizeSlug = `${variant.sku}-internal`
    const internalSizeCommonData = {
      slug: internalSizeSlug,
      productType: type,
      display: variant.internalSizeName,
      type: variant.internalSizeType,
    }
    const topSizeData = {
      letter: (variant.internalSizeName as LetterSize) || null,
      ...pick(variant, "sleeve", "shoulder", "chest", "neck", "length"),
    }
    const bottomSizeData = {
      type: (variant.internalSizeType as BottomSizeType) || null,
      value: variant.internalSizeName || "",
      ...pick(variant, ["waist", "rise", "hem", "inseam"]),
    }
    const displayShort = this.calculateVariantDisplayShort(
      !!variant.manufacturerSizeNames
        ? {
            display: head(variant.manufacturerSizeNames),
            type: variant.manufacturerSizeType,
            productType: type,
          }
        : {},
      {
        type: variant.internalSizeType,
        display: variant.internalSizeName,
      }
    )
    const commonData = {
      displayShort,
      productID: productSlug,
      product: { connect: { slug: productSlug } },
      color: {
        connect: { colorCode },
      },
      retailPrice,
      reservable: status === "Available" ? variant.total : 0,
      reserved: 0,
      nonReservable: status === "NotAvailable" ? variant.total : 0,
      offloaded: 0,
      stored: 0,
      ...pick(variant, ["weight", "total", "sku"]),
    }
    // TODO: Update to account for accesory size
    //       accessorySizeData: type === "Accessory" && {
    // ...pick(variant, ["bridge", "length", "width"]),
    // },
    const prodVarPromise = this.prisma.client2.productVariant.upsert({
      where: { sku: variant.sku },
      create: {
        ...commonData,
        ...shopifyProductVariantCreateData,
        internalSize: {
          connectOrCreate: {
            where: { slug: internalSizeSlug },
            create: {
              ...internalSizeCommonData,
              top:
                type === "Top"
                  ? {
                      create: topSizeData,
                    }
                  : undefined,
              bottom:
                type === "Bottom"
                  ? {
                      create: bottomSizeData,
                    }
                  : undefined,
            },
          },
        },
        manufacturerSizes: {
          connectOrCreate: variant.manufacturerSizeNames?.map(sizeValue => {
            const slug = `${variant.sku}-manufacturer-${type}-${sizeValue}`
            const sizeType = variant.manufacturerSizeType
            return {
              where: { slug },
              create: {
                slug,
                type: sizeType,
                display: sizeValue,
                productType: type,
              },
            }
          }),
        },
      },
      update: {
        ...commonData,
        ...shopifyProductVariantUpdateData,
        internalSize: {
          update: {
            ...internalSizeCommonData,
            top: type === "Top" ? { update: topSizeData } : undefined,
            bottom: type === "Bottom" ? { update: bottomSizeData } : undefined,
          },
        },
        manufacturerSizes: {
          update: variant.manufacturerSizeNames?.map(sizeValue => {
            const slug = `${variant.sku}-manufacturer-${type}-${sizeValue}`
            const sizeType = variant.manufacturerSizeType
            return {
              where: { slug },
              data: {
                slug,
                type: sizeType,
                display: sizeValue,
                productType: type,
              },
            }
          }),
        },
      },
    })

    const physicalProductPromises = variant.physicalProducts.map(
      (physProdData, index) => {
        const sequenceNumber = sequenceNumbers[index]
        const price =
          buyUsedPrice == null && buyUsedEnabled == null
            ? physProdData.price || variant.price
            : { buyUsedEnabled, buyUsedPrice }
        return this.prisma.client2.physicalProduct.upsert({
          where: { seasonsUID: physProdData.seasonsUID },
          create: {
            ...physProdData,
            sequenceNumber,
            productVariant: { connect: { sku: variant.sku } },
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
      }
    )

    return [prodVarPromise, ...physicalProductPromises]
  }

  calculateVariantDisplayShort(manufacturerSizeData, internalSizeData) {
    const { display, type, productType } = manufacturerSizeData

    let displayShort
    if (display) {
      displayShort = this.productUtils.coerceSizeDisplayIfNeeded(
        display,
        type as SizeType,
        productType as ProductType
      )
      if (type === "WxL") {
        displayShort = displayShort.split("x")[0]
      }
    } else {
      const {
        type: internalSizeType,
        display: internalSizeDisplay,
      } = internalSizeData
      if (internalSizeType === "WxL") {
        displayShort = internalSizeDisplay.split("x")[0]
      }
    }

    return displayShort
  }

  async getProductTier(prod: Product): Promise<ProductTier> {
    const allProductCategories = await this.productUtils.getAllCategories(prod)
    const luxThreshold = allProductCategories
      .map(a => a.name)
      .includes("Outerwear")
      ? 400
      : 300
    const tierName = prod.retailPrice > luxThreshold ? "Luxury" : "Standard"
    const tiers = await this.prisma.client2.productTier.findMany({
      where: { tier: tierName },
    })
    return this.prisma.sanitizePayload(head(tiers), "ProductTier")
  }

  async newestBrandProducts(args, select): Promise<[Product]> {
    const _newestProducts = (await this.prisma.client2.product.findMany({
      where: {
        AND: [{ tags: { none: { name: "Vintage" } } }, { status: "Available" }],
      },
      orderBy: { publishedAt: "desc" },
      take: 1,
      select: { id: true, brand: { select: { id: true } } },
    })) as [Product & { brand: Pick<Brand, "id"> }]
    const newestProducts = this.prisma.sanitizePayload(
      _newestProducts,
      "Product"
    )

    const newestProduct = head(newestProducts)

    if (!newestProduct) {
      return null
    }

    const { skip, cursor, take } = QueryUtilsService.prismaOneToPrismaTwoArgs(
      args,
      "Product"
    )
    const _data = (await this.prisma.client2.product.findMany({
      where: {
        AND: [
          { brand: { id: newestProduct.brand.id } },
          { status: "Available" },
        ],
      },
      orderBy: { publishedAt: "desc" },
      select,
      skip,
      cursor,
      take,
    })) as [Product]
    return this.prisma.sanitizePayload(_data, "Product")
  }

  private async upsertFunctions(
    functions: string[]
  ): Promise<{ id: string }[]> {
    const productFunctions = await Promise.all(
      functions.map(
        async functionName =>
          await this.prisma.client2.productFunction.upsert({
            create: { name: functionName },
            update: { name: functionName },
            where: { name: functionName },
            select: { id: true },
          })
      )
    )
    return productFunctions
      .filter(Boolean)
      .map((func: ProductFunction) => ({ id: func.id }))
  }

  private validateCreateProductInput(input) {
    // Bottom size name validation
    if (input.type === "Bottom") {
      input.variants?.forEach(a =>
        this.validateInternalBottomSizeName(a.internalSizeName)
      )
    }
    this.validateUpsertSeasonInput(input.season)
  }

  private validateUpsertSeasonInput(input) {
    const {
      internalSeasonSeasonCode,
      internalSeasonYear,
      vendorSeasonSeasonCode,
      vendorSeasonYear,
    } = input

    if (internalSeasonSeasonCode || internalSeasonYear) {
      const bothDefined = !!internalSeasonYear && internalSeasonSeasonCode
      if (!bothDefined) {
        throw new Error(
          "If setting a season, you must provide both a season and a year"
        )
      }
    }

    if (vendorSeasonSeasonCode || vendorSeasonYear) {
      const bothDefined = !!vendorSeasonSeasonCode && !!vendorSeasonYear
      if (!bothDefined) {
        throw new Error(
          "If setting a season, you must provide both a season and a year"
        )
      }
    }
  }
  private async upsertProductSeason(seasonInput, productSlug) {
    let internalSeason: Pick<Season, "id">
    let vendorSeason: Pick<Season, "id">

    this.validateUpsertSeasonInput(seasonInput)

    const {
      wearableSeasons,
      internalSeasonSeasonCode,
      internalSeasonYear,
      vendorSeasonSeasonCode,
      vendorSeasonYear,
    } = seasonInput

    const internalSeasonInInput = !!internalSeasonSeasonCode
    if (internalSeasonInInput) {
      const existingSeason = await this.prisma.client2.season.findFirst({
        where: {
          year: internalSeasonYear,
          seasonCode: internalSeasonSeasonCode,
        },
        select: { id: true },
      })
      internalSeason = await this.prisma.client2.season.upsert({
        where: { id: existingSeason?.id || "" },
        create: {
          year: internalSeasonYear,
          seasonCode: internalSeasonSeasonCode,
        },
        update: {},
      })
    }

    const vendorSeasonInInput = !!vendorSeasonSeasonCode
    if (vendorSeasonInInput) {
      const existingSeason = await this.prisma.client2.season.findFirst({
        where: {
          year: vendorSeasonYear,
          seasonCode: vendorSeasonSeasonCode,
        },
        select: { id: true },
      })
      vendorSeason = await this.prisma.client2.season.upsert({
        where: { id: existingSeason?.id || "" },
        create: {
          year: vendorSeasonYear,
          seasonCode: vendorSeasonSeasonCode,
        },
        update: {},
      })
    }

    const productForSlug = await this.prisma.client2.product.findUnique({
      where: { slug: productSlug },
      select: { id: true, season: { select: { id: true } } },
    })

    const commonData = {
      internalSeason: {
        connect: internalSeason && { id: internalSeason?.id },
      },
      vendorSeason: vendorSeason && {
        connect: { id: vendorSeason?.id },
      },
    }

    const createData = Prisma.validator<
      Prisma.ProductSeasonCreateWithoutProductInput
    >()({
      ...commonData,
      wearableSeasons:
        wearableSeasons &&
        this.queryUtils.createScalarListMutateInput<
          Prisma.ProductSeason_wearableSeasonsCreateNestedManyWithoutProductSeasonInput
        >(wearableSeasons, productForSlug?.season?.id, "create"),
    })
    const updateData = Prisma.validator<
      Prisma.ProductSeasonUpdateWithoutProductInput
    >()({
      ...commonData,
      wearableSeasons:
        wearableSeasons &&
        this.queryUtils.createScalarListMutateInput<any>(
          wearableSeasons,
          productForSlug?.season?.id,
          "update"
        ),
    })

    return await this.prisma.client2.productSeason.upsert({
      where: { id: productForSlug?.season?.id || "" },
      create: createData,
      update: updateData,
    })
  }

  private async upsertTags(tags: string[]): Promise<{ id: string }[]> {
    const prismaTags = await Promise.all(
      tags.map(
        async tag =>
          await this.prisma.client2.tag.upsert({
            create: { name: tag },
            update: { name: tag },
            where: { name: tag },
            select: { id: true },
          })
      )
    )
    return prismaTags.filter(Boolean).map((tag: Tag) => ({ id: tag.id }))
  }

  private async restoreProductIfNeeded(
    where: Prisma.ProductWhereUniqueInput,
    status: ProductStatus
  ) {
    const _productBeforeUpdate = await this.prisma.client2.product.findUnique({
      where,
      select: {
        id: true,
        status: true,
        variants: {
          select: {
            id: true,
            physicalProducts: {
              select: { inventoryStatus: true, seasonsUID: true },
            },
          },
        },
      },
    })
    const productBeforeUpdate = this.prisma.sanitizePayload(
      _productBeforeUpdate,
      "Product"
    )
    if (status !== "Stored" && productBeforeUpdate.status === "Stored") {
      // Update product status
      if (status !== "NotAvailable") {
        throw new Error(
          "When restoring a product, must mark it as NotAvailable"
        )
      }
      await this.prisma.client2.product.update({
        where: { id: productBeforeUpdate.id },
        data: { status },
      })

      // Update statuses on downstream physical products
      for (const {
        inventoryStatus,
        seasonsUID,
      } of this.productUtils.physicalProductsForProduct(
        (productBeforeUpdate as unknown) as ProductWithPhysicalProducts
      )) {
        if (!["Offloaded", "Reserved"].includes(inventoryStatus)) {
          await this.prisma.client2.physicalProduct.update({
            where: { seasonsUID },
            data: { inventoryStatus: "NonReservable" },
          })
        }
      }

      // Update counts on downstream product variants
      for (const prodVar of productBeforeUpdate.variants) {
        const numUnitsRestored = await this.prisma.client2.physicalProduct.count(
          {
            where: {
              AND: [
                { productVariant: { every: { id: prodVar.id } } },
                { inventoryStatus: "NonReservable" },
              ],
            },
          }
        )
        await this.prisma.client2.productVariant.update({
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
    where: Prisma.ProductWhereUniqueInput,
    status: ProductStatus
  ) {
    const _productBeforeUpdate = await this.prisma.client2.product.findUnique({
      where,
      select: {
        id: true,
        status: true,
        variants: {
          select: {
            id: true,
            total: true,
            offloaded: true,
            reserved: true,
            physicalProducts: {
              select: { inventoryStatus: true, seasonsUID: true },
            },
          },
        },
      },
    })
    const productBeforeUpdate = this.prisma.sanitizePayload(
      _productBeforeUpdate,
      "Product"
    )

    if (status === "Stored" && productBeforeUpdate.status !== "Stored") {
      // Update product status
      await this.prisma.client2.product.update({
        where: { id: productBeforeUpdate.id },
        data: { status: "Stored" },
      })

      // Update statuses on downstream physical products
      for (const {
        inventoryStatus,
        seasonsUID,
      } of this.productUtils.physicalProductsForProduct(
        (productBeforeUpdate as unknown) as ProductWithPhysicalProducts
      )) {
        if (!["Offloaded", "Reserved"].includes(inventoryStatus)) {
          await this.prisma.client2.physicalProduct.update({
            where: { seasonsUID },
            data: { inventoryStatus: "Stored" },
          })
        }
      }

      // Update counts on downstream product variants
      for (const prodVar of productBeforeUpdate.variants) {
        const numUnitsStored = await this.prisma.client2.physicalProduct.count({
          where: {
            AND: [
              { productVariant: { every: { id: prodVar.id } } },
              { inventoryStatus: "Stored" },
            ],
          },
        })
        await this.prisma.client2.productVariant.update({
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
