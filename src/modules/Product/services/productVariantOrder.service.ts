import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import {
  BillingInfo,
  Customer,
  Location,
  PhysicalProductPrice,
  User,
} from "@app/prisma"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import { pick, sumBy } from "lodash"

type InvoiceInput = {
  customer_id: string
  charges: Array<{
    amount: number
    description: string
    taxable: boolean
    avalara_tax_code: string
  }>
  shipping_address: {
    first_name: string
    last_name: string
    email: string
    company: string
    line1: string
    line2: string
    city: string
    state_code: string
    zip: string
    country: string
  }
  invoice_note: string
}

type DraftOrder = {
  total: number
  lineItems: Array<{
    description: string
    amount: number
  }>
  shippingAddress: Location
}

@Injectable()
export class ProductVariantOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService,
    private readonly shipping: ShippingService
  ) {}

  async getBuyUsedMetadata({
    productVariantId,
    customer,
    user,
  }: {
    productVariantId: string
    customer: Customer
    user: User
  }): Promise<{
    invoice: InvoiceInput
    shippingAddress: Location
  }> {
    const productVariant = await this.prisma.binding.query.productVariant(
      {
        where: {
          id: productVariantId,
        },
      },
      `{
        physicalProducts {
          price {
            buyUsedEnabled
            buyUsedPrice
          }
        }
        product {
          name
        }
      }`
    )

    const shippingAddress = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .shippingAddress()

    // FIXME: We're assuming that every physical product has the same price for a variant,
    // so take the first valid result.
    const price: PhysicalProductPrice | null = productVariant?.physicalProducts.find(
      physicalProduct =>
        physicalProduct.price && physicalProduct.price.buyUsedEnabled
    )?.price

    const productName = productVariant?.product?.name
    const [firstName, ...lastName] = (shippingAddress?.name || "").split(" ")

    if (!price?.buyUsedEnabled || !price?.buyUsedPrice) {
      throw new Error(
        "ProductVariant is not enabled for buyUsed, or is missing a price."
      )
    }

    const shippingRate = await this.shipping.getBuyUsedShippingRate(
      productVariantId,
      user,
      customer
    )

    return {
      shippingAddress,
      invoice: {
        customer_id: user.id,
        invoice_note: `Purchase Used ${productName}`,
        shipping_address: {
          first_name: firstName,
          last_name: lastName.join(" "),
          email: user.email,
          company: shippingAddress.company,
          line1: shippingAddress.address1,
          line2: shippingAddress.address2,
          city: shippingAddress.city,
          state_code: shippingAddress.state,
          zip: shippingAddress.zipCode,
          country: shippingAddress.country || "US",
        },
        charges: [
          {
            amount: price?.buyUsedPrice * 100,
            description: productName,
            taxable: true,
            avalara_tax_code: "PC040000", // FIXME: outerwear has different code: https://seasonsnyc.slack.com/archives/D01E4L7AGNM/p1611939000004900
          },
          {
            amount: parseFloat(shippingRate.amount) * 100,
            description: shippingRate.servicelevel.name,
            taxable: true,
            avalara_tax_code: "FR020000",
          },
        ],
      },
    }
  }

  async getBuyNewMetadata({
    productVariantId,
    customerId,
  }: {
    productVariantId: string
    customerId: string
  }): Promise<{
    shippingAddress: Location
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
    userId: string
    emailAddress: string
    productName: string
    shopifyProductVariantInternalId: string
    shopifyProductVariantExternalId: string
    accessToken: string
    shopName: string
  }> {
    const [productVariant, customer] = await Promise.all([
      this.prisma.binding.query.productVariant(
        {
          where: {
            id: productVariantId,
          },
        },
        `{
        product {
          buyNewEnabled
          name
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
      ),
      this.prisma.binding.query.customer(
        {
          where: {
            id: customerId,
          },
        },
        `
      {
        user {
          id
          email
        }
        detail {
          shippingAddress {
            name
            company
            address1
            address2
            city
            state
            zipCode
            country
          }
        }
        billingInfo {
          name
          street1
          street2
          city
          state
          postal_code
          country
        }
      }
    `
      ),
    ])

    const { buyNewEnabled, name: productName } = productVariant?.product
    const { enabled, shopName, accessToken } =
      productVariant?.product?.brand?.externalShopifyIntegration || {}
    const {
      id: shopifyProductVariantInternalId,
      externalId: shopifyProductVariantExternalId,
    } = productVariant?.shopifyProductVariant || {}

    const shippingAddress = customer?.detail?.shippingAddress
    const billingAddress = customer?.billingInfo
    const { email: emailAddress, id: userId } = customer?.user

    if (
      !buyNewEnabled ||
      !enabled ||
      !shopName ||
      !accessToken ||
      !shopifyProductVariantExternalId
    ) {
      throw new Error(
        "Buy new is not enabled for this product, or data for Shopify product mapping is missing."
      )
    }

    if (!shippingAddress || !billingAddress) {
      throw new Error("Customer is missing billing or shipping information.")
    }

    return {
      userId,
      productName,
      shippingAddress: shippingAddress as Location,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      shopifyProductVariantInternalId,
      accessToken,
      shopName,
    }
  }

  async buyNewCreateOrder({
    productVariantId,
    customerId,
  }: {
    productVariantId: string
    customerId: string
  }): Promise<void> {
    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      shopifyProductVariantInternalId,
      accessToken,
      shopName,
    } = await this.getBuyNewMetadata({ productVariantId, customerId })

    // Bypass internal cache and directly ensure product is still available at the merchant.
    const shopifyProductVariant = await this.shopify.cacheProductVariant({
      shopifyProductVariantExternalId,
      shopifyProductVariantInternalId,
      shopName,
      accessToken,
    })

    if (!shopifyProductVariant.cachedAvailableForSale) {
      throw new Error("Product variant is unavailable for sale.")
    }

    const { id: shopifyCustomerId } = await this.shopify.createCustomer({
      shippingAddress,
      shopName,
      accessToken,
    })

    const draftOrder = await this.shopify.createDraftOrder({
      shopifyCustomerId,
      shopifyProductVariantExternalId,
      accessToken,
      shopName,
      billingAddress,
      emailAddress,
    })

    // TODO: Collect payment via Stripe connect
    // TODO: Complete Shopify Draft Order and mark as paid?
    // return draftOrder
  }

  async buyNewCreateDraftOrder({
    productVariantId,
    customerId,
  }: {
    productVariantId: string
    customerId: string
  }): Promise<DraftOrder> {
    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      productName,
      accessToken,
      shopName,
    } = await this.getBuyNewMetadata({ productVariantId, customerId })
    const { id: shopifyCustomerId } = await this.shopify.createCustomer({
      shippingAddress,
      shopName,
      accessToken,
    })

    const { draftOrder } = await this.shopify.calculateDraftOrder({
      shopifyCustomerId,
      shopifyProductVariantId: shopifyProductVariantExternalId,
      emailAddress,
      billingAddress,
      accessToken,
      shopName,
    })

    return {
      total: draftOrder.totalPrice,
      shippingAddress,
      lineItems: [
        {
          description: productName,
          amount: draftOrder.subtotalPrice,
        },
        {
          description: "Sales Tax",
          amount: draftOrder.totalTax,
        },
        {
          description: "Shipping",
          amount: draftOrder.totalShippingPrice,
        },
      ],
    }
  }

  async buyUsedCreateDraftOrder({
    productVariantId,
    customer,
    user,
  }: {
    productVariantId: string
    customer: Customer
    user: User
  }) {
    const { invoice, shippingAddress } = await this.getBuyUsedMetadata({
      productVariantId,
      customer,
      user,
    })

    const invoiceEstimateInput = {
      invoice: pick(invoice, ["customer_id"]),
      ...pick(invoice, ["charges", "shipping_address"]),
    }

    console.log(invoiceEstimateInput)

    const {
      estimate: { invoice_estimate },
    } = await chargebee.estimate.create_invoice(invoiceEstimateInput).request()

    console.log("chargebee invoice estimate", invoice_estimate)

    const unitLineItem = {
      amount: invoice_estimate.line_items[0].unit_amount,
      description: invoice_estimate.line_items[0].description,
    }
    const taxLineItem = {
      description: "Sales Tax",
      amount: sumBy(
        invoice_estimate.line_items,
        ({ tax_amount }) => tax_amount
      ),
    }
    const shippingLineItem = {
      amount: invoice_estimate.line_items[1].unit_amount,
      description: "Shipping",
    }

    return {
      total: invoice_estimate.total || 0,
      lineItems: [unitLineItem, taxLineItem, shippingLineItem],
      shippingAddress,
    }
  }

  async buyUsedCreateOrder({
    productVariantId,
    customer,
    user,
  }: {
    productVariantId: string
    customer: Customer
    user: User
  }) {
    // TODO: check if user has a reservation for a physical product for this variant that is delivered and
    // has buy used enabled. if so, do not include shipping costs
    const { invoice } = await this.getBuyUsedMetadata({
      productVariantId,
      customer,
      user,
    })

    await chargebee.invoice.create(invoice).request()

    const shippoTransaction = await this.shipping.createBuyUsedShippingLabel(
      productVariantId,
      user,
      customer
    )

    // TODO: create internal order model, associate label, send confirmation email
  }
}
