import crypto from "crypto"

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
  SHOPIFY_APP_NONCE,
} = process.env

const VALID_SHOPIFY_HOSTNAME = /\A(https|http)\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\//
const PRODUCT_VARIANT_CACHE_SECONDS = 60 * 30 // 30 minutes

type AccessToken = {
  accessToken: string
  scope: string
}

@Injectable()
export class ShopifyService {
  constructor(private readonly prisma: PrismaService) {}

  isValidAuthorizationCode({
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
    const queryWithoutHmac = `code=${authorizationCode}&shop=${shop}&state=${nonce}&timestamp=${timestamp}`
    const ownHmac = crypto
      .createHmac("sha256", SHOPIFY_API_SECRET_KEY)
      .update(queryWithoutHmac)
      .digest("hex")

    return (
      nonce === SHOPIFY_APP_NONCE &&
      VALID_SHOPIFY_HOSTNAME.test(shop) &&
      ownHmac === hmac
    )
  }

  async getAccessToken({
    shop,
    authorizationCode,
  }: {
    shop: string
    authorizationCode: string
  }): Promise<AccessToken> {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: `https://${shop}.myshopify.com/admin/oauth/access_token`,
          method: "POST",
          body: {
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET_KEY,
            code: authorizationCode,
          },
          json: true,
        },
        (err, response) => {
          if (err) {
            return reject(err)
          }
          return resolve(response.toJSON().body)
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
          uri: `https://${shopName}.myshopify.com/admin/oauth/access_token`,
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": accessToken,
          },
          body: query.trim(),
        },
        (error, _response, body) => {
          if (error) {
            reject(error)
            return
          }
          resolve(body)
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
    const query = `
      query {
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
    const query = `
      query {
        product(handle: "${productHandle}") {
          variants(first: 100) {
            edges {
              node {
                id
                availableForSale
                price
                options {
                  name
                  values
                }
              }
            }
          }
        }
      }`

    const data: any = await this.queryShopify({ query, shopName, accessToken })

    const { node: shopifyProductVariant } = data?.product?.variants.edges.find(
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
