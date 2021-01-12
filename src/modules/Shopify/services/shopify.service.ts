import crypto from "crypto"
import querystring from "querystring"

import {
  Brand,
  ExternalShopifyIntegration,
  Product,
  ProductVariant,
  ShopifyProductVariant,
  ShopifySelectedOption,
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
    console.log(shopName, accessToken, query)

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
        (error, response, body) => {
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
  }) {
    const query = `{
      productVariant(id: "${externalId}") {
        availableForSale
        price
      }
    }`

    const data: any = await this.queryShopify({ query, shopName, accessToken })
    const productVariant = data?.productVariant

    if (!productVariant) {
      throw new Error("Unable to find shopify product variant.")
    }

    return productVariant
  }

  async getShopifyProductVariantBySelectedOptions({
    internalShopifyProductVariantId,
    productHandle,
    selectedOptions,
    accessToken,
    shopName,
  }: {
    internalShopifyProductVariantId: string
    productHandle: string
    selectedOptions: Array<{ name: string; value: string }>
    accessToken: string
    shopName: string
  }): Promise<{ availableForSale: boolean; price: string }> {
    const query = `{
      productByHandle(handle: "${productHandle}") {
        variants(first: 100) {
          edges {
            node {
              id
              availableForSale
              price
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }`

    const data: any = await this.queryShopify({ query, shopName, accessToken })

    const {
      node: shopifyProductVariant,
    } = data?.productByHandle?.variants.edges.find(
      ({ node: shopifyProductVariant }) => {
        return selectedOptions.every(({ name, value }) => {
          return shopifyProductVariant.options.find(option => {
            return (
              option.name === name &&
              option.values.some(optionValue => optionValue === value)
            )
          })
        })
      }
    )

    if (!shopifyProductVariant) {
      throw new Error("Unable to match shopify product variant.")
    }

    // persist matched shopify product variant id so subsequent lookups are direct.
    await this.prisma.client.updateShopifyProductVariant({
      where: { id: internalShopifyProductVariantId },
      data: {
        externalID: shopifyProductVariant.id,
      },
    })

    return shopifyProductVariant
  }

  async cacheProductVariant(
    productVariantId: string
  ): Promise<ShopifyProductVariant> {
    const productVariant: ProductVariant & {
      shopifyProductVariant: ShopifyProductVariant & {
        selectedOptions: Array<ShopifySelectedOption>
      }
      product: Product & {
        brand: Brand & {
          externalShopifyIntegration: ExternalShopifyIntegration
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
        externalShopifyProductHandle
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
        selectedOptions {
          name
          value
        }
        externalID
      }
    }`
    )

    const { enabled, shopName, accessToken } =
      productVariant?.product?.brand?.externalShopifyIntegration || {}
    const {
      id: internalShopifyProductVariantId,
      externalID,
      selectedOptions,
    } = productVariant?.shopifyProductVariant
    const { externalShopifyProductHandle } = productVariant?.product

    if (
      !enabled ||
      !shopName ||
      !accessToken ||
      !selectedOptions ||
      !externalShopifyProductHandle
    ) {
      return Promise.reject(
        "Missing data required for Shopify product mapping."
      )
    }

    const externalShopifyProductVariant = externalID
      ? await this.getShopifyProductVariantByExternalId({
          externalId: externalID,
          accessToken,
          shopName,
        })
      : await this.getShopifyProductVariantBySelectedOptions({
          internalShopifyProductVariantId,
          productHandle: externalShopifyProductHandle,
          selectedOptions,
          accessToken,
          shopName,
        })

    return this.prisma.client.updateShopifyProductVariant({
      where: { id: internalShopifyProductVariantId },
      data: {
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
