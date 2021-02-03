import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import {
  BagItem,
  BillingInfo,
  Customer,
  Location,
  Order,
  OrderItem,
  PhysicalProduct,
  PhysicalProductPrice,
  Product,
  User,
} from "@app/prisma"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import { pick } from "lodash"

type InvoiceCharge = {
  amount: number
  description: string
  taxable: boolean
  avalara_tax_code: string
}

type InvoiceInput = {
  customer_id: string
  charges: Array<InvoiceCharge>
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
    private readonly shipping: ShippingService,
    private readonly productUtils: ProductUtilsService
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
    orderItems: OrderItem[]
  }> {
    const productVariant = await this.prisma.binding.query.productVariant(
      {
        where: {
          id: productVariantId,
        },
      },
      `{
          id
          physicalProducts {
            id
            price {
              buyUsedEnabled
              buyUsedPrice
            }
          }
          product {
            id
            name
          }
        }`
    )
    const customerQuery = await this.prisma.binding.query.customer(
      {
        where: {
          id: customer.id,
        },
      },
      `{
        id
        user {
          firstName
          lastName
        }
        detail {
          id
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
        bagItems {
          status
          productVariant {
            id
          }
        }
      }`
    )

    // FIXME: We're assuming that every physical product has the same price for a variant,
    // so take the first valid result.
    //
    // FIXME: this needs a check to ensure item isnt "out of stock"
    const physicalProduct = productVariant?.physicalProducts.find(
      physicalProduct =>
        physicalProduct.price && physicalProduct.price.buyUsedEnabled
    ) as (PhysicalProduct & { price: PhysicalProductPrice }) | null
    const productName = productVariant?.product?.name
    const productCategories = await this.productUtils.getAllCategories({
      id: productVariant?.product?.id,
    } as Product)
    const productTaxCode = productCategories.some(
      ({ name }) => name === "outerwear"
    )
      ? "PC040111"
      : "PC040000"
    const shippingAddress = customerQuery?.detail?.shippingAddress as Location
    const [firstName, ...lastName] = (shippingAddress?.name || "").split(" ")

    if (
      !physicalProduct?.price?.buyUsedEnabled ||
      !physicalProduct?.price?.buyUsedPrice
    ) {
      throw new Error(
        "ProductVariant is not enabled for buyUsed, or is missing a price."
      )
    }

    // Shipping is included only if user does not already have the product.
    const bagItems = ((customerQuery as any)?.bagItems || []) as [
      BagItem & {
        productVariant: { id: string }
      }
    ]
    const needShipping = !bagItems.some(
      ({ status, productVariant: { id: productVariantId } }) =>
        status === "Reserved" && productVariantId === productVariant.id
    )
    const shipping = await (needShipping
      ? this.shipping.getBuyUsedShippingRate(productVariantId, user, customer)
      : Promise.resolve(null))

    const orderItems = [
      {
        recordID: physicalProduct.id,
        recordType: "PhysicalProduct",
        needShipping,
        price: physicalProduct?.price?.buyUsedPrice * 100,
        currencyCode: "USD",
      },
      needShipping
        ? {
            recordID:
              shipping?.shipment.substring(0, 24) || "137" + Math.random() * 10,
            recordType: "Package",
            price: parseFloat(shipping?.amount || "0.01") * 100,
            currencyCode: "USD",
            needShipping: false,
          }
        : null,
    ].filter(Boolean) as OrderItem[]

    return {
      shippingAddress,
      orderItems,
      invoice: {
        customer_id: user.id,
        invoice_note: `Purchase Used ${productName}`,
        shipping_address: {
          first_name: firstName,
          last_name: lastName.join(" "),
          email: user.email,
          company: shippingAddress?.company,
          line1: shippingAddress?.address1,
          line2: shippingAddress?.address2,
          city: shippingAddress?.city,
          state_code: shippingAddress?.state,
          zip: shippingAddress?.zipCode,
          country: shippingAddress?.country || "US",
        },
        charges: orderItems?.map(orderItem => ({
          amount: orderItem?.price,
          taxable: true,
          ...(orderItem?.recordType === "PhysicalProduct"
            ? {
                description: productName,
                avalara_tax_code: productTaxCode,
              }
            : orderItem?.recordType === "Package"
            ? {
                description:
                  shipping?.rate?.servicelevel?.name || "The shipping rate",
                avalara_tax_code: "FR020000",
              }
            : {
                /** TODO: handle other item types **/
              }),
        })) as InvoiceCharge[],
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

  async buyNewSubmitOrder({
    order,
    customer,
  }: {
    order: Order
    customer: Customer
  }): Promise<void> {
    const orderItems = await this.prisma.client.order({ id: order.id }).items()
    const productVariantId = orderItems.find(
      orderItem => orderItem.recordType === "ProductVariant"
    ).recordID

    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      shopifyProductVariantInternalId,
      accessToken,
      shopName,
    } = await this.getBuyNewMetadata({
      productVariantId,
      customerId: customer.id,
    })

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
    // TODO: Update internal order model, return

    return null
  }

  async buyNewCreateDraftedOrder({
    productVariantId,
    customer,
  }: {
    productVariantId: string
    customer: Customer
  }): Promise<DraftOrder> {
    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      productName,
      accessToken,
      shopName,
    } = await this.getBuyNewMetadata({
      productVariantId,
      customerId: customer.id,
    })
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

    // TODO: create and return internal order model
    return null
  }

  async buyUsedCreateDraftedOrder({
    productVariantId,
    customer,
    user,
  }: {
    productVariantId: string
    customer: Customer
    user: User
  }): Promise<Order> {
    const { invoice, orderItems } = await this.getBuyUsedMetadata({
      productVariantId,
      customer,
      user,
    })
    try {
      const {
        estimate: { invoice_estimate },
      } = await chargebee.estimate
        .create_invoice({
          invoice: pick(invoice, ["customer_id"]),
          ...pick(invoice, ["charges", "shipping_address"]),
        })
        .request()

      return await this.prisma.binding.mutation.createOrder({
        data: {
          customer: { connect: { id: customer.id } },
          orderNumber: Math.floor(Math.random() * 900000000) + 100000000,
          type: "Used",
          status: "Drafted",
          subTotal: invoice_estimate.subtotal,
          total: invoice_estimate.total,
          items: {
            create: orderItems.map((orderItem, idx) => ({
              ...orderItem,
              taxRate: invoice_estimate.line_items[idx].tax_rate,
              taxPrice: invoice_estimate.line_items[idx].tax_amount,
            })),
          },
        },
      })
    } catch (err) {
      console.error(err)
    }
  }

  async buyUsedSubmitOrder({
    order,
    customer,
    user,
  }: {
    order: Order
    customer: Customer
    user: User
  }) {
    const orderItems = await this.prisma.client.order({ id: order.id }).items()
    const physicalProductId = orderItems.find(
      orderItem => orderItem.recordType === "PhysicalProduct"
    ).recordID
    const productVariantId = (
      await this.prisma.client
        .physicalProduct({ id: physicalProductId })
        .productVariant()
    ).id

    const { invoice, shippingAddress } = await this.getBuyUsedMetadata({
      productVariantId,
      customer,
      user,
    })

    const { invoice: chargebeeInvoice } = await chargebee.invoice
      .create(invoice)
      .request()

    const getOrderShippingUpdate = async () => {
      const physicalProductsNeedShipping = orderItems.filter(
        orderItem =>
          orderItem.recordType === "PhysicalProduct" && orderItem.needShipping
      )

      if (physicalProductsNeedShipping.length === 0) {
        return {}
      }

      const [shippoTransaction, shipmentWeight] = await Promise.all([
        this.shipping.createBuyUsedShippingLabel(
          productVariantId,
          user,
          customer
        ),
        this.shipping.calcShipmentWeightFromProductVariantIDs([
          productVariantId,
        ]),
      ])

      return {
        sentPackage: {
          create: {
            transactionID: shippoTransaction.object_id,
            weight: shipmentWeight,
            items: {
              connect: orderItems
                .filter(orderItem => orderItem.recordType === "PhysicalProduct")
                .map(orderItem => ({ id: orderItem.recordID })),
            },
            shippingLabel: {
              create: {
                image: shippoTransaction.label_url,
                trackingNumber: shippoTransaction.tracking_number,
                trackingURL: shippoTransaction.tracking_url_provider,
                name: "UPS",
              },
            },
            fromAddress: {
              connect: {
                slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
              },
            },
            toAddress: {
              connect: { id: shippingAddress.id },
            },
          },
        },
      }
    }

    const orderShippingUpdate = await getOrderShippingUpdate()

    const updatedOrder = this.prisma.client.updateOrder({
      where: { id: order.id },
      data: {
        status: "Submitted",
        paymentStatus: chargebeeInvoice.status === "paid" ? "Paid" : "NotPaid",
        ...orderShippingUpdate,
      },
    })

    // TODO: send confirmation email

    return updatedOrder
  }
}
