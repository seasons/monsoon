import crypto from "crypto"
import querystring from "querystring"

import { BillingInfo, Location, ShopifyProductVariant } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { minBy } from "lodash"
import { DateTime } from "luxon"
import request from "request"

import { PrismaService } from "../../../prisma/prisma.service"
import {
  DraftOrder,
  DraftOrderCreateInputVariables,
  MutationResult,
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

const productVariantGlobalId = (externalId: string): string =>
  `gid://shopify/ProductVariant/${externalId}`

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
      scope: OAUTH_SCOPES.join(","),
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
          uri: `https://${shopName}.myshopify.com/admin/api/2021-01/graphql.json`,
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
      productVariant(id: "${productVariantGlobalId(externalId)}") {
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
      price: parseFloat(productVariant.price),
    }
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
      productVariants(${after ? `after: ${after}, ` : ""}first: ${first}) {
        edges {
          node {
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
            variantId: productVariantGlobalId(shopifyProductVariantId),
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
            draftOrderCalculateResult?.calculatedDraftOrder?.userErrors
          )
      )
    }

    const {
      availableShippingRates,
      totalPrice,
      totalShippingPrice,
      subtotalPrice,
      totalTax,
    } = draftOrderCalculateResult?.calculatedDraftOrder?.calculatedDraftOrder

    // Use the cheapest shipping option available to create the draft order with.
    const shippingRate: any = minBy(
      availableShippingRates || [],
      rate => (rate as any)?.price?.amount
    )
    if (!shippingRate) {
      throw new Error("Unable to find merchant shipping rate to use for order.")
    }

    return {
      draftOrder: {
        totalPrice,
        totalShippingPrice,
        totalTax,
        subtotalPrice,
      },
      shippingRate: {
        title: shippingRate.title,
        price: shippingRate.price.amount,
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
  }): Promise<DraftOrder> {
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
            }
            userErrors {
              field
              message
            }
          }
        }
      `

    const draftOrderResult: MutationResult<{
      draftOrderCreate?: {
        draftOrder?: {
          id: string
          totalPrice: string
          totalShippingPrice: string
          totalTax: string
          subtotalPrice: string
        }
      }
    }> = await this.shopifyGraphQLRequest({
      query: draftOrderQuery,
      variables: draftOrderInputVariables,
      shopName,
      accessToken,
    })

    if ((draftOrderResult as any)?.draftOrderCreate?.userErrors?.length) {
      throw new Error(
        "Shopify draftOrderCreate error: " +
          JSON.stringify(
            (draftOrderResult as any)?.draftOrderCreate?.userErrors
          )
      )
    }

    /**
     * Use pricing from the calculated draft order, as creating a draft order updates shipping
     * information async, and may not be immediately available.
     */
    return {
      ...calculatedDraftOrder,
      id: draftOrderResult?.draftOrderCreate?.draftOrder?.id,
    }
  }

  async importProductVariants({
    brandId,
    shopName,
    accessToken,
  }: {
    brandId: string
    shopName: string
    accessToken: string
  }): Promise<Array<ShopifyProductVariant>> {
    const loop = async ({
      after,
      productVariants,
    }): Promise<Array<ProductVariant & { product: Product }>> => {
      const {
        edges,
        pageInfo: { hasNextPage },
      } = await this.getShopifyProductVariants({
        after,
        first: 25,
        shopName,
        accessToken,
      })
      const updatedProductVariants = [
        ...productVariants,
        ...edges.map(({ node }) => node),
      ]
      if (hasNextPage) {
        return loop({
          after: edges[edges.length - 1].cursor,
          productVariants: updatedProductVariants,
        })
      }

      return updatedProductVariants
    }

    const productVariants = await loop({ after: "", productVariants: [] })

    const shopifyProductVariantResults = []
    for (const productVariant of productVariants) {
      const data = {
        externalId: productVariant.id,
        displayName: productVariant.displayName,
        title: productVariant.title,
        selectedOptions: {
          create: productVariant.selectedOptions,
        },
        brand: {
          connect: {
            id: brandId,
          },
        },
        cachedPrice: parseFloat(productVariant.price),
        cachedAvailableForSale: productVariant.availableForSale,
        cacheExpiresAt: DateTime.local()
          .plus({
            seconds: PRODUCT_VARIANT_CACHE_SECONDS,
          })
          .toISO(),
      }
      const imageSrc =
        productVariant?.product?.images.edges?.[0]?.node?.transformedSrc

      const image = await (productVariants.length > 0
        ? this.prisma.client.image({
            url:
              productVariants[0].product?.images?.edges?.[0]?.node
                ?.transformedSrc,
          })
        : Promise.resolve(null))

      const getImageData = (type: "create" | "update") => {
        if (type === "create" && imageSrc && image) {
          return {
            connect: {
              url,
            },
          }
        }
      }

      const result = await this.prisma.client.upsertShopifyProductVariant({
        where: {
          externalId: productVariant.id,
        },
        create: {
          ...data,
          ...(imageSrc
            ? {
                image: {
                  connect: {
                    url: imageSrc,
                  },
                  create: {
                    url: imageSrc,
                  },
                },
              }
            : {}),
        },
        update: {
          ...data,
          ...(imageSrc
            ? {
                image: {
                  upsert: {
                    update: {
                      url: imageSrc,
                    },
                    create: {
                      url: imageSrc,
                    },
                  },
                },
              }
            : {}),
        },
      })
      shopifyProductVariantResults.push(result)
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

    return this.prisma.client.updateShopifyProductVariant({
      where: { id: shopifyProductVariantInternalId },
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
