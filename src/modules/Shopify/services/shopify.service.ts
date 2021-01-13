import crypto from "crypto"
import querystring from "querystring"

import {
  Brand,
  ExternalShopifyIntegration,
  Product,
  ProductVariant,
  ShopifyProductVariant,
} from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { DateTime } from "luxon"
import request from "request"

import { PrismaService } from "../../../prisma/prisma.service"

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_OAUTH_REDIRECT_URL,
} = process.env

const PRODUCT_VARIANT_CACHE_SECONDS = 60 * 30 // 30 minutes

@Injectable()
export class ShopifyService {
  constructor(private readonly prisma: PrismaService) {}

  getShopName = (shop: string) => {
    const matches = shop.match(/(.*)\.myshopify\.com/)

    return matches && matches.length === 2 ? matches[1] : shop
  }

  async getOAuthURL({ shop }: { shop: string }): Promise<string> {
    const shopName = this.getShopName(shop)
    const nonce: string = await new Promise((resolve, reject) => {
      crypto.randomBytes(48, (error, buffer) => {
        if (error) {
          reject(error)
          return
        }

        resolve(buffer.toString("hex"))
      })
    })

    await this.prisma.client.updateExternalShopifyIntegration({
      where: {
        shopName,
      },
      data: { nonce },
    })

    const query = querystring.stringify({
      client_id: SHOPIFY_API_KEY,
      scope: ["read_products", "write_draft_orders"].join(","),
      redirect_uri: SHOPIFY_OAUTH_REDIRECT_URL,
      state: nonce,
    })

    return `https://${shopName}.myshopify.com/admin/oauth/authorize?${query}`
  }

  isValidHMAC({
    hmac,
    params,
  }: {
    hmac: string
    params: { [key: string]: string }
  }): boolean {
    const ownHMAC = crypto
      .createHmac("sha256", SHOPIFY_API_SECRET_KEY)
      .update(querystring.stringify(params))
      .digest("hex")

    return ownHMAC === hmac
  }

  async isValidAuthorizationCode({
    authorizationCode,
    hmac,
    timestamp,
    nonce,
    shop,
  }: {
    authorizationCode: string
    hmac: string
    timestamp: string
    nonce: string
    shop: string
  }) {
    const isValidHMAC = this.isValidHMAC({
      hmac,
      params: { code: authorizationCode, shop, state: nonce, timestamp },
    })

    const externalShopifyIntegration = await this.prisma.client.externalShopifyIntegration(
      {
        shopName: this.getShopName(shop),
      }
    )

    return (
      externalShopifyIntegration &&
      nonce === externalShopifyIntegration.nonce &&
      isValidHMAC
    )
  }

  async getAccessToken({
    shop,
    authorizationCode,
  }: {
    shop: string
    authorizationCode: string
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: `https://${this.getShopName(
            shop
          )}.myshopify.com/admin/oauth/access_token`,
          method: "POST",
          body: {
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET_KEY,
            code: authorizationCode,
          },
          json: true,
        },
        (err, _response, body) => {
          if (err) {
            return reject(err)
          }
          return resolve(body.access_token)
        }
      )
    })
  }

  queryShopify({
    shopName,
    query,
    accessToken,
  }: {
    shopName: string
    query: string
    accessToken: string
  }): Promise<{ availableForSale: boolean; price: string }> {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: `https://${shopName}.myshopify.com/admin/api/2021-01/graphql.json`,
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": accessToken,
          },
          body: { query: query.trim() },
          json: true,
        },
        (error, _response, body) => {
          if (error) {
            reject(error)
            return
          }
          resolve(body.data)
        }
      )
    })
  }

  async getShopifyProductVariantByExternalId({
    externalId,
    accessToken,
    shopName,
  }: {
    externalId: string
    accessToken: string
    shopName: string
  }): Promise<{
    availableForSale: boolean
    price: number
    externalId: string
  }> {
    const query = `{
      productVariant(id: "gid://shopify/ProductVariant/${externalId}") {
        availableForSale
        price
      }
    }`

    const data: any = await this.queryShopify({ query, shopName, accessToken })
    const productVariant = data?.productVariant

    if (!productVariant) {
      throw new Error("Unable to find shopify product variant.")
    }

    return {
      ...productVariant,
      price: parseFloat(productVariant.price),
    }
  }

  async cacheProductVariant(
    productVariantId: string
  ): Promise<ShopifyProductVariant> {
    const productVariant: ProductVariant & {
      shopifyProductVariant: Pick<ShopifyProductVariant, "id" | "externalId">
      product: {
        brand: {
          externalShopifyIntegration: Pick<
            ExternalShopifyIntegration,
            "enabled" | "shopName" | "accessToken"
          >
        }
      }
    } = await this.prisma.binding.query.productVariant(
      {
        where: {
          id: productVariantId,
        },
      },
      `{
      product {
        brand {
          externalShopifyIntegration {
            enabled
            shopName
            accessToken
          }
        }
      }
      shopifyProductVariant {
        id
        externalId
      }
    }`
    )

    const { enabled, shopName, accessToken } =
      productVariant?.product?.brand?.externalShopifyIntegration || {}
    const {
      id: internalShopifyProductVariantId,
      externalId,
    } = productVariant?.shopifyProductVariant

    if (!enabled || !shopName || !accessToken || !externalId) {
      return Promise.reject(
        "Missing data required for Shopify product mapping."
      )
    }

    const externalShopifyProductVariant = await this.getShopifyProductVariantByExternalId(
      {
        externalId: externalId,
        accessToken,
        shopName,
      }
    )

    return this.prisma.client.updateShopifyProductVariant({
      where: { id: internalShopifyProductVariantId },
      data: {
        externalId: externalShopifyProductVariant.externalId,
        cachedPrice: externalShopifyProductVariant.price,
        cachedAvailableForSale: externalShopifyProductVariant.availableForSale,
        cacheExpiresAt: DateTime.local()
          .plus({
            seconds: PRODUCT_VARIANT_CACHE_SECONDS,
          })
          .toISO(),
      },
    })
  }
}
