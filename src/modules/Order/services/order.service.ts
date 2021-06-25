import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import {
  ProductUtilsService,
  ProductVariantService,
} from "@app/modules/Product"
import { BagService } from "@app/modules/Product/services/bag.service"
import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import {
  BagItem,
  OrderStatus,
  PhysicalProduct,
  PhysicalProductPrice,
} from "@app/prisma"
import { OrderLineItemRecordType } from "@app/prisma"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  BillingInfo,
  Category,
  Customer,
  Location,
  Order,
  OrderLineItem,
  Prisma,
  ProductVariant,
  User,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
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

@Injectable()
export class OrderService {
  readonly outerwearCategories: Promise<Pick<Category, "id">[]>

  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService,
    private readonly shipping: ShippingService,
    private readonly email: EmailService,
    private readonly error: ErrorService,
    private readonly bag: BagService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariant: ProductVariantService
  ) {
    this.outerwearCategories = this.productUtils.getCategoryAndAllChildren(
      { slug: "outerwear" },
      { id: true }
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
    const _productVariant = await this.prisma.client2.productVariant.findUnique(
      {
        where: { id: productVariantID },
        select: {
          id: true,
          physicalProducts: {
            select: {
              id: true,
              price: { select: { buyUsedEnabled: true, buyUsedPrice: true } },
              inventoryStatus: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { id: true } },
            },
          },
        },
      }
    )
    const productVariant = this.prisma.sanitizePayload(
      _productVariant,
      "ProductVariant"
    )
    const _customerQuery = await this.prisma.client2.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        user: { select: { id: true, firstName: true, lastName: true } },
        detail: {
          select: {
            id: true,
            shippingAddress: {
              select: {
                id: true,
                name: true,
                company: true,
                address1: true,
                address2: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
              },
            },
          },
        },
        bagItems: {
          select: {
            id: true,
            status: true,
            productVariant: { select: { id: true } },
          },
        },
      },
    })
    const customerQuery = this.prisma.sanitizePayload(
      _customerQuery,
      "Customer"
    )

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

    const productName = (productVariant?.product as any)?.name

    // Refactor into a getProductTaxCode function
    const productTaxCode = await this.getProductTaxCode(
      (productVariant?.product as any)?.category?.id
    )

    const shippingAddress = customerQuery?.detail?.shippingAddress as Location

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
        shipping_address: this.getChargebeeShippingAddress({
          location: shippingAddress,
          user,
        }),
        charges: orderLineItems
          ?.map(orderLineItem =>
            this.getChargebeeChargeForOrderLineItem({
              orderLineItem,
              productName,
              productTaxCode,
              shippingDescription:
                shipping?.rate?.servicelevel?.name || "Shipping",
            })
          )
          .filter(Boolean),
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
    productTaxCode: string
    shopifyProductVariantInternalId: string
    shopifyProductVariantExternalId: string
    accessToken: string
    shopName: string
  }> {
    const _productVariant = await this.prisma.client2.productVariant.findUnique(
      {
        where: { id: productVariantID },
        select: {
          product: {
            select: {
              buyNewEnabled: true,
              name: true,
              brand: {
                select: {
                  shopifyShop: {
                    select: {
                      enabled: true,
                      shopName: true,
                      accessToken: true,
                    },
                  },
                },
              },
              category: { select: { id: true } },
            },
          },
          shopifyProductVariant: { select: { id: true, externalId: true } },
        },
      }
    )
    const productVariant = this.prisma.sanitizePayload(
      _productVariant,
      "ProductVariant"
    )
    const _customer = await this.prisma.client2.customer.findUnique({
      where: { id: customerId },
      select: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        detail: {
          select: {
            shippingAddress: {
              select: {
                name: true,
                company: true,
                address1: true,
                address2: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
              },
            },
          },
        },
        billingInfo: {
          select: {
            name: true,
            street1: true,
            street2: true,
            city: true,
            state: true,
            postal_code: true,
            country: true,
          },
        },
      },
    })
    const customer = this.prisma.sanitizePayload(_customer, "Customer")

    const product = productVariant?.product as any
    const { buyNewEnabled, name: productName } = product
    const { enabled, shopName, accessToken } = product?.brand?.shopifyShop || {}
    const {
      id: shopifyProductVariantInternalId,
      externalId: shopifyProductVariantExternalId,
    } = productVariant?.shopifyProductVariant || {}

    const shippingAddress = customer?.detail?.shippingAddress
    const billingAddress = customer?.billingInfo
    const { email: emailAddress, id: userId } = customer?.user

    const productTaxCode = await this.getProductTaxCode(product?.category?.id)

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
      productTaxCode,
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
    user,
    select,
  }: {
    order: Order
    customer: Customer
    user: User
    select: Prisma.OrderSelect
  }): Promise<Order | void> {
    const orderWithLineItems = await this.prisma.client2.order.findUnique({
      where: { id: order.id },
      select: {
        lineItems: {
          select: { recordID: true, recordType: true, price: true },
        },
      },
    })
    const productVariantID = orderWithLineItems.lineItems.find(
      orderLineItem => orderLineItem.recordType === "ExternalProduct"
    ).recordID

    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      shopifyProductVariantInternalId,
      userId,
      accessToken,
      shopName,
      productName,
      productTaxCode,
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

    let chargebeeInvoice
    try {
      chargebeeInvoice = (
        await chargebee.invoice
          .create({
            customer_id: userId,
            shippingAddress: this.getChargebeeShippingAddress({
              user,
              location: shippingAddress,
            }),
            charges: orderWithLineItems.lineItems
              .map(orderLineItem =>
                this.getChargebeeChargeForOrderLineItem({
                  orderLineItem,
                  productName,
                  productTaxCode,
                  shippingDescription: draftOrder.shippingLine.title,
                })
              )
              .filter(Boolean),
          })
          .request()
      ).invoice
    } catch (error) {
      chargebeeInvoice = { status: "not_paid" }
    }

    if (chargebeeInvoice.status !== "paid") {
      if (chargebeeInvoice.id) {
        try {
          // Disable dunning in favor of letting the user manually retry failed charges via the UI,
          // as otherwise we run a risk of duplicate charges.
          await chargebee.invoice.stop_dunning(chargebeeInvoice.id).request()
        } catch (error) {
          this.error.setExtraContext({ chargebeeInvoice }, "chargebeeInvoice")
          this.error.captureError(error)
        }
      }
      try {
        // Cleanup the draft order we created in brand partner's Shopify.
        await this.shopify.deleteDraftOrder({
          orderId: draftOrder.id,
          shopName,
          accessToken,
        })
      } catch (error) {
        this.error.setExtraContext({ draftOrder }, "draftOrder")
        this.error.captureError(error)
      }

      throw new Error("Failed to collect payment for invoice.")
    }

    try {
      const [updatedOrder, _completedShopifyOrder] = await Promise.all([
        this.prisma.client2.order.update({
          where: { id: order.id },
          data: {
            status: "Submitted",
            paymentStatus:
              chargebeeInvoice.status === "paid" ? "Paid" : "NotPaid",
          },
        }),
        this.shopify.completeDraftOrder({
          orderId: draftOrder.id,
          shopName,
          accessToken,
        }),
      ])

      // TODO: send buy new confirmation email? We currently dont send one from our system,
      // we let shopify handle it

      return (await this.prisma.client2.order.findUnique({
        where: { id: updatedOrder.id },
        select,
      })) as Order
    } catch (error) {
      console.log(
        "Warning: Payment collected but failed to update internal or external order model. Manual intervention required.",
        order.id,
        draftOrder.id
      )
      throw error
    }
  }

  async buyNewCreateDraftedOrder({
    productVariantID,
    customer,
    user,
    select,
  }: {
    productVariantID: string
    customer: Customer
    user: User
    select: Prisma.OrderSelect
  }): Promise<Order> {
    const {
      shippingAddress,
      billingAddress,
      emailAddress,
      shopifyProductVariantExternalId,
      userId,
      productName,
      productTaxCode,
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

    const { draftOrder, shippingRate } = await this.shopify.calculateDraftOrder(
      {
        shopifyCustomerId,
        shopifyProductVariantId: shopifyProductVariantExternalId,
        emailAddress,
        billingAddress,
        accessToken,
        shopName,
      }
    )

    const orderLineItems = [
      {
        recordID: productVariantID,
        recordType: "ExternalProduct" as OrderLineItemRecordType,
        // Note: assumes that orders are single item, as otherwise subtotal is not the item price.
        price: draftOrder.subtotalPrice,
        currencyCode: "USD",
        needShipping: true,
      },
      {
        recordID: "137" + Math.random().toString(36).slice(2),
        recordType: "Package" as OrderLineItemRecordType,
        price: shippingRate.price,
        currencyCode: "USD",
        needShipping: false,
      },
    ]
    const chargebeeInvoice = {
      invoice: {
        customer_id: userId,
      },
      shipping_address: this.getChargebeeShippingAddress({
        user,
        location: shippingAddress,
      }),
      charges: orderLineItems
        .map(orderLineItem =>
          this.getChargebeeChargeForOrderLineItem({
            orderLineItem,
            productName,
            productTaxCode,
            shippingDescription: shippingRate.title || "Shipping",
          })
        )
        .filter(Boolean),
    }

    const {
      estimate: { invoice_estimate },
    } = await chargebee.estimate.create_invoice(chargebeeInvoice).request()

    return (await this.prisma.client2.order.create({
      data: {
        customer: { connect: { id: customer.id } },
        orderNumber: `O-${Math.floor(Math.random() * 900000000) + 100000000}`,
        externalID: draftOrder.id,
        type: "New",
        status: "Drafted",
        subTotal: invoice_estimate.sub_total,
        total: invoice_estimate.total,
        lineItems: {
          create: orderLineItems.map((orderLineItem, idx) => ({
            ...orderLineItem,
            taxRate: invoice_estimate.line_items?.[idx]?.tax_rate || 0,
            taxPrice: invoice_estimate.line_items?.[idx]?.tax_amount || 0,
          })),
        },
        paymentStatus: "complete",
      },
      select,
    })) as Order
  }

  async buyUsedCreateDraftedOrder({
    productVariantID,
    customer,
    user,
    select,
  }: {
    productVariantID: string
    customer: Customer
    user: User
    select: Prisma.OrderSelect
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

    return (await this.prisma.client2.order.create({
      data: {
        customer: { connect: { id: customer.id } },
        orderNumber: `O-${Math.floor(Math.random() * 900000000) + 100000000}`,
        type: "Used",
        status: "Drafted",
        subTotal: invoice_estimate.sub_total,
        total: invoice_estimate.total,
        lineItems: {
          create: orderLineItems.map((orderLineItem, idx) => ({
            ...orderLineItem,
            taxRate: invoice_estimate?.line_items?.[idx]?.tax_rate || 0,
            taxPrice: invoice_estimate?.line_items?.[idx]?.tax_amount || 0,
          })),
        },
        paymentStatus: "complete",
      },
      select,
    })) as Order
  }

  async buyUsedSubmitOrder({
    order,
    customer,
    user,
    select,
  }: {
    order: Order
    customer: Customer
    user: User
    select: Prisma.OrderSelect
  }): Promise<Order> {
    const orderWithData = await this.prisma.client2.order.findUnique({
      where: { id: order.id },
      select: {
        orderNumber: true,
        lineItems: {
          select: { recordType: true, recordID: true, needShipping: true },
        },
      },
    })
    const physicalProductId = orderWithData.lineItems.find(
      orderLineItem => orderLineItem.recordType === "PhysicalProduct"
    ).recordID
    const _physicalProductWithVariant = await this.prisma.client2.physicalProduct.findUnique(
      {
        where: { id: physicalProductId },
        select: {
          id: true,
          productVariant: {
            select: {
              id: true,
              reservable: true,
              offloaded: true,
              reserved: true,
            },
          },
        },
      }
    )
    const physicalProductWithVariant = this.prisma.sanitizePayload(
      _physicalProductWithVariant,
      "PhysicalProduct"
    )
    const productVariant = (physicalProductWithVariant.productVariant as unknown) as Pick<
      ProductVariant,
      "id" | "reservable" | "offloaded" | "reserved"
    >

    const { invoice, shippingAddress } = await this.getBuyUsedMetadata({
      productVariantID: productVariant.id,
      customer,
      user,
    })

    const { invoice: chargebeeInvoice } = await chargebee.invoice
      .create({ ...invoice, auto_collection: "on" })
      .request()

    if (chargebeeInvoice.status !== "paid") {
      try {
        // Disable dunning in favor of letting the user manually retry failed charges via the UI,
        // as otherwise we run a risk of duplicate charges.
        await chargebee.invoice.stop_dunning(chargebeeInvoice.id).request()
      } catch (error) {
        console.log(
          "Warning: Unable to cancel dunning for failed invoice charge.",
          chargebeeInvoice.id,
          chargebeeInvoice.customer_id
        )
        throw error
      }
      throw new Error("Failed to collect payment for invoice.")
    }

    const orderLineItemsWithShipping = orderWithData.lineItems.filter(
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
              connect: orderWithData.lineItems
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
      updateProductVariantData = this.productVariant.updateCountsForStatusChange(
        {
          productVariant,
          oldInventoryStatus: "Reservable",
          newInventoryStatus: "Offloaded",
        }
      )
    } else {
      // Item is with the customer
      updateProductVariantData = this.productVariant.updateCountsForStatusChange(
        {
          productVariant,
          oldInventoryStatus: "Reserved",
          newInventoryStatus: "Offloaded",
        }
      )
    }

    const [updatedOrder] = await this.prisma.client2.$transaction([
      this.prisma.client2.order.update({
        where: { id: order.id },
        data: {
          status: orderNeedsShipping ? "Submitted" : "Fulfilled",
          paymentStatus:
            chargebeeInvoice.status === "paid" ? "Paid" : "NotPaid",
          ...orderShippingUpdate,
        },
      }),
      this.prisma.client2.physicalProduct.update({
        where: { id: physicalProductId },
        data: {
          inventoryStatus: "Offloaded",
          offloadMethod: "SoldToUser",
          offloadNotes: `Order Number: ${orderWithData.orderNumber}`,
        },
      }),
      this.prisma.client2.productVariant.update({
        where: { id: productVariant.id },
        data: updateProductVariantData,
      }),
    ])

    await this.email.sendBuyUsedOrderConfirmationEmail(user, updatedOrder)

    return (await this.prisma.client2.order.findUnique({
      where: { id: updatedOrder.id },
      select,
    })) as Order
  }

  async updateOrderStatus({
    orderID,
    status,
    customer,
    select,
  }: {
    orderID: string
    status: OrderStatus
    customer: Customer
    select: Prisma.OrderSelect
  }): Promise<Order> {
    const promises = []

    promises.push(
      this.prisma.client2.order.update({
        where: { id: orderID },
        data: { status },
        select,
      })
    )

    const order = await this.prisma.client2.order.findUnique({
      where: { id: orderID },
      select: {
        type: true,
        lineItems: { select: { recordID: true, recordType: true } },
      },
    })
    if (status === "Fulfilled" && order.type === "Used") {
      // Remove item from bag
      const lineItems = order.lineItems
      const physicalProduct = lineItems.find(
        item => item.recordType === "PhysicalProduct"
      )
      if (!physicalProduct) {
        this.error.setExtraContext({ orderID }, "orderID")
        this.error.captureError(
          new Error("Unable to remove fulfilled order item from customer bag.")
        )
        return null
      }
      const prodVar = await this.prisma.client2.productVariant.findFirst({
        where: { physicalProducts: { some: { id: physicalProduct.recordID } } },
      })
      promises.push(this.bag.removeFromBag(prodVar.id, false, customer))

      // Remove warehouse location from item
      promises.push(
        this.prisma.client2.physicalProduct.update({
          where: { id: physicalProduct.recordID },
          data: { warehouseLocation: { disconnect: true } },
        })
      )
    }
    const [updateOrderResult] = await this.prisma.client2.$transaction(promises)

    return updateOrderResult
  }

  getChargebeeShippingAddress({
    location,
    user,
  }: {
    location: Location
    user: User
  }) {
    const [firstName, ...lastName] = (location?.name || "").split(" ")
    return {
      first_name: firstName,
      last_name: lastName.join(" "),
      email: user.email,
      company: location?.company,
      line1: location?.address1,
      line2: location?.address2,
      city: location?.city,
      state_code: location?.state,
      zip: location?.zipCode,
      country: location?.country || "US",
    }
  }

  getChargebeeChargeForOrderLineItem({
    orderLineItem,
    productName,
    productTaxCode,
    shippingDescription,
  }: {
    orderLineItem: Pick<OrderLineItem, "recordType" | "price">
    productName: string
    productTaxCode: string
    shippingDescription: string
  }): InvoiceCharge | null {
    if (
      orderLineItem.recordType === "ExternalProduct" ||
      orderLineItem.recordType === "PhysicalProduct"
    ) {
      return {
        amount: orderLineItem.price,
        taxable: true,
        description: productName,
        avalara_tax_code: productTaxCode,
      }
    }

    if (orderLineItem.recordType === "Package" && orderLineItem.price > 0) {
      return {
        amount: orderLineItem.price,
        taxable: true,
        description: shippingDescription,
        avalara_tax_code: "FR020000",
      }
    }
  }

  private async getProductTaxCode(productCategoryId) {
    const outerwearCategoryIds = (await this.outerwearCategories).map(a => a.id)
    return outerwearCategoryIds.some(
      outerwearCategoryId => outerwearCategoryId === productCategoryId
    )
      ? "PC040111"
      : "PC040000"
  }
}
