import { SearchService } from "@app/modules/Search"
import { SearchResultType } from "@app/modules/Search/services/search.service"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { SizeType } from "@app/prisma/prisma.binding"
import { ImageData } from "@modules/Image/image.types.d"
import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  BottomSizeType,
  Brand,
  Category,
  Customer,
  Image,
  InventoryStatus,
  LetterSize,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  Product,
  ProductStatus,
  ProductTier,
  ProductType,
  ProductVariant,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { difference, flatten, head, isArray, pick, sum } from "lodash"
import { isEmpty, isUndefined } from "lodash"
import { DateTime } from "luxon"

import { UtilsService } from "../../Utils/services/utils.service"
import { bottomSizeRegex } from "../constants"
import { ProductWithPhysicalProducts } from "../product.types.d"
import { PhysicalProductUtilsService } from "./physicalProduct.utils.service"
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
    private readonly queryUtils: QueryUtilsService,
    private readonly search: SearchService
  ) {}

  async getProducts(args, select, application) {
    if (isEmpty(args.where) && application !== "spring") {
      return []
    }

    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    const findManyArgs = QueryUtilsService.prismaOneToPrismaTwoArgs(
      {
        ...args,
        ...queryOptions,
      },
      "Product"
    )

    const [updatedArgs] = await this.search.updateArgsForSearch(
      findManyArgs,
      SearchResultType.Product
    )

    const data = await this.queryUtils.resolveFindMany(
      { ...updatedArgs, select },
      "Product"
    )

    return data
  }

  async getProductsConnection(args, select, application) {
    let _args = args
    if (application === "flare" || application === "harvest") {
      _args = {
        ...args,
        where: {
          ...args.where,
          status: "Available",
        },
      }
    }
    const queryOptions = await this.productUtils.queryOptionsForProducts(_args)

    const [updatedArgs, searchResult] = await this.search.updateArgsForSearch(
      queryOptions,
      SearchResultType.Product
    )

    const data = await this.queryUtils.resolveConnection(
      { ...updatedArgs, ...queryOptions, select },
      "Product"
    )

    return {
      ...data,
      aggregate: {
        ...data.aggregate,
        count: searchResult?.nbHits || data?.aggregate?.count,
      },
    }
  }

  async publishProducts(productIDs) {
    const productsWithData = await this.prisma.client.product.findMany({
      where: {
        id: { in: productIDs },
      },
      select: {
        id: true,
        name: true,
        status: true,
        photographyStatus: true,
        variants: { select: { id: true } },
      },
    })

    const validatedIDs = []
    const unvalidatedIDs = []

    productIDs.forEach(async id => {
      const product = productsWithData.find(p => p.id === id)
      if (
        product.variants?.length > 0 &&
        product.photographyStatus === "Done" &&
        product.status === "NotAvailable"
      ) {
        validatedIDs.push(id)
      } else {
        unvalidatedIDs.push(id)
      }
    })

    await this.prisma.client.product.updateMany({
      where: { id: { in: validatedIDs } },
      data: {
        status: "Available",
        publishedAt: DateTime.local().toISO(),
      },
    })

    let message
    let status
    if (productIDs.length === validatedIDs.length) {
      message = "Successfully published all products."
      status = "success"
    } else {
      const unvalidatedNames = unvalidatedIDs
        .map(a => productsWithData.find(p => p.id === a))
        .map(b => b.name)
      message = `Some of the products weren't published, check that these products have variants and their photography status is complete and their status is not Stored or Offloaded: ${unvalidatedNames.join(
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
    const viewedProduct = await this.prisma.client.recentlyViewedProduct.findFirst(
      {
        where: { customer: { id: customer.id }, product: { id: productId } },
        select: { id: true, viewCount: true },
      }
    )

    const priorViewCount = viewedProduct?.viewCount || 0
    const result = await this.prisma.client.recentlyViewedProduct.upsert({
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
    const brand = await this.prisma.client.brand.findUnique({
      where: { id: input.brandID },
      select: { id: true, brandCode: true },
    })
    const color = await this.prisma.client.color.findUnique({
      where: { colorCode: input.colorCode },
      select: { name: true },
    })
    const model =
      input.modelID &&
      (await this.prisma.client.productModel.findUnique({
        where: { id: input.modelID },
      }))

    const category = await this.prisma.client.category.findUnique({
      where: { id: input.categoryID },
      select: { measurementType: true },
    })

    const slug = await this.productUtils.createProductSlug(
      brand.brandCode,
      input.name,
      color.name
    )

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

    const seasonData = await this.getMutateSeasonOnProductInput(
      input.season,
      "create"
    )
    const tier = await this.getProductTier(
      { id: input.categoryID },
      input.retailPrice
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
        "productFit",
        "externalURL",
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
      model: model ? { connect: { id: input.modelID } } : undefined,
      color: {
        connect: { colorCode: input.colorCode },
      },
      secondaryColor: input.secondaryColorCode && {
        connect: { colorCode: input.secondaryColorCode },
      },
      season: seasonData as any,
      tier: { connect: { id: tier.id } },
      images: {
        connectOrCreate: imageDatas.map(a => ({
          where: { url: a.url },
          create: { ...a, title: slug },
        })),
      },
      modelSize: this.createMutateModelSizeOnProductInput({
        slug,
        type: input.type,
        modelSizeDisplay: input.modelSizeDisplay,
        modelSizeType: input.modelSizeType,
        modelSizeName: input.modelSizeName,
      }) as any,
      tags: {
        connectOrCreate: input.tags.map(tag => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
      styles: input.styles,
      innerMaterials: input.innerMaterials,
      outerMaterials: input.outerMaterials,
    })

    const productPromise = this.prisma.client.product.create({
      data: createData,
    })

    const sequenceNumbers = await this.physicalProductUtils.groupedSequenceNumbers(
      input.variants
    )

    const variantAndPhysicalProductPromises = flatten(
      input.variants.map((a, i) => {
        return this.getCreateProductVariantPromises({
          sequenceNumbers: sequenceNumbers[i],
          variant: a,
          productSlug: slug,
          ...pick(input, [
            "type",
            "colorCode",
            "retailPrice",
            "buyUsedEnabled",
            "buyUsedPrice",
          ]),
          measurementType: category.measurementType,
        })
      })
    ) as PrismaPromise<ProductVariant | PhysicalProduct>[]

    const [product] = await this.prisma.client.$transaction([
      productPromise,
      ...variantAndPhysicalProductPromises,
    ])

    return await this.prisma.client.product.findUnique({
      where: { id: product.id },
      select,
    })
  }

  async saveProduct(item, save, select, customer) {
    let bagItem = await this.prisma.client.bagItem.findFirst({
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

    if (bagItem && !save) {
      await this.prisma.client.bagItem.delete({
        where: { id: (bagItem as BagItem).id },
      })
    } else if (!bagItem && save) {
      bagItem = await this.prisma.client.bagItem.create({
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

  async checkItemsAvailability(items, customer) {
    const status =
      customer.status ||
      (
        await this.prisma.client.customer.findUnique({
          where: { id: customer.id },
          select: { status: true },
        })
      ).status

    if (status !== "Active") {
      throw new Error("Your account must be active to reserve items.")
    }

    const reservedBagItems = await this.prisma.client.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: { in: items },
        },
        status: { in: ["Reserved", "Received"] },
      },
      select: { productVariant: { select: { id: true } } },
    })

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
    const skuData = await this.productUtils.getSKUData({
      brandID,
      colorCode,
      productID,
    })
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
    const collidingVariants = await this.prisma.client.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    })
    if (collidingVariants.length > 0) {
      throw new Error(`SKU collisions: ${collidingVariants.map(a => a.sku)}`)
    }

    return skus
  }

  async getGeneratedSeasonsUIDs({ brandID, colorCode, sizes, productID }) {
    const skuData = await this.productUtils.getSKUData({
      brandID,
      colorCode,
      productID,
    })
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

  async availableProductVariantsConnectionForCustomer(
    customerID: string,
    args: any,
    select: any
  ) {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id: customerID },
      select: {
        id: true,
        detail: { select: { topSizes: true, waistSizes: true } },
      },
    })

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
    const customer = await this.prisma.client.customer.findUnique({
      where,
      select: {
        id: true,
        detail: { select: { topSizes: true, waistSizes: true } },
      },
    })

    const data = await this.prisma.client.productVariant.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                internalSize: {
                  top: {
                    letter: {
                      in: customer.detail.topSizes as LetterSize[],
                    },
                  },
                },
              },
              { reservable: { gte: 1 } },
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
                  display: { in: customer.detail.waistSizes.map(a => `${a}`) },
                },
              },
              { reservable: { gte: 1 } },
              {
                product: {
                  AND: [{ status: "Available" }, { type: "Bottom" }],
                },
              },
            ],
          },
        ],
      },
      select,
    })
    return data
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
    const product = await this.prisma.client.product.findUnique({
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
        season: { select: { id: true } },
        category: {
          select: { id: true, dryCleaningFee: true, recoupment: true },
        },
        functions: { select: { name: true } },
        tags: { select: { name: true } },
        recoupment: true,
        wholesalePrice: true,
        rentalPriceOverride: true,
        computedRentalPrice: true,
      },
    })

    await this.validateUpdateProductPayload(product, data)

    if (!!status && status === "Available" && product.status !== "Available") {
      updateData.publishedAt = DateTime.local().toISO()
    }

    let imagePromises = []
    let imageUrls = []
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

      const imageDatas = (await this.imageService.upsertImages(
        images,
        imageNames,
        product.slug,
        true
      )) as { promise: PrismaPromise<Image>; url: string }[]
      imagePromises = imageDatas.map(a => a.promise)
      imageUrls = imageDatas.map(a => a.url)
    }

    if (updateData.styles?.length > 0) {
      updateData["styles"] = { set: updateData.styles }
    }

    const prismaTwoUpdateData = this.queryUtils.prismaOneToPrismaTwoMutateData(
      {
        ...updateData,
      },
      "Product"
    )
    const tier = await this.getProductTier(
      product.category,
      updateData.retailPrice
    )

    // Note: Technically, we should also take the category into account here. But that is complicated
    // logic, so we instead allow that case to fallback to the cron job which caches rental prices at 4AM everyday
    let updatedRentalPrice = product.computedRentalPrice
    if (
      updateData.recoupment !== product.recoupment ||
      updateData.wholesalePrice !== product.wholesalePrice ||
      updateData.rentalPriceOverride !== product.rentalPriceOverride
    ) {
      updatedRentalPrice = this.productUtils.calcRentalPrice(
        {
          recoupment: updateData.recoupment || product.recoupment,
          wholesalePrice: updateData.wholesalePrice || product.wholesalePrice,
          rentalPriceOverride:
            updateData.rentalPriceOverride || product.rentalPriceOverride,
          category: {
            dryCleaningFee: product.category.dryCleaningFee,
            recoupment: product.category.recoupment,
          },
        },
        { ignoreOverride: false }
      )
    }

    const updateInput = {
      ...prismaTwoUpdateData,
      tier: { connect: { id: tier.id } },
      functions: functions && {
        connectOrCreate: functions.map(name => ({
          create: { name },
          where: { name },
        })),
        disconnect: difference(
          product.functions.map(a => a.name),
          functions
        ).map(name => ({ name })),
      },
      tags: tags && {
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag },
        })),
        disconnect: difference(
          product.tags.map(a => a.name),
          tags
        ).map(name => ({ name })),
      },
      modelSize: this.createMutateModelSizeOnProductInput({
        slug: product.slug,
        type: product.type,
        modelSizeDisplay,
        modelSizeType,
        modelSizeName,
      }),
      season: season && {
        upsert: {
          ...(await this.getMutateSeasonOnProductInput(season, "create")),
          ...(await this.getMutateSeasonOnProductInput(
            { ...season, seasonId: product.season?.id },
            "update"
          )),
        },
      },
      images: images && {
        set: imageUrls.map(url => ({
          url,
        })),
      },
      status,
      photographyStatus,
      computedRentalPrice: updatedRentalPrice,
    }

    const productUpdatePromise = this.prisma.client.product.update({
      where,
      data: updateInput,
    })

    let physicalProductUpdatePromises = []
    if (buyUsedEnabled != null || buyUsedPrice != null) {
      physicalProductUpdatePromises = product.variants
        ?.flatMap(variant => variant.physicalProducts)
        ?.map(physicalProduct =>
          this.prisma.client.physicalProduct.update({
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
    }

    const storeProductPromises = await this.getStoreProductPromises(
      where,
      status
    )
    const restoreProductPromises = await this.getRestoreProductPromises(
      where,
      status
    )

    await this.prisma.client.$transaction([
      ...imagePromises,
      productUpdatePromise,
      ...physicalProductUpdatePromises,
      ...storeProductPromises,
      ...restoreProductPromises,
    ])

    return await this.prisma.client.product.findUnique({
      where,
      select,
    })
  }

  private async validateUpdateProductPayload(
    productWithData: Pick<Product, "status" | "id"> & { variants: any[] },
    data
  ) {
    const { status, photographyStatus, name, description } = data

    // If they're unstoring, that should be all they're doing
    if (productWithData.status === "Stored" && status !== "Stored") {
      if (Object.keys(data).length !== 1) {
        throw new Error(
          "To reduce the surface area of potential errors, do not make other changes when unstoring a product"
        )
      }
    }

    if (
      !!status &&
      status === "Available" &&
      (!productWithData?.variants?.length || photographyStatus !== "Done")
    ) {
      throw new ApolloError(
        "Can not set product status to Available. Check that there are product variants and the photography status is done."
      )
    }

    const collision = await this.prisma.client.product.findFirst({
      where: {
        name,
        description,
        id: { not: productWithData.id },
      },
      select: {
        name: true,
        brand: {
          select: { name: true },
        },
      },
    })
    if (!!collision) {
      throw new ApolloError(
        `Possible product collision. Found product ${collision.name} from brand ${collision.brand.name} with same description`
      )
    }
  }
  /**
   * Checks if all downstream physical products have been offloaded.
   * If so, marks the product as offloaded.
   */
  async getOffloadProductPromiseIfNeeded(
    productId: string,
    physProdCurrentlyOffloadingId: string
  ) {
    const prodWithPhysicalProducts = await this.prisma.client.product.findUnique(
      {
        where: { id: productId },
        select: {
          status: true,
          variants: {
            select: {
              physicalProducts: { select: { id: true, inventoryStatus: true } },
            },
          },
        },
      }
    )
    const downstreamPhysProds = this.productUtils.physicalProductsForProduct(
      (prodWithPhysicalProducts as unknown) as ProductWithPhysicalProducts
    )
    const allPhysProdsOffloaded = downstreamPhysProds.reduce(
      (acc, curPhysProd: { id: string; inventoryStatus: InventoryStatus }) =>
        acc &&
        (curPhysProd.inventoryStatus === "Offloaded" ||
          curPhysProd.id === physProdCurrentlyOffloadingId),
      true
    )
    if (allPhysProdsOffloaded) {
      return {
        promise: this.prisma.client.product.update({
          where: { id: productId },
          data: { status: "Offloaded" },
        }),
      }
    }

    return { promise: null }
  }

  // })
  /**
   * Creates product variants and their downstream physical products
   * @param variant of type CreateVariantInput from productVariant.graphql
   * @param type type of the parent Product
   * @param colorID: colorID for the color record to attach
   * @param retailPrice: retailPrice of the product variant
   * @param productSlug: slug of the parent product
   */
  getCreateProductVariantPromises({
    sequenceNumbers,
    variant,
    type,
    colorCode,
    retailPrice,
    productSlug,
    buyUsedEnabled,
    buyUsedPrice,
    measurementType,
  }: {
    sequenceNumbers
    variant
    type: ProductType
    colorCode: string
    retailPrice?: number
    productSlug: string
    buyUsedEnabled?: boolean
    buyUsedPrice?: number
    measurementType: string
  }): PrismaPromise<ProductVariant | PhysicalProduct>[] {
    if (variant.manufacturerSizeNames.length > 1) {
      throw new Error(`Please pass no more than 1 manufacturer size name`)
    }

    const measurements = pick(variant, [
      "sleeve",
      "shoulder",
      "chest",
      "neck",
      "length",
      "waist",
      "rise",
      "hem",
      "inseam",
      "bridge",
      "width",
    ])

    Object.keys(measurements).forEach(key => {
      measurements[key] = this.productUtils.convertMeasurementSizeToInches(
        measurements[key],
        measurementType
      )
    })

    const shopifyProductVariantCreateData = !!variant.shopifyProductVariant
      ?.externalId
      ? {
          shopifyProductVariant: {
            connect: variant.shopifyProductVariant,
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
      ...pick(measurements, "sleeve", "shoulder", "chest", "neck", "length"),
    }
    const bottomSizeData = {
      type: (variant.internalSizeType as BottomSizeType) || null,
      value: variant.internalSizeName || "",
      ...pick(measurements, ["waist", "rise", "hem", "inseam"]),
    }
    const accessorySizeData = pick(measurements, ["bridge", "length", "width"])

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

    const counts = {
      reservable: variant.physicalProducts.filter(
        a => a.inventoryStatus === "Reservable"
      ).length,
      reserved: 0,
      nonReservable: variant.physicalProducts.filter(
        a => a.inventoryStatus === "NonReservable"
      ).length,
      offloaded: 0,
      stored: 0,
    }
    if (sum(Object.values(counts)) !== variant.total) {
      throw new Error(`Invalid counts for new variant: ${variant.sku}`)
    }

    const createData = {
      displayShort,
      product: { connect: { slug: productSlug } },
      color: {
        connect: { colorCode },
      },
      retailPrice,
      ...counts,
      ...pick(variant, ["weight", "total", "sku"]),
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
            accessory:
              type === "Accessory" ? { create: accessorySizeData } : undefined,
          },
        },
      },
      manufacturerSizes: {
        create: [
          this.productUtils.getManufacturerSizeMutateInput(
            variant,
            head(variant.manufacturerSizeNames),
            type,
            "create"
          ) as any,
        ],
      },
    }
    let prodVarPromise = this.prisma.client.productVariant.create({
      data: createData,
    })

    const physicalProductPromises = variant.physicalProducts.map(
      (physProdData, index) => {
        const sequenceNumber = sequenceNumbers[index]
        const price =
          buyUsedPrice == null && buyUsedEnabled == null
            ? physProdData.price || variant.price
            : { buyUsedEnabled, buyUsedPrice }
        const createData = Prisma.validator<
          Prisma.PhysicalProductCreateInput
        >()({
          ...physProdData,
          sequenceNumber,
          productVariant: { connect: { sku: variant.sku } },
          ...(price && {
            price: {
              create: price,
            },
          }),
        })
        return this.prisma.client.physicalProduct.create({
          data: createData,
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

  async getProductTier(
    category: Pick<Category, "id">,
    retailPrice
  ): Promise<ProductTier> {
    const allProductCategories = await this.productUtils.getAllCategoriesForCategory(
      category
    )
    const luxThreshold = allProductCategories
      .map(a => a.name)
      .includes("Outerwear")
      ? 400
      : 300
    const tierName = retailPrice > luxThreshold ? "Luxury" : "Standard"
    const tier = await this.prisma.client.productTier.findFirst({
      where: { tier: tierName },
    })
    return tier
  }

  async newestBrandProducts(args, select): Promise<[Product]> {
    const newestProducts = (await this.prisma.client.product.findMany({
      where: {
        AND: [{ tags: { none: { name: "Vintage" } } }, { status: "Available" }],
      },
      orderBy: { publishedAt: "desc" },
      take: 1,
      select: { id: true, brand: { select: { id: true } } },
    })) as [Product & { brand: Pick<Brand, "id"> }]

    const newestProduct = head(newestProducts)

    if (!newestProduct) {
      return null
    }

    const { skip, cursor, take } = QueryUtilsService.prismaOneToPrismaTwoArgs(
      args,
      "Product"
    )
    const data = (await this.prisma.client.product.findMany({
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
    return data
  }

  async signupPersonalDetailsProducts(select): Promise<[Product]> {
    const brands = (await this.prisma.client.brand.findMany({
      where: {
        slug: {
          in: [
            "jacquemus",
            "auralee",
            "craig-green",
            "casablanca",
            "marni",
            "martine-rose",
            "bode",
            "our-legacy",
            "erl",
            "deveaux",
            "keenkee",
            "rhude",
            "nanushka",
            "judy-turner",
            "phipps",
          ],
        },
      },
      select: {
        id: true,
        products: {
          orderBy: { publishedAt: "desc" },
          take: 1,
          where: { status: "Available" },
          select,
        },
      },
    })) as any

    return brands.flatMap(brand => brand.products)
  }

  private validateCreateProductInput(input) {
    // Bottom size name validation
    if (input.type === "Bottom") {
      input.variants?.forEach(a =>
        this.validateInternalBottomSizeName(a.internalSizeName)
      )
    }

    this.validateUpsertSeasonInput(input.season)

    if (input.variants.length > 0) {
      input.variants.forEach(a => {
        if (!isArray(a.physicalProducts) || a.physicalProducts.length < 1) {
          throw new Error(
            `Must pass at least one physical product on each variant in CreateProductInput`
          )
        }
      })
    }
  }

  private validateUpsertSeasonInput(input) {
    if (!input) {
      return
    }
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

  private async getRestoreProductPromises(
    where: Prisma.ProductWhereUniqueInput,
    status: ProductStatus
  ): Promise<PrismaPromise<Product | ProductVariant | PhysicalProduct>[]> {
    const promises = []
    const productBeforeUpdate = await this.prisma.client.product.findUnique({
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
    if (status !== "Stored" && productBeforeUpdate.status === "Stored") {
      // Update product status
      if (status !== "NotAvailable") {
        throw new Error(
          "When restoring a product, must mark it as NotAvailable"
        )
      }
      promises.push(
        this.prisma.client.product.update({
          where: { id: productBeforeUpdate.id },
          data: { status },
        })
      )

      // Update statuses on downstream physical products as well as
      // counts on product variants
      for (const prodVar of productBeforeUpdate.variants) {
        const physicalProducts = prodVar.physicalProducts
        const unitsToRestore = physicalProducts.filter(
          a => !["Offloaded", "Reserved"].includes(a.inventoryStatus)
        )
        if (unitsToRestore.length === 0) {
          continue
        }

        promises.push(
          this.prisma.client.physicalProduct.updateMany({
            where: {
              seasonsUID: { in: unitsToRestore.map(a => a.seasonsUID) },
            },
            data: { inventoryStatus: "NonReservable" },
          })
        )
        promises.push(
          this.prisma.client.productVariant.update({
            where: { id: prodVar.id },
            data: {
              nonReservable: unitsToRestore.length,
              stored: 0,
            },
          })
        )
      }
    }
    return promises
  }

  private async getStoreProductPromises(
    where: Prisma.ProductWhereUniqueInput,
    status: ProductStatus
  ): Promise<PrismaPromise<Product | ProductVariant | PhysicalProduct>[]> {
    const promises = []
    const productBeforeUpdate = await this.prisma.client.product.findUnique({
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

    if (status === "Stored" && productBeforeUpdate.status !== "Stored") {
      // Update product status
      promises.push(
        this.prisma.client.product.update({
          where: { id: productBeforeUpdate.id },
          data: { status: "Stored" },
        })
      )

      // Update statuses on downstream physical products as well as
      // counts on product variants
      for (const prodVar of productBeforeUpdate.variants) {
        const physicalProducts = prodVar.physicalProducts
        const unitsToStore = physicalProducts.filter(
          a => !["Offloaded", "Reserved"].includes(a.inventoryStatus)
        )
        if (unitsToStore.length === 0) {
          continue
        }

        promises.push(
          this.prisma.client.physicalProduct.updateMany({
            where: { seasonsUID: { in: unitsToStore.map(a => a.seasonsUID) } },
            data: { inventoryStatus: "Stored" },
          })
        )
        const data = {
          nonReservable:
            prodVar.total -
            prodVar.offloaded -
            prodVar.reserved -
            unitsToStore.length,
          stored: unitsToStore.length,
          reservable: 0,
        }
        promises.push(
          this.prisma.client.productVariant.update({
            where: { id: prodVar.id },
            data,
          })
        )
      }
    }

    return promises
  }

  private async getMutateSeasonOnProductInput(
    seasonInput,
    mutationType: "create" | "update" = "create"
  ) {
    if (!seasonInput) {
      return undefined
    }
    const {
      wearableSeasons,
      internalSeasonSeasonCode,
      internalSeasonYear,
      vendorSeasonSeasonCode,
      vendorSeasonYear,
      seasonId,
    } = seasonInput

    const existingInternalSeason =
      !!internalSeasonSeasonCode &&
      (await this.prisma.client.season.findFirst({
        where: {
          year: internalSeasonYear,
          seasonCode: internalSeasonSeasonCode,
        },
        select: { id: true },
      }))
    const existingVendorSeason =
      !!vendorSeasonSeasonCode &&
      (await this.prisma.client.season.findFirst({
        where: {
          year: vendorSeasonYear,
          seasonCode: vendorSeasonSeasonCode,
        },
        select: { id: true },
      }))

    return {
      [mutationType]: {
        wearableSeasons,
        ...(internalSeasonYear && internalSeasonSeasonCode
          ? {
              internalSeason: {
                connectOrCreate: {
                  where: { id: existingInternalSeason?.id || "" },
                  create: {
                    year: internalSeasonYear,
                    seasonCode: internalSeasonSeasonCode,
                  },
                },
              },
            }
          : {}),
        ...(vendorSeasonYear && vendorSeasonSeasonCode
          ? {
              vendorSeason: {
                connectOrCreate: {
                  where: { id: existingVendorSeason?.id || "" },
                  create: {
                    year: vendorSeasonYear,
                    seasonCode: vendorSeasonSeasonCode,
                  },
                },
              },
            }
          : {}),
      },
    }
  }

  private validateInternalBottomSizeName(sizeName) {
    if (!sizeName.match(bottomSizeRegex)) {
      throw new Error(`Invalid bottom size name: ${sizeName}`)
    }
  }

  private createMutateModelSizeOnProductInput({
    slug,
    type,
    modelSizeDisplay,
    modelSizeType,
    modelSizeName,
  }) {
    if (modelSizeName && modelSizeDisplay) {
      return {
        connectOrCreate: {
          where: { slug },
          create: {
            slug,
            productType: type,
            display: modelSizeDisplay,
            type: modelSizeType,
          },
        },
      }
    }

    return undefined
  }
}
