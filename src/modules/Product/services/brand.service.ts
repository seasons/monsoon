import * as url from "url"

import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { IndexKey } from "@modules/Search/services/algolia.service"
import { SearchService } from "@modules/Search/services/search.service"
import { Injectable } from "@nestjs/common"
import { BrandWhereUniqueInput, ShopifyShopUpdateOneInput } from "@prisma/index"
import {
  BrandUpdateOneInput,
  Brand as PrismaBindingBrand,
} from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: BrandUtilsService,
    private readonly search: SearchService
  ) {}

  async createBrand({ input }: { input: any }) {
    // Store images and get their record ids to connect to the brand
    const { logoID, imageIDs } = await this.utils.createBrandImages(input)

    return await this.prisma.client.createBrand({
      ...input,
      styles: input?.styles?.length > 0 ? { set: input.styles } : { set: [] },
      logoImage: logoID && { connect: { id: logoID } },
      images: imageIDs && { connect: imageIDs },
    })
  }

  async updateBrand({
    where,
    data,
  }: {
    where: BrandWhereUniqueInput
    data: any
  }) {
    const brand: PrismaBindingBrand = await this.prisma.binding.query.brand(
      { where },
      `{
          id
          shopifyShop {
            id
          }
      }`
    )

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
      } as ShopifyShopUpdateOneInput
      const shopifyProductVariants = await this.prisma.client.shopifyProductVariants(
        {
          where: {
            shop: {
              shopName,
            },
          },
        }
      )

      for (let shopifyPV of shopifyProductVariants) {
        await this.prisma.client.updateShopifyProductVariant({
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
      }

      // Index shopify product variants into algolia
    } else if (brand?.shopifyShop?.id) {
      data.shopifyShop = { delete: true }
    }

    const updatedBrand = await this.prisma.client.updateBrand({
      where,
      data: {
        ...data,
        styles: data?.styles?.length > 0 && { set: data.styles },
        logoImage: brandImages &&
          brandImages.logoID && { connect: { id: brandImages.logoID } },
        images: brandImages &&
          brandImages.imageIDs && { set: brandImages.imageIDs },
      },
    })

    if (data.shopifyShop) {
      await this.search.indexShopifyProductVariants(
        [IndexKey.Default, IndexKey.Admin, IndexKey.ShopifyProductVariant],
        updatedBrand.id
      )
    }

    return updatedBrand
  }
}
