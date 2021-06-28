import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  Brand,
  Category,
  Customer,
  Image,
  PhysicalProduct,
  Prisma,
  PrismaPromise,
  Product,
  ProductTier,
  ProductVariant,
} from "@prisma/client"
import {
  BottomSizeType,
  ID_Input,
  InventoryStatus,
  LetterSize,
  MeasurementType,
  ProductStatus,
  ProductType,
  SizeType,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { difference, flatten, head, isArray, pick, sum } from "lodash"
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

    await this.prisma.client2.product.updateMany({
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
    const model =
      input.modelID &&
      (await this.prisma.client2.productModel.findUnique({
        where: { id: input.modelID },
      }))

    const category = await this.prisma.client2.category.findUnique({
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

    const createScalarListCreateInput = values =>
      this.queryUtils.createScalarListMutateInput(values, "", "create")
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
      styles: createScalarListCreateInput(input.styles),
      innerMaterials: createScalarListCreateInput(input.innerMaterials),
      outerMaterials: createScalarListCreateInput(input.outerMaterials),
    })

    const productPromise = this.prisma.client2.product.create({
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

    const [product] = await this.prisma.client2.$transaction([
      productPromise,
      ...variantAndPhysicalProductPromises,
    ])

    return await this.prisma.client2.product.findUnique({
      where: { id: product.id },
      select,
    })
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

  async checkItemsAvailability(items, customer) {
    const status =
      customer.status ||
      (
        await this.prisma.client2.customer.findUnique({
          where: { id: customer.id },
          select: { status: true },
        })
      ).status

    if (status !== "Active") {
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
        status: { in: ["Reserved", "Received"] },
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
    const collidingVariants = await this.prisma.client2.productVariant.findMany(
      { where: { sku: { in: skus } }, select: { sku: true } }
    )
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
        season: { select: { id: true } },
        category: { select: { id: true } },
        functions: { select: { name: true } },
        tags: { select: { name: true } },
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

    const prismaTwoUpdateData = this.queryUtils.prismaOneToPrismaTwoMutateArgs(
      { ...updateData, styles: { set: updateData.styles } },
      product,
      "Product",
      "update"
    )
    const tier = await this.getProductTier(
      product.category,
      updateData.retailPrice
    )
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
    }

    const productUpdatePromise = this.prisma.client2.product.update({
      where,
      data: updateInput,
    })

    let physicalProductUpdatePromises = []
    if (buyUsedEnabled != null || buyUsedPrice != null) {
      physicalProductUpdatePromises = product.variants
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
    }

    const storeProductPromises = await this.getStoreProductPromises(
      where,
      status
    )
    const restoreProductPromises = await this.getRestoreProductPromises(
      where,
      status
    )

    await this.prisma.client2.$transaction([
      ...imagePromises,
      productUpdatePromise,
      ...physicalProductUpdatePromises,
      ...storeProductPromises,
      ...restoreProductPromises,
    ])

    return await this.prisma.client2.product.findUnique({
      where,
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

    Object.keys(measurements).map(key => {
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
      productID: productSlug,
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
    let prodVarPromise = this.prisma.client2.productVariant.create({
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
        return this.prisma.client2.physicalProduct.create({
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
    const tier = await this.prisma.client2.productTier.findFirst({
      where: { tier: tierName },
    })
    return this.prisma.sanitizePayload(tier, "ProductTier")
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
      promises.push(
        this.prisma.client2.product.update({
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
          this.prisma.client2.physicalProduct.updateMany({
            where: {
              seasonsUID: { in: unitsToRestore.map(a => a.seasonsUID) },
            },
            data: { inventoryStatus: "NonReservable" },
          })
        )
        promises.push(
          this.prisma.client2.productVariant.update({
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
      promises.push(
        this.prisma.client2.product.update({
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
          this.prisma.client2.physicalProduct.updateMany({
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
          this.prisma.client2.productVariant.update({
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

    return {
      [mutationType]: {
        wearableSeasons: this.queryUtils.createScalarListMutateInput(
          wearableSeasons,
          seasonId || "",
          mutationType
        ),
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
