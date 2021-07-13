import * as url from "url"

import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { IndexKey } from "@modules/Search/services/algolia.service"
import { SearchService } from "@modules/Search/services/search.service"
import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import {
  BrandWhereUniqueInput,
  ShopifyShopUpdateOneInput,
} from "@prisma1/index"
import {
  BrandUpdateOneInput,
  Brand as PrismaBindingBrand,
} from "@prisma1/prisma.binding"
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
    const { logoID, imageIDs } = await this.utils.createBrandImages(input)

    const result = await this.prisma.client2.$transaction([
      this.prisma.client2.brand.create({
        data: {
          ...input,
          styles:
            input?.styles?.length > 0 &&
            this.queryUtils.createScalarListMutateInput(
              input.styles,
              "",
              "create"
            ),
          logoImage: logoID && { connect: { id: logoID } },
          images: imageIDs && { connect: imageIDs },
        },
        select,
      }),
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
    ])

    const brand = this.prisma.sanitizePayload(result.shift(), "Brand")

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

    let brandImages
    try {
      brandImages = await this.utils.createBrandImages(data)
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

      // Index shopify product variants into algolia
    } else if (brand?.shopifyShop?.id) {
      data.shopifyShop = { delete: true }
    }

    promises.push(
      this.prisma.client2.brand.update({
        where,
        data: {
          ...data,
          styles:
            data?.styles?.length > 0 &&
            this.queryUtils.createScalarListMutateInput(
              data.styles,
              brand.id,
              "update"
            ),
          logoImage: brandImages &&
            brandImages.logoID && { connect: { id: brandImages.logoID } },
          images: brandImages &&
            brandImages.imageIDs && { set: brandImages.imageIDs },
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
