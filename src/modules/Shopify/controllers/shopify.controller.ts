import { PrismaService } from "@app/prisma/prisma.service"
import { Controller, Get, Query, Res } from "@nestjs/common"
import { Response } from "express"

import { ShopifyService } from "../services/shopify.service"

@Controller("shopify")
export class ShopifyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService
  ) {}

  // https://shopify.dev/tutorials/authenticate-with-oauth#step-3-confirm-installation
  @Get("oauth_redirect")
  async shopifyAppInstallation(
    @Query("code") authorizationCode: string,
    @Query("hmac") hmac: string,
    @Query("timestamp") timestamp: string,
    @Query("state") nonce: string,
    @Query("shop") shop: string,
    @Res() res: Response
  ) {
    const isValid = this.shopify.isValidAuthorizationCode({
      authorizationCode,
      hmac,
      timestamp,
      nonce,
      shop,
    })

    if (!isValid) {
      res.status(401).send("Authorization code is invalid.")
      return
    }

    const { accessToken } = await this.shopify.getAccessToken({
      authorizationCode,
      shop,
    })

    const brand = await this.prisma.client.brands({
      where: {
        externalShopifyIntegration: {
          shopName: shop,
        },
      },
    })

    if (!brand || brand.length === 0) {
      res.status(403).send("No matching shop found.")
    }

    await this.prisma.client.updateBrand({
      data: {
        externalShopifyIntegration: {
          update: {
            accessToken,
          },
        },
      },
      where: {
        id: brand[0].id,
      },
    })

    return res.redirect("https://wearseasons.com")
  }
}
