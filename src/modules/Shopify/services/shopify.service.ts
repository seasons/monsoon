import crypto from "crypto"
import querystring from "querystring"

import { ShopifyProductVariantUpdateInput } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { BillingInfo, Location } from "@prisma/client"
import { ShopifyProductVariant } from "@prisma/client"
import { minBy, pick } from "lodash"
import { DateTime } from "luxon"
import request from "request"

import { PrismaService } from "../../../prisma/prisma.service"
import {
  DraftOrder,
  DraftOrderCreateInputVariables,
  MutationUserErrors,
  Product,
  ProductVariant,
} from "./shopify.types.d"

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_OAUTH_REDIRECT_URL,
} = process.env

const PRODUCT_VARIANT_CACHE_SECONDS = 60 * 30 // 30 minutes
const OAUTH_SCOPES = [
  "read_products",
  "write_draft_orders",
  "read_customers",
  "write_customers",
]

const ProductVariantFragment = `
  id
  displayName
  title
  availableForSale
  price
  selectedOptions {
    name
    value
  }
  product {
    images(first: 1) {
      edges {
        node {
          transformedSrc
        }
      }
    }
  }
`

@Injectable()
export class ShopifyService {
  constructor(private readonly prisma: PrismaService) {}

  getShopName = (shop: string) => {
    const matches = shop.match(/(.*)\.myshopify\.com/)

    return matches && matches.length === 2 ? matches[1] : shop
  }

  parseShopifyPriceToCents = (price: string | null): number =>
    Math.round(parseFloat(price || "0.00") * 100)

  async getOAuthURL({ shop }: { shop: string }): Promise<string> {
    const shopName = shop
    const nonce: string = await new Promise((resolve, reject) => {
      crypto.randomBytes(48, (error, buffer) => {
        if (error) {
          reject(error)
          return
        }

        resolve(buffer.toString("hex"))
      })
    })

    const query = querystring.stringify({
      client_id: SHOPIFY_API_KEY,
      scope: OAUTH_SCOPES.join(","),
      redirect_uri: SHOPIFY_OAUTH_REDIRECT_URL,
      state: nonce,
    })

    return `https://${shopName}/admin/oauth/authorize?${query}`
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

    const shopifyShop = await this.prisma.client.shopifyShop({
      shopName: this.getShopName(shop),
    })

    return shopifyShop && isValidHMAC
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
          uri: `https://${this.getShopName(shop)}/admin/oauth/access_token`,
          method: "POST",
          body: {
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET_KEY,
            code: authorizationCode,
          },
          json: true,
        },
        (err, _response, body) => {
          console.log(body)
          if (err) {
            return reject(err)
          }
          return resolve(body.access_token)
        }
      )
    })
  }

  shopifyGraphQLRequest<T>({
    shopName,
    query,
    accessToken,
    variables,
  }: {
    shopName: string
    query: string
    accessToken: string
    variables?: any
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: `https://${shopName}/admin/api/2021-01/graphql.json`,
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": accessToken,
          },
          body: { query: query.trim(), variables: variables || {} },
          json: true,
        },
        (error, _response, body) => {
          if (error) {
            reject(error)
            return
          }

          if (body.errors && body.errors.length) {
            reject(body.errors)
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
      productVariant(id: "${externalId}") {
        availableForSale
        price
      }
    }`

    const data: any = await this.shopifyGraphQLRequest({
      query,
      shopName,
      accessToken,
    })
    const productVariant = data?.productVariant

    if (!productVariant) {
      throw new Error("Unable to find shopify product variant.")
    }

    return {
      ...productVariant,
      price: this.parseShopifyPriceToCents(productVariant.price),
    }
  }

  async getShopifyProductVariantsByIds(
    ids: string[],
    shopName: string,
    accessToken: string
  ) {
    const query = `
      {
        productVariants: nodes(ids: ${JSON.stringify(ids)}) {
          ... on ProductVariant {
            ${ProductVariantFragment}
          }
        }
      }
    `

    const data: any = await this.shopifyGraphQLRequest({
      query,
      shopName,
      accessToken,
    })

    return data.productVariants
  }

  async getShopifyProductVariants({
    after,
    first,
    shopName,
    accessToken,
  }: {
    after: string
    first: number
    shopName: string
    accessToken: string
  }): Promise<{
    edges: Array<{
      node: ProductVariant & {
        product: Product
      }
      cursor: string
    }>
    pageInfo: {
      hasNextPage: boolean
    }
  }> {
    const query = `{
      productVariants(${!!after ? `after: "${after}", ` : ""}first: ${first}) {
        edges {
          node {
            ${ProductVariantFragment}
          }
          cursor
        }
        pageInfo {
          hasNextPage
        }
      }
    }`

    const data: any = await this.shopifyGraphQLRequest({
      query,
      shopName,
      accessToken,
    })

    return data.productVariants
  }

  async createCustomer({
    shippingAddress,
    shopName,
    accessToken,
  }: {
    shippingAddress: Pick<
      Location,
      | "address1"
      | "address2"
      | "city"
      | "state"
      | "country"
      | "zipCode"
      | "name"
    >
    shopName: string
    accessToken: string
  }) {
    const [shippingAddressFirstName, ...shippingAddressLastName] = (
      shippingAddress?.name || ""
    ).split(" ")

    const customerVariables = {
      input: {
        note: "Created by Seasons.",
        acceptsMarketing: false,
        taxExempt: true, // Use tax values from Avalara via Chargebee, not values from Brand Partner Shopify
        firstName: shippingAddressFirstName,
        lastName: shippingAddressLastName.join(" "),
        addresses: [
          {
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            province: shippingAddress.state,
            country: shippingAddress.country || "United States",
            zip: shippingAddress.zipCode,
            firstName: shippingAddressFirstName,
            lastName: shippingAddressLastName.join(" "),
          },
        ],
      },
    }
    const customerQuery = `
        mutation CreateCustomer($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `
    const customerResult = await this.shopifyGraphQLRequest<any>({
      query: customerQuery,
      accessToken,
      variables: customerVariables,
      shopName,
    })

    if (customerResult?.customerCreate?.userErrors?.length) {
      throw new Error(
        "Shopify Customer Create errors: " +
          JSON.stringify(customerResult?.customerCreate?.userErrors)
      )
    }

    return customerResult?.customerCreate?.customer
  }

  async calculateDraftOrder({
    shopifyCustomerId,
    shopifyProductVariantId,
    emailAddress,
    billingAddress,
    accessToken,
    shopName,
  }: {
    shopifyCustomerId: string
    shopifyProductVariantId: string
    emailAddress: string
    billingAddress: Pick<
      BillingInfo,
      | "street1"
      | "street2"
      | "city"
      | "state"
      | "country"
      | "postal_code"
      | "name"
    >
    accessToken: string
    shopName: string
  }): Promise<{
    shippingRate: { price: number; handle: string; title: string }
    inputVariables: DraftOrderCreateInputVariables
    draftOrder: DraftOrder
  }> {
    const [billingAddressFirstName, ...billingAddressLastName] = (
      billingAddress?.name || ""
    ).split(" ")

    const draftOrderCalculateVariables: DraftOrderCreateInputVariables = {
      input: {
        note: "Created by Seasons.",
        lineItems: [
          {
            variantId: shopifyProductVariantId,
            quantity: 1,
          },
        ],
        billingAddress: {
          address1: billingAddress.street1,
          address2: billingAddress.street2,
          city: billingAddress.city,
          province: billingAddress.state,
          country: billingAddress.country || "United States",
          zip: billingAddress.postal_code,
          firstName: billingAddressFirstName,
          lastName: billingAddressLastName.join(" "),
        },
        customerId: shopifyCustomerId,
        useCustomerDefaultAddress: true,
        email: emailAddress,
        taxExempt: true, // Use tax values from Avalara via Chargebee, not values from Brand Partner Shopify
      },
    }
    const draftOrderCalculateQuery = `
        mutation DraftOrderCalculate($input: DraftOrderInput!) {
          draftOrderCalculate(input: $input) {
            calculatedDraftOrder {
              availableShippingRates {
                title
                handle
                price {
                  amount
                }
              }
              totalPrice
              totalShippingPrice
              totalTax
              subtotalPrice
            }
            userErrors {
              field
              message
            }
          }
        }
      `
    const draftOrderCalculateResult = await this.shopifyGraphQLRequest<any>({
      query: draftOrderCalculateQuery,
      variables: draftOrderCalculateVariables,
      accessToken,
      shopName,
    })

    if (
      draftOrderCalculateResult?.draftOrderCalculate?.calculatedDraftOrder
        ?.userErrors?.length
    ) {
      throw new Error(
        "Shopify draftOrderCalculate errors: " +
          JSON.stringify(
            draftOrderCalculateResult?.draftOrderCalculate?.calculatedDraftOrder
              ?.userErrors
          )
      )
    }

    const {
      availableShippingRates,
      totalPrice,
      totalShippingPrice,
      subtotalPrice,
      totalTax,
    } = draftOrderCalculateResult?.draftOrderCalculate?.calculatedDraftOrder

    // Use the cheapest shipping option available to create the draft order with.
    const shippingRate: any = minBy(availableShippingRates || [], rate =>
      this.parseShopifyPriceToCents((rate as any)?.price?.amount)
    )
    if (!shippingRate) {
      throw new Error("Unable to find merchant shipping rate to use for order.")
    }

    return {
      draftOrder: {
        totalPrice: this.parseShopifyPriceToCents(totalPrice),
        totalShippingPrice: this.parseShopifyPriceToCents(totalShippingPrice),
        totalTax: this.parseShopifyPriceToCents(totalTax),
        subtotalPrice: this.parseShopifyPriceToCents(subtotalPrice),
      },
      shippingRate: {
        title: shippingRate.title,
        price: this.parseShopifyPriceToCents(shippingRate.price.amount),
        handle: shippingRate.handle,
      },
      inputVariables: draftOrderCalculateVariables,
    }
  }

  async createDraftOrder({
    shopifyCustomerId,
    shopifyProductVariantExternalId,
    accessToken,
    shopName,
    billingAddress,
    emailAddress,
  }: {
    shopifyCustomerId: string
    shopifyProductVariantExternalId: string
    accessToken: string
    shopName: string
    emailAddress: string
    billingAddress: Pick<
      BillingInfo,
      | "name"
      | "street1"
      | "street2"
      | "city"
      | "state"
      | "postal_code"
      | "country"
    >
  }): Promise<DraftOrder & { shippingLine: { title: string } }> {
    const {
      shippingRate,
      inputVariables: draftOrderInputVariables,
      draftOrder: calculatedDraftOrder,
    } = await this.calculateDraftOrder({
      shopName,
      accessToken,
      shopifyCustomerId,
      shopifyProductVariantId: shopifyProductVariantExternalId,
      emailAddress,
      billingAddress,
    })

    draftOrderInputVariables.input.shippingLine = {
      shippingRateHandle: shippingRate.handle,
      price: shippingRate.price,
      title: shippingRate.title,
    }

    const draftOrderQuery = `
        mutation CreateDraftOrder($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
              totalPrice
              totalShippingPrice
              totalTax
              subtotalPrice
              shippingLine {
                title
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `

    const draftOrderResult: {
      draftOrderCreate?: {
        draftOrder?: {
          id: string
          totalPrice: string
          totalShippingPrice: string
          totalTax: string
          subtotalPrice: string
          shippingLine: {
            title: string
          }
        }
      } & MutationUserErrors
    } = await this.shopifyGraphQLRequest({
      query: draftOrderQuery,
      variables: draftOrderInputVariables,
      shopName,
      accessToken,
    })

    if (draftOrderResult.draftOrderCreate?.userErrors?.length) {
      throw new Error(
        "Shopify draftOrderCreate error: " +
          JSON.stringify(draftOrderResult?.draftOrderCreate?.userErrors)
      )
    }

    /**
     * Use pricing from the calculated draft order, as creating a draft order updates shipping
     * information async, and may not be immediately available.
     */
    return {
      ...calculatedDraftOrder,
      ...pick(draftOrderResult?.draftOrderCreate?.draftOrder, [
        "id",
        "shippingLine",
      ]),
    }
  }

  async completeDraftOrder({
    orderId,
    shopName,
    accessToken,
  }: {
    orderId: string
    shopName: string
    accessToken: string
  }) {
    const completeDraftOrderQuery = `
      mutation CompleteDraftOrder($id: ID!) {
        draftOrderComplete(id: $id) {
          draftOrder {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const completeDraftOrderResult: {
      draftOrderComplete: { draftOrder: { id: string } } & MutationUserErrors
    } = await this.shopifyGraphQLRequest({
      query: completeDraftOrderQuery,
      variables: { id: orderId },
      shopName,
      accessToken,
    })

    if (completeDraftOrderResult?.draftOrderComplete?.userErrors?.length) {
      throw new Error(
        "Shopify draftOrderCreate error: " +
          JSON.stringify(
            completeDraftOrderResult?.draftOrderComplete?.userErrors
          )
      )
    }

    return completeDraftOrderResult?.draftOrderComplete?.draftOrder
  }

  async deleteDraftOrder({ orderId, shopName, accessToken }): Promise<string> {
    const deleteDraftOrderQuery = `
      mutation DraftOrderDelete($input: DraftOrderDeleteInput!) {
        draftOrderDelete(input: $input) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `

    const deleteDraftOrderResult: {
      draftOrderDelete: { deletedId: string } & MutationUserErrors
    } = await this.shopifyGraphQLRequest({
      query: deleteDraftOrderQuery,
      variables: { input: { id: orderId } },
      shopName,
      accessToken,
    })

    if (deleteDraftOrderResult?.draftOrderDelete?.userErrors?.length) {
      throw new Error(
        "Shopify draftOrderDelete error: " +
          JSON.stringify(deleteDraftOrderResult?.draftOrderDelete?.userErrors)
      )
    }

    return deleteDraftOrderResult?.draftOrderDelete?.deletedId
  }

  async importProductVariants({
    brandId,
    shopName,
    accessToken,
    ids,
  }: {
    brandId?: string
    shopName: string
    accessToken: string
    ids?: string[]
  }): Promise<Array<ShopifyProductVariant>> {
    function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    const shopifyProductVariantResults = []

    const processVariants = async productVariants => {
      for (const productVariant of productVariants) {
        try {
          const imageSrc =
            productVariant?.product?.images.edges?.[0]?.node?.transformedSrc

          const image = !!imageSrc
            ? await this.prisma.client2.image.upsert({
                where: {
                  url: imageSrc,
                },
                create: {
                  url: imageSrc,
                },
                update: {
                  url: imageSrc,
                },
              })
            : null

          const data = {
            externalId: productVariant.id,
            displayName: productVariant.displayName,
            title: productVariant.title,
            selectedOptions: {
              create: productVariant.selectedOptions,
            },
            ...(brandId && {
              brand: {
                connect: {
                  id: brandId,
                },
              },
            }),
            shop: {
              connect: {
                shopName,
              },
            },
            ...(imageSrc && {
              image: {
                connect: {
                  url: image.url,
                },
              },
            }),
            cachedPrice: this.parseShopifyPriceToCents(productVariant.price),
            cachedAvailableForSale: productVariant.availableForSale,
            cacheExpiresAt: DateTime.local()
              .plus({
                seconds: PRODUCT_VARIANT_CACHE_SECONDS,
              })
              .toISO(),
          }

          const result = await this.prisma.client2.shopifyProductVariant.upsert(
            {
              where: {
                externalId: productVariant.id,
              },
              create: data,
              update: data,
            }
          )
          shopifyProductVariantResults.push(result)
        } catch (e) {
          console.error(
            "Error processing shopify product variant: ",
            productVariant.displayName
          )
        }
      }
    }

    const loop = async ({
      after,
      productVariants,
    }): Promise<Array<ProductVariant & { product: Product }>> => {
      const {
        edges,
        pageInfo: { hasNextPage },
      } = await this.getShopifyProductVariants({
        after: !!after ? after : null,
        first: 100,
        shopName,
        accessToken,
      })
      const newProductVariants = edges.map(({ node }) => node)

      const updatedProductVariants = [...productVariants, ...newProductVariants]
      await processVariants(newProductVariants)

      if (hasNextPage) {
        await timeout(1000)
        return loop({
          after: edges[edges.length - 1].cursor,
          productVariants: updatedProductVariants,
        })
      }

      return updatedProductVariants
    }
    if (!!ids) {
      const productVariants = await this.getShopifyProductVariantsByIds(
        ids,
        shopName,
        accessToken
      )

      await processVariants(productVariants)
    } else {
      await loop({ after: "", productVariants: [] })
    }

    return shopifyProductVariantResults
  }

  /*
   * Fetch price and availability information from Shopify for a product variant
   */
  async cacheProductVariantBuyMetadata({
    shopifyProductVariantExternalId,
    shopifyProductVariantInternalId,
    shopName,
    accessToken,
  }: {
    shopifyProductVariantExternalId: string
    shopifyProductVariantInternalId: string
    shopName: string
    accessToken: string
  }): Promise<ShopifyProductVariant> {
    const externalShopifyProductVariant = await this.getShopifyProductVariantByExternalId(
      {
        externalId: shopifyProductVariantExternalId,
        accessToken,
        shopName,
      }
    )

    const cacheExpiresAt = DateTime.local()
      .plus({
        seconds: PRODUCT_VARIANT_CACHE_SECONDS,
      })
      .toISO()
    return this.prisma.client2.shopifyProductVariant.update({
      where: { id: shopifyProductVariantInternalId },
      data: {
        externalId: externalShopifyProductVariant.externalId,
        cachedPrice: externalShopifyProductVariant.price,
        cachedAvailableForSale: externalShopifyProductVariant.availableForSale,
        cacheExpiresAt,
      },
    })
  }
}
