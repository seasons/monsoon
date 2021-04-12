import * as url from "url"

import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { IndexKey } from "@modules/Search/services/algolia.service"
import { SearchService } from "@modules/Search/services/search.service"
import { Injectable } from "@nestjs/common"
import { BrandWhereUniqueInput } from "@prisma/index"
import { Brand as PrismaBindingBrand } from "@prisma/prisma.binding"
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
          externalShopifyIntegration {
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

    if (data.externalShopifyIntegration) {
      data.externalShopifyIntegration = {
        upsert: {
          update: data.externalShopifyIntegration,
          create: data.externalShopifyIntegration,
        },
      }
    } else if (brand?.externalShopifyIntegration?.id) {
      data.externalShopifyIntegration = { delete: true }
    }

    const updatedBrand = await this.prisma.client.updateBrand({
      where,
      data: {
        ...data,
        logoImage: brandImages &&
          brandImages.logoID && { connect: { id: brandImages.logoID } },
        images: brandImages &&
          brandImages.imageIDs && { set: brandImages.imageIDs },
      },
    })

    if (data.externalShopifyIntegration) {
      await this.search.indexShopifyProductVariants(
        [IndexKey.Default, IndexKey.Admin, IndexKey.ShopifyProductVariant],
        updatedBrand.id
      )
    }

    return updatedBrand
  }
}
