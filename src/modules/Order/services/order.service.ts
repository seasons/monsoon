import { EmailService } from "@app/modules/Email/services/email.service"
import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import {
  BagItem,
  BillingInfo,
  Category,
  Customer,
  Location,
  Order,
  OrderLineItem,
  PhysicalProduct,
  PhysicalProductPrice,
  User,
} from "@app/prisma"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import { GraphQLResolveInfo } from "graphql"
import { flatten, pick } from "lodash"

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

@Injectable()
export class OrderService {
  readonly outerwearCategoryIds: Promise<Array<string>>

  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService,
    private readonly shipping: ShippingService,
    private readonly productUtils: ProductUtilsService,
    private readonly email: EmailService
  ) {
    const getCategoryAndAllChildren = (categoryId: string): Promise<string[]> =>
      this.prisma.client
        .category({ id: categoryId })
        .children()
        .then(children =>
          Promise.all(
            children && children.length
              ? children.map((category: Category) =>
                  getCategoryAndAllChildren(category.id)
                )
              : []
          )
        )
        .then(children => {
          const result = flatten(children)
          result.push(categoryId)
          return result
        })

    this.outerwearCategoryIds = this.prisma.client
      .category({ slug: "outerwear" })
      .id()
      .then(outerwearCategoryId =>
        getCategoryAndAllChildren(outerwearCategoryId)
      )
  }

  async getBuyUsedMetadata({
    productVariantID,
    customer,
    user,
  }: {
    productVariantID: string
    customer: Customer
    user: User
  }): Promise<{
    invoice: InvoiceInput
    shippingAddress: Location
    orderLineItems: OrderLineItem[]
  }> {
    const [productVariant, customerQuery] = await Promise.all([
      this.prisma.binding.query.productVariant(
        {
          where: {
            id: productVariantID,
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
              inventoryStatus
            }
            product {
              id
              name
              category {
                id
              }
            }
          }`
      ),
      this.prisma.binding.query.customer(
        {
          where: {
            id: customer.id,
          },
        },
        `{
          id
          user {
            id
            firstName
            lastName
          }
          detail {
            id
            shippingAddress {
              id
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
            id
            status
            productVariant {
              id
            }
          }
        }`
      ),
    ])

    // FIXME: We're assuming that every physical product has the same price for a variant,
    // so take the first valid result.
    const bagItems = ((customerQuery as any)?.bagItems || []) as [
      BagItem & {
        productVariant: { id: string }
      }
    ]
    const isProductVariantReserved = bagItems.some(
      ({ status, productVariant: { id: productVariantId } }) =>
        status === "Reserved" && productVariantId === productVariant.id
    )
    // Shipping is included only if user does not already have the product.
    const shipping = await (isProductVariantReserved
      ? Promise.resolve(null)
      : this.shipping.getBuyUsedShippingRate(productVariant.id, user, customer))

    const physicalProduct = productVariant?.physicalProducts.find(
      physicalProduct =>
        physicalProduct.price &&
        physicalProduct.price.buyUsedEnabled &&
        ((physicalProduct.inventoryStatus === "Reserved" &&
          isProductVariantReserved) ||
          physicalProduct.inventoryStatus === "Reservable" ||
          physicalProduct.inventoryStatus === "Stored")
    ) as (PhysicalProduct & { price: PhysicalProductPrice }) | null

    const productName = productVariant?.product?.name

    const productTaxCode = (await this.outerwearCategoryIds).some(
      outerwearCategoryId =>
        outerwearCategoryId === productVariant?.product?.category?.id
    )
      ? "PC040111"
      : "PC040000"

    const shippingAddress = customerQuery?.detail?.shippingAddress as Location
    const [firstName, ...lastName] = (shippingAddress?.name || "").split(" ")

    if (
      !physicalProduct ||
      !physicalProduct?.price?.buyUsedEnabled ||
      !physicalProduct?.price?.buyUsedPrice
    ) {
      throw new Error(
        "ProductVariant is not enabled for Buy Used, is missing a price, or is unavailable for purchase."
      )
    }

    const orderLineItems = [
      {
        recordID: physicalProduct.id,
        recordType: "PhysicalProduct",
        needShipping: !isProductVariantReserved,
        price: physicalProduct?.price?.buyUsedPrice,
        currencyCode: "USD",
      },
      !isProductVariantReserved
        ? {
            recordID:
              shipping?.shipment.substring(0, 24) || "137" + Math.random() * 10,
            recordType: "Package",
            price: parseFloat(shipping?.amount || "0.00") * 100,
            currencyCode: "USD",
            needShipping: false,
          }
        : null,
    ].filter(Boolean) as OrderLineItem[]

    return {
      shippingAddress,
      orderLineItems,
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
        charges: orderLineItems?.map(orderLineItem => ({
          amount: orderLineItem?.price,
          taxable: true,
          ...(orderLineItem?.recordType === "PhysicalProduct"
            ? {
                description: productName,
                avalara_tax_code: productTaxCode,
              }
            : orderLineItem?.recordType === "Package"
            ? {
                description: shipping?.rate?.servicelevel?.name || "Shipping",
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
    productVariantID,
    customerId,
  }: {
    productVariantID: string
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
            id: productVariantID,
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
    const orderLineItems = await this.prisma.client
      .order({ id: order.id })
      .lineItems()
    const productVariantID = orderLineItems.find(
      orderLineItem => orderLineItem.recordType === "ProductVariant"
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
      productVariantID,
      customerId: customer.id,
    })

    // Bypass internal cache and directly ensure product is still available at the merchant.
    const shopifyProductVariant = await this.shopify.cacheProductVariantBuyMetadata(
      {
        shopifyProductVariantExternalId,
        shopifyProductVariantInternalId,
        shopName,
        accessToken,
      }
    )

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
    productVariantID,
    customer,
  }: {
    productVariantID: string
    customer: Customer
  }): Promise<Order> {
    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      productName,
      accessToken,
      shopName,
    } = await this.getBuyNewMetadata({
      productVariantID,
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
    productVariantID,
    customer,
    user,
    info,
  }: {
    productVariantID: string
    customer: Customer
    user: User
    info: GraphQLResolveInfo
  }): Promise<Order> {
    const { invoice, orderLineItems } = await this.getBuyUsedMetadata({
      productVariantID,
      customer,
      user,
    })

    const {
      estimate: { invoice_estimate },
    } = await chargebee.estimate
      .create_invoice({
        invoice: pick(invoice, ["customer_id"]),
        ...pick(invoice, ["charges", "shipping_address"]),
      })
      .request()

    return await this.prisma.binding.mutation.createOrder(
      {
        data: {
          customer: { connect: { id: customer.id } },
          orderNumber: `O-${Math.floor(Math.random() * 900000000) + 100000000}`,
          type: "Used",
          status: "Drafted",
          subTotal: invoice_estimate.subtotal,
          total: invoice_estimate.total,
          lineItems: {
            create: orderLineItems.map((orderLineItem, idx) => ({
              ...orderLineItem,
              taxRate: invoice_estimate.line_items[idx].tax_rate,
              taxPrice: invoice_estimate.line_items[idx].tax_amount,
            })),
          },
        },
      },
      info
    )
  }

  async buyUsedSubmitOrder({
    order,
    customer,
    user,
    info,
  }: {
    order: Order
    customer: Customer
    user: User
    info: GraphQLResolveInfo
  }): Promise<Order> {
    const orderLineItems = await this.prisma.client
      .order({ id: order.id })
      .lineItems()
    const physicalProductId = orderLineItems.find(
      orderLineItem => orderLineItem.recordType === "PhysicalProduct"
    ).recordID
    const productVariant = await this.prisma.client
      .physicalProduct({ id: physicalProductId })
      .productVariant()

    const { invoice, shippingAddress } = await this.getBuyUsedMetadata({
      productVariantID: productVariant.id,
      customer,
      user,
    })

    const { invoice: chargebeeInvoice } = await chargebee.invoice
      .create({ ...invoice, auto_collection: "on" })
      .request()

    if (chargebeeInvoice.status !== "paid") {
      throw new Error("Failed to collect payment for invoice.")
    }

    const orderLineItemsWithShipping = orderLineItems.filter(
      orderLineItem =>
        orderLineItem.recordType === "PhysicalProduct" &&
        orderLineItem.needShipping
    )

    const orderNeedsShipping = orderLineItemsWithShipping.length > 0

    const getOrderShippingUpdate = async () => {
      if (!orderNeedsShipping) {
        return {}
      }

      const [shippoTransaction, shipmentWeight] = await Promise.all([
        this.shipping.createBuyUsedShippingLabel(
          productVariant.id,
          user,
          customer
        ),
        this.shipping.calcShipmentWeightFromProductVariantIDs([
          productVariant.id,
        ]),
      ])

      return {
        sentPackage: {
          create: {
            transactionID: shippoTransaction.object_id,
            weight: shipmentWeight,
            items: {
              connect: orderLineItems
                .filter(
                  orderLineItem =>
                    orderLineItem.recordType === "PhysicalProduct"
                )
                .map(orderLineItem => ({ id: orderLineItem.recordID })),
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

    let updateProductVariantData
    if (orderNeedsShipping) {
      // Item is at the warehouse
      updateProductVariantData = {
        reservable: productVariant.reservable - 1,
        offloaded: productVariant.offloaded + 1,
      }
    } else {
      // Item is with the customer
      updateProductVariantData = {
        reserved: productVariant.reserved - 1,
        offloaded: productVariant.offloaded + 1,
      }
    }

    const [
      updatedOrder,
      _updatedPhysicalProduct,
      _updatedProductVariant,
    ] = await Promise.all([
      this.prisma.client.updateOrder({
        where: { id: order.id },
        data: {
          status: "Submitted",
          paymentStatus:
            chargebeeInvoice.status === "paid" ? "Paid" : "NotPaid",
          ...orderShippingUpdate,
        },
      }),
      this.prisma.client.updatePhysicalProduct({
        where: { id: physicalProductId },
        data: {
          inventoryStatus: "Offloaded",
          offloadMethod: "SoldToUser",
          offloadNotes: `Order ID: ${order.id}`,
        },
      }),
      this.prisma.client.updateProductVariant({
        where: { id: productVariant.id },
        data: updateProductVariantData,
      }),
    ])

    await this.email.sendBuyUsedOrderConfirmationEmail(user, updatedOrder)

    return await this.prisma.binding.query.order(
      {
        where: { id: updatedOrder.id },
      },
      info
    )
  }
}
