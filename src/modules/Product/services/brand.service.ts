import * as url from "url"

import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { IndexKey } from "@modules/Search/services/algolia.service"
import { SearchService } from "@modules/Search/services/search.service"
import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

@Injectable()
export class BrandService {
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
      this.prisma.client2.warehouseLocation.create({
        data: {
          type: "Rail",
          barcode: `SR-A100-${input.brandCode}`,
          locationCode: "A100",
          itemCode: input.brandCode,
        },
      }),
      this.prisma.client2.warehouseLocation.create({
        data: {
          type: "Rail",
          barcode: `SR-A200-${input.brandCode}`,
          locationCode: "A200",
          itemCode: input.brandCode,
        },
      }),
      this.prisma.client2.brand.create({
        data: {
          ...input,
          styles: this.queryUtils.createScalarListMutateInput(
            input.styles,
            "",
            "create"
          ),
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

    const result = await this.prisma.client2.$transaction(promises)

    const brand = this.prisma.sanitizePayload(result.pop(), "Brand")

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

    const _brand = await this.prisma.client2.brand.findUnique({
      where,
      select: { id: true, shopifyShop: { select: { id: true } } },
    })
    const brand = this.prisma.sanitizePayload(_brand, "Brand")

    let imageDatas
    let logoData
    try {
      const result = await this.utils.getCreateBrandImagesPromises(data)
      ;({ imageDatas, logoData } = result)
    } catch (ex) {
      /** noop **/
    }

    if (data.shopifyShop) {
      const shopName = data.shopifyShop.shopName

      data.shopifyShop = {
        connect: {
          shopName,
        },
      } as Prisma.ShopifyShopUpdateInput
      const shopifyProductVariants = await this.prisma.client2.shopifyProductVariant.findMany(
        {
          where: {
            shop: {
              shopName,
            },
          },
        }
      )

      for (let shopifyPV of shopifyProductVariants) {
        promises.push(
          this.prisma.client2.shopifyProductVariant.update({
            where: {
              id: shopifyPV.id,
            },
            data: {
              brand: {
                connect: {
                  id: brand.id,
                },
              },
            },
          })
        )
      }
    } else if (brand?.shopifyShop?.id) {
      data.shopifyShop = { delete: true }
    }

    promises.push(
      this.prisma.client2.brand.update({
        where,
        data: {
          ...data,
          styles: this.queryUtils.createScalarListMutateInput(
            data.styles,
            brand.id,
            "update"
          ),
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
      })
    )

    const result = await this.prisma.client2.$transaction(promises)
    const updatedBrand = this.prisma.sanitizePayload(result.pop(), "Brand")

    if (data.shopifyShop) {
      await this.search.indexShopifyProductVariants(
        [IndexKey.Default, IndexKey.Admin, IndexKey.ShopifyProductVariant],
        updatedBrand.id
      )
    }

    return updatedBrand
  }
}
