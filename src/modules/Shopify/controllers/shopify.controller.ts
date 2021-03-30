import { PrismaService } from "@app/prisma/prisma.service"
import { Controller, Get, Query, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"

import { ShopifyService } from "../services/shopify.service"

@Controller("shopify")
export class ShopifyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService
  ) {}

  // https://shopify.dev/tutorials/authenticate-with-oauth#step-2-ask-for-permission
  @Get("install")
  async shopifyInstall(
    @Query("hmac") hmac: string,
    @Query("shop") shop: string,
    @Query("timestamp") timestamp: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const isValidHMAC = this.shopify.isValidHMAC({
      hmac,
      params: { shop, timestamp },
    })

    if (!isValidHMAC) {
      res.status(401).send("HMAC is invalid.")
      return
    }

    try {
      const oauthURL = await this.shopify.getOAuthURL({
        shop,
      })
      return res.redirect(oauthURL)
    } catch (error) {
      console.error(error)

      res
        .status(401)
        .send(
          "Unable to install Shopify App. Contact Seasons for more information."
        )

      return
    }
  }

  // https://shopify.dev/tutorials/authenticate-with-oauth#step-3-confirm-installation
  @Get("oauth-redirect")
  async shopifyOAuthRedirect(
    @Query("code") authorizationCode: string,
    @Query("hmac") hmac: string,
    @Query("timestamp") timestamp: string,
    @Query("state") nonce: string,
    @Query("shop") shop: string,
    @Res() res: Response
  ) {
    const isValid = await this.shopify.isValidAuthorizationCode({
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

    const accessToken = await this.shopify.getAccessToken({
      authorizationCode,
      shop,
    })

    await this.prisma.client.updateExternalShopifyIntegration({
      where: { shopName: this.shopify.getShopName(shop) },
      data: {
        accessToken,
      },
    })

    return res.redirect("https://wearseasons.com")
  }
}
