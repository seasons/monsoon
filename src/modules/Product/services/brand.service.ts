import * as url from "url"

import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { Injectable } from "@nestjs/common"
import {
  BrandWhereUniqueInput,
  ExternalShopifyIntegrationUpdateOneInput,
} from "@prisma/index"
import {
  BrandUpdateOneInput,
  Brand as PrismaBindingBrand,
} from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: BrandUtilsService
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

    const { logoID, imageIDs } = await this.utils.createBrandImages(data)

    if (data.externalShopifyIntegration) {
      const shopName = data.externalShopifyIntegration.shopName

      data.externalShopifyIntegration = {
        connect: {
          shopName,
        },
      } as ExternalShopifyIntegrationUpdateOneInput
      // const shopifyProductVariants = await this.prisma.client.shopifyProductVariants(
      //   {
      //     where: {
      //       shop: {
      //         shopName,
      //       },
      //     },
      //   }
      // )

      // for (let shopifyPV of shopifyProductVariants) {
      //   this.prisma.client.updateShopifyProductVariant({
      //     where: {
      //       id: shopifyPV.id,
      //     },
      //     data: {
      //       brand: {
      //         connect: {
      //           id: brand.id,
      //         },
      //       },
      //     },
      //   })
      // }
    } else if (brand?.externalShopifyIntegration?.id) {
      data.externalShopifyIntegration = { delete: true }
    }

    return await this.prisma.client.updateBrand({
      where,
      data: {
        ...data,
        logoImage: logoID && { connect: { id: logoID } },
        images: imageIDs && { set: imageIDs },
      },
    })
  }
}
