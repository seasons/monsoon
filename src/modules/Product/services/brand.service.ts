import * as url from "url"

import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { IndexKey } from "@modules/Search/services/algolia.service"
import { SearchService } from "@modules/Search/services/search.service"
import { Injectable, Logger } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: BrandUtilsService,
    private readonly search: SearchService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  async createBrand({
    input,
    select,
  }: {
    input: any
    select: Prisma.BrandSelect
  }) {
    // Store images and get their record ids to connect to the brand
    const {
      imageDatas,
      logoData,
    } = await this.utils.getCreateBrandImagesPromises(input)

    const imagePromises = imageDatas.map(a => a?.promise)
    const promises = [
      ...imagePromises,
      logoData?.promise,
      this.prisma.client.warehouseLocation.create({
        data: {
          type: "Rail",
          barcode: `SR-A100-${input.brandCode}`,
          locationCode: "A100",
          itemCode: input.brandCode,
        },
      }),
      this.prisma.client.warehouseLocation.create({
        data: {
          type: "Rail",
          barcode: `SR-A200-${input.brandCode}`,
          locationCode: "A200",
          itemCode: input.brandCode,
        },
      }),
      this.prisma.client.brand.create({
        data: {
          ...input,
          styles: input.styles,
          logoImage: !!logoData
            ? { connect: { url: logoData.url } }
            : undefined,
          images: !!imageDatas
            ? {
                connect: imageDatas.map(a => ({ url: a.url })),
              }
            : undefined,
        },
        select,
      }),
    ].filter(Boolean)

    const result = await this.prisma.client.$transaction(promises)

    const brand = result.pop()

    return brand
  }

  async updateBrand({
    where,
    data,
    select,
  }: {
    where: Prisma.BrandWhereUniqueInput
    data: any
    select: Prisma.BrandSelect
  }) {
    const promises = []

    const brand = await this.prisma.client.brand.findUnique({
      where,
      select: { id: true, shopifyShop: { select: { id: true } } },
    })

    let imageDatas
    let logoData
    try {
      const result = await this.utils.getCreateBrandImagesPromises(data)
      ;({ imageDatas, logoData } = result)
      promises.push(logoData?.promise)
      promises.push(...imageDatas?.map(a => a.promise))
    } catch (ex) {
      this.logger.log(ex)
      /** noop **/
    }

    if (data.shopifyShop) {
      const shopName = data.shopifyShop.shopName

      data.shopifyShop = {
        upsert: {
          update: {
            ...data.shopifyShop,
          },
          create: {
            ...data.shopifyShop,
          },
        },
      } as Prisma.ShopifyShopUpdateOneWithoutBrandInput
      const shopifyProductVariants = await this.prisma.client.shopifyProductVariant.findMany(
        {
          where: {
            shop: {
              shopName,
            },
          },
          select: { id: true },
        }
      )

      promises.push(
        this.prisma.client.shopifyProductVariant.updateMany({
          where: { id: { in: shopifyProductVariants.map(a => a.id) } },
          data: { brandId: brand.id },
        })
      )
    } else if (brand?.shopifyShop?.id) {
      data.shopifyShop = { delete: true }
    } else {
      data.shopifyShop = undefined
    }

    const updateBrandData = Prisma.validator<Prisma.BrandUpdateInput>()({
      ...data,
      styles: data.styles,
      logoImage: !!logoData ? { connect: { url: logoData.url } } : undefined,
      images: !!imageDatas
        ? {
            connect: imageDatas.map(a => ({ url: a.url })),
          }
        : undefined,
    })
    promises.push(
      this.prisma.client.brand.update({
        where,
        data: updateBrandData,
        select,
      })
    )

    const cleanPromises = promises.filter(Boolean)
    const result = await this.prisma.client.$transaction(cleanPromises)
    const updatedBrand = result.pop()

    if (data.shopifyShop) {
      await this.search.indexShopifyProductVariants(
        [IndexKey.Default, IndexKey.Admin, IndexKey.ShopifyProductVariant],
        updatedBrand.id
      )
    }

    return updatedBrand
  }
}
