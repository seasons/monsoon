import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { BagService } from "@app/modules/Product/services/bag.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { OrderLineItemCreateInput } from "@app/prisma/prisma.binding"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  BagItem,
  CustomerMembership,
  OrderPaymentStatus,
  OrderStatus,
  OrderType,
  PhysicalProduct,
  PhysicalProductPrice,
  Product,
} from "@prisma/client"
import {
  BillingInfo,
  Category,
  Customer,
  Location,
  Order,
  OrderLineItem,
  OrderLineItemRecordType,
  Prisma,
  ProductVariant,
  User,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import chargebee from "chargebee"
import cuid from "cuid"
import { merge, pick } from "lodash"

type InvoiceCharge = {
  amount: number
  description: string
  taxable: boolean
  avalara_tax_code?: string
}

type BuyUsedOrderItem = {
  physicalProduct: Pick<PhysicalProduct, "id"> & {
    price: Pick<PhysicalProductPrice, "buyUsedEnabled" | "buyUsedPrice">
    productVariant: { product: Pick<Product, "discountedPrice"> }
  }
  shippingRequired: boolean
  name: string
  productTaxCode: string
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
    private readonly productVariant: ProductVariantService,
    private readonly utils: UtilsService
  ) {
    this.outerwearCategories = this.productUtils.getCategoryAndAllChildren(
      { slug: "outerwear" },
      { id: true }
    )
  }

  async getBuyUsedMetadata({
    productVariantIds,
    customer,
    type,
  }: {
    productVariantIds: string[]
    customer: Pick<Customer, "id">
    type: "draft" | "order"
  }): Promise<{
    purchaseCreditsApplied: number
    creditsApplied: number
    invoice: InvoiceInput
    shippingAddress: Location
    orderLineItems: OrderLineItem[]
  }> {
    const productVariants = await this.prisma.client.productVariant.findMany({
      where: {
        id: {
          in: productVariantIds,
        },
      },
      select: {
        id: true,
        physicalProducts: {
          select: {
            id: true,
            price: { select: { buyUsedEnabled: true, buyUsedPrice: true } },
            inventoryStatus: true,
            productVariant: {
              select: { product: { select: { discountedPrice: true } } },
            },
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
    })

    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        membership: {
          select: {
            id: true,
            purchaseCredits: true,
            creditBalance: true,
          },
        },
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
            productVariant: {
              select: {
                id: true,
              },
            },
            physicalProduct: {
              select: {
                id: true,
                price: { select: { buyUsedEnabled: true, buyUsedPrice: true } },
                productVariant: {
                  select: { product: { select: { discountedPrice: true } } },
                },
              },
            },
          },
        },
      },
    })

    const orderItems: BuyUsedOrderItem[] = await this.getPhysicalProductForOrder(
      productVariants,
      customerWithData
    )

    const physicalProductsToShip =
      orderItems.filter(x => x.shippingRequired).map(x => x.physicalProduct) ??
      []

    // Shipping is included on products the customer has reserved
    const packages = await (physicalProductsToShip.length > 0
      ? this.shipping.getBuyUsedShippingRate(
          physicalProductsToShip.map(pv => pv.id),
          customer
        )
      : Promise.resolve(null))

    const shipping = packages?.sentRate

    const shippingAddress = customerWithData?.detail
      ?.shippingAddress as Location

    const purchaseCreditsAvailable =
      customerWithData.membership?.purchaseCredits ?? 0

    const creditsAvailable = customerWithData.membership?.creditBalance ?? 0

    const totalCreditsAvailable = creditsAvailable + purchaseCreditsAvailable

    let creditsAvailableAccumulator = totalCreditsAvailable
    let totalCreditsUsed = 0

    const getChargePrice = lineItemPrice => {
      // During draft mode we remove the credit totals from the charges to show the total price, since we're not applying
      // actual chargebee promotional credits.
      // In order mode we charge the full price but add chargebee promotional credits to credit the account, which will result
      // in the same total price in both draft and order types.
      let draftPrice = lineItemPrice
      const creditsStillAvailable = creditsAvailableAccumulator > 0

      if (creditsStillAvailable) {
        if (lineItemPrice > creditsAvailableAccumulator) {
          draftPrice = draftPrice - creditsAvailableAccumulator
          totalCreditsUsed = totalCreditsUsed + creditsAvailableAccumulator
          creditsAvailableAccumulator = 0
        } else {
          creditsAvailableAccumulator =
            creditsAvailableAccumulator - lineItemPrice
          totalCreditsUsed = totalCreditsUsed + lineItemPrice
          draftPrice = 0
        }
      }

      return type === "draft" ? draftPrice : lineItemPrice
    }

    const productLineItems: OrderLineItemCreateInput[] = []
    const charges = []
    let shippingRequired = false
    for (const orderItem of orderItems) {
      const physicalProduct = orderItem.physicalProduct
      const itemRequiresShipping = orderItem.shippingRequired

      if (
        !physicalProduct ||
        !physicalProduct?.price?.buyUsedEnabled ||
        !physicalProduct?.price?.buyUsedPrice
      ) {
        throw new Error(
          "ProductVariant is not enabled for Buy Used, is missing a price, or is unavailable for purchase."
        )
      }

      const priceToCharge =
        physicalProduct.productVariant.product.discountedPrice * 100 ||
        physicalProduct.price.buyUsedPrice
      const chargeAmount = getChargePrice(priceToCharge)
      if (chargeAmount > 0) {
        charges.push({
          amount: chargeAmount,
          taxable: true,
          description: orderItem.name,
          avalara_tax_code: orderItem.productTaxCode,
        })
      }

      productLineItems.push({
        recordID: physicalProduct.id,
        recordType: "PhysicalProduct",
        needShipping: itemRequiresShipping,
        price: priceToCharge,
        currencyCode: "USD",
        name: orderItem.name,
      })
      if (itemRequiresShipping) {
        shippingRequired = true
      }
    }

    if (shippingRequired) {
      const shippingCharge = getChargePrice(shipping.amount)

      if (shippingCharge > 0) {
        charges.push({
          amount: shippingCharge,
          taxable: true,
          description: shipping?.rate?.servicelevel?.name || "Shipping",
          avalara_tax_code: "FR020000",
        })
      }

      productLineItems.push({
        recordID: cuid(),
        recordType: "Package",
        price: shippingCharge,
        currencyCode: "USD",
        needShipping: false,
      })
    }

    const orderLineItems = productLineItems.filter(Boolean) as OrderLineItem[]

    const purchaseCreditsApplied =
      purchaseCreditsAvailable > totalCreditsUsed
        ? purchaseCreditsAvailable - totalCreditsUsed
        : purchaseCreditsAvailable

    if (purchaseCreditsApplied > 0) {
      orderLineItems.push({
        name: "Membership discount",
        recordID: customerWithData.membership.id,
        recordType: "PurchaseCredit",
        currencyCode: "USD",
        price: -purchaseCreditsApplied,
      } as OrderLineItem)
    }

    const creditsApplied = totalCreditsUsed - purchaseCreditsApplied

    if (creditsApplied > 0) {
      orderLineItems.push({
        name: "Credits",
        recordID: customerWithData.membership.id,
        recordType: "Credit",
        currencyCode: "USD",
        price: -creditsApplied,
      } as OrderLineItem)
    }

    return {
      shippingAddress,
      orderLineItems,
      purchaseCreditsApplied,
      creditsApplied,
      invoice: {
        customer_id: customerWithData.user.id,
        // We used "Purchase Used" to ID a buy used invoice in chargebee webhooks. Change
        // with caution.
        invoice_note: `Purchase Used ${productVariants
          .map(pv => pv.product.name)
          .join(", ")}`,
        shipping_address: this.getChargebeeShippingAddress({
          location: shippingAddress,
          user: customerWithData.user,
        }),
        charges,
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
    const productVariant = await this.prisma.client.productVariant.findUnique({
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
    })
    const customer = await this.prisma.client.customer.findUnique({
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
    const orderWithLineItems = await this.prisma.client.order.findUnique({
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

    if (!shopifyProductVariant?.cachedAvailableForSale) {
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
            invoice_note: `Purchase New ${productName}`,
            charges: orderWithLineItems.lineItems
              .map(orderLineItem =>
                this.getChargebeeChargeForOrderLineItem({
                  price: orderLineItem.price,
                  recordType: orderLineItem.recordType,
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
        this.prisma.client.order.update({
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

      return (await this.prisma.client.order.findUnique({
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
            price: orderLineItem.price,
            recordType: orderLineItem.recordType,
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

    return (await this.prisma.client.order.create({
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
        paymentStatus: "Complete",
      },
      select,
    })) as Order
  }

  async buyUsedCreateDraftedOrder({
    productVariantIds,
    customer,
    select,
  }: {
    productVariantIds: string[]
    customer: Customer
    select: Prisma.OrderSelect
  }): Promise<Order> {
    const {
      invoice,
      orderLineItems,
      purchaseCreditsApplied,
      creditsApplied,
    } = await this.getBuyUsedMetadata({
      productVariantIds,
      customer,
      type: "draft",
    })

    let invoiceEstimate = {
      sub_total: 0,
      total: 0,
      line_items: [],
    }

    if (invoice.charges.length > 0) {
      const chargebeeResult = await chargebee.estimate
        .create_invoice({
          invoice: pick(invoice, ["customer_id"]),
          ...pick(invoice, ["charges", "shipping_address"]),
        })
        .request()
      const {
        estimate: { invoice_estimate },
      } = chargebeeResult
      invoiceEstimate = invoice_estimate
    }

    const createData = {
      customer: { connect: { id: customer.id } },
      orderNumber: `O-${Math.floor(Math.random() * 900000000) + 100000000}`,
      type: "Used" as OrderType,
      status: "Drafted" as OrderStatus,
      subTotal:
        invoiceEstimate.sub_total +
        // Because we removed the credits manually early, add them back here
        purchaseCreditsApplied +
        creditsApplied,
      total: invoiceEstimate.total,
      lineItems: {
        create: orderLineItems.map((orderLineItem, idx) => ({
          ...orderLineItem,
          taxRate: invoiceEstimate?.line_items?.[idx]?.tax_rate || 0,
          taxPrice: invoiceEstimate?.line_items?.[idx]?.tax_amount || 0,
        })),
      },
      paymentStatus: "Complete" as OrderPaymentStatus,
    }

    return (await this.prisma.client.order.create({
      data: createData,
      select,
    })) as Order
  }

  async buyUsedSubmitOrder({
    order,
    customer,
    select,
    paymentMethodID,
  }: {
    order: Pick<Order, "id">
    customer: Customer
    select: Prisma.OrderSelect
    paymentMethodID?: string
  }): Promise<Order> {
    const promises = []
    const customerWithData = await this.prisma.client.customer.findUnique({
      where: {
        id: customer.id,
      },
      select: {
        status: true,
        user: {
          select: {
            id: true,
          },
        },
        membership: {
          select: {
            id: true,
            creditBalance: true,
          },
        },
      },
    })
    if (customerWithData.status !== "Guest" && !!paymentMethodID) {
      throw new Error(
        "If customer is not a guest, paymentMethodID must be undefined"
      )
    }

    const orderWithData = await this.prisma.client.order.findUnique({
      where: { id: order.id },
      select: {
        id: true,
        orderNumber: true,
        lineItems: {
          select: {
            recordType: true,
            recordID: true,
            needShipping: true,
            price: true,
          },
        },
      },
    })
    const physicalProductIds = orderWithData.lineItems
      .filter(lineItem => lineItem.recordType === "PhysicalProduct")
      .map(lineItem => lineItem.recordID)

    const physicalProducts = await this.prisma.client.physicalProduct.findMany({
      where: { id: { in: physicalProductIds } },
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
    })

    const {
      invoice,
      shippingAddress,
      purchaseCreditsApplied,
      creditsApplied,
    } = await this.getBuyUsedMetadata({
      productVariantIds: physicalProducts.map(
        physProd => physProd.productVariant.id
      ),
      customer,
      type: "order",
    })

    const chargePromises = await this.chargeBuyUsedOrder(
      customerWithData,
      invoice,
      paymentMethodID,
      purchaseCreditsApplied,
      creditsApplied
    )
    promises.push(...chargePromises)

    const orderLineItemsWithShipping = orderWithData.lineItems.filter(
      orderLineItem =>
        orderLineItem.recordType === "PhysicalProduct" &&
        orderLineItem.needShipping
    )

    const orderNeedsShipping = orderLineItemsWithShipping.length > 0

    const physicalProductIdsToShip = orderLineItemsWithShipping.map(
      o => o.recordID
    )
    const physicalProducsToShip = physicalProducts.filter(physProd =>
      physicalProductIdsToShip.includes(physProd.id)
    )
    const variantsToShip = physicalProducsToShip.map(
      physProd => physProd.productVariant
    )
    const variantIdsToShip = variantsToShip.map(variant => variant.id)
    const variantsWithoutShipping =
      physicalProducts
        .filter(physProd => !physicalProductIdsToShip.includes(physProd.id))
        ?.map(physProd => physProd.productVariant) ?? []

    const getOrderShippingUpdate = async () => {
      if (!orderNeedsShipping) {
        return {}
      }

      const [shippoTransaction, shipmentWeight] = await Promise.all([
        this.shipping.createBuyUsedShippingLabel(variantIdsToShip, customer),
        this.shipping.calcShipmentWeightFromProductVariantIDs(variantIdsToShip),
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

    const productVariants = physicalProducts.map(
      physProd => physProd.productVariant
    )
    const productVariantIds = productVariants.map(variant => variant.id)

    for (const productVariant of variantsToShip) {
      const updateProductVariantData = this.productVariant.getCountsForStatusChange(
        {
          productVariant,
          oldInventoryStatus: "Reservable",
          newInventoryStatus: "Offloaded",
        }
      )

      promises.push(
        this.prisma.client.productVariant.update({
          where: { id: productVariant.id },
          data: updateProductVariantData,
        })
      )
    }

    for (const productVariant of variantsWithoutShipping) {
      const updateProductVariantData = this.productVariant.getCountsForStatusChange(
        {
          productVariant,
          oldInventoryStatus: "Reserved",
          newInventoryStatus: "Offloaded",
        }
      )

      promises.push(
        this.prisma.client.productVariant.update({
          where: { id: productVariant.id },
          data: updateProductVariantData,
        })
      )
    }

    if (variantsWithoutShipping?.length > 0) {
      const reservedBagItems = await this.prisma.client.bagItem.findMany({
        where: {
          customer: { id: customer.id },
          status: { in: ["Received", "Reserved"] },
        },
        select: { id: true, productVariant: { select: { id: true } } },
      })

      const bagItemsToDelete = reservedBagItems.filter(a =>
        productVariantIds.includes(a.productVariant.id)
      )

      promises.push(
        this.prisma.client.bagItem.deleteMany({
          where: { id: { in: bagItemsToDelete.map(bagItem => bagItem.id) } },
        })
      )

      const reservationToUpdate = await this.prisma.client.reservation.findFirst(
        {
          where: {
            reservationPhysicalProducts: {
              some: { physicalProduct: { id: physicalProductIds[0] } },
            },
            customer: { id: customer.id },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true },
        }
      )

      const shouldCompleteReservation =
        reservedBagItems.length === bagItemsToDelete.length
      promises.push(
        this.prisma.client.reservation.update({
          where: { id: reservationToUpdate.id },
          data: {
            purchasedProducts: {
              connect: physicalProductIds.map(id => {
                return { id }
              }),
            },
            status: shouldCompleteReservation
              ? "Completed"
              : reservationToUpdate.status,
          },
        })
      )
    }

    const bagItemsToDelete = await this.prisma.client.bagItem.findMany({
      where: {
        customer: { id: customer.id },
        isInCart: true,
      },
      select: {
        id: true,
      },
    })

    if (bagItemsToDelete?.length > 0) {
      promises.push(
        this.prisma.client.bagItem.deleteMany({
          where: { id: { in: bagItemsToDelete.map(item => item.id) } },
        })
      )
    }

    promises.push(
      ...[
        this.prisma.client.physicalProduct.updateMany({
          where: { id: { in: physicalProductIds } },
          data: {
            inventoryStatus: "Offloaded",
            offloadMethod: "SoldToUser",
            offloadNotes: `Order Number: ${orderWithData.orderNumber}`,
          },
        }),
        this.prisma.client.order.update({
          where: { id: order.id },
          data: {
            status: orderNeedsShipping ? "Submitted" : "Fulfilled",
            paymentStatus: "Paid",
            ...orderShippingUpdate,
          },
          select: merge(
            select,
            Prisma.validator<Prisma.OrderSelect>()({
              id: true,
              orderNumber: true,
            })
          ),
        }),
      ]
    )

    const results = await this.prisma.client.$transaction(promises)
    const updatedOrder = results.pop()

    const custWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })
    await this.email.sendBuyUsedOrderConfirmationEmail(
      custWithData.user,
      orderWithData
    )

    return updatedOrder
  }

  private async chargeBuyUsedOrder(
    customer: Pick<Customer, "status"> & { user: Pick<User, "id"> } & {
      membership: Pick<CustomerMembership, "id" | "creditBalance">
    },
    invoice,
    paymentMethodID,
    purchaseCreditsApplied,
    creditsApplied
  ) {
    const promises = []
    const { list: invoicesForCustomer } = await chargebee.invoice
      .list({
        limit: 100,
        "customer_id[is]": customer.user.id,
      })
      .request()
    const existingPaidInvoice = invoicesForCustomer.find(a => {
      const { invoice: chargebee_invoice } = a
      const isPaid = chargebee_invoice.status === "paid"

      // e.g "Purchased Used Hide Jacket"
      // since the invoice note specifies the items being purchased,
      // it should be sufficient to detect a collision.
      const hasSameNote =
        chargebee_invoice.notes?.[0]?.note === invoice.invoice_note

      return isPaid && hasSameNote
    })

    if (existingPaidInvoice) {
      return promises
    }

    if (customer.status === "Guest") {
      const createData = {
        ...invoice,
        auto_collection: "on",
        payment_method: {
          type: "card",
          gateway_account_id: process.env.CHARGEBEE_GATEWAY_ACCOUNT_ID,
          tmp_token: paymentMethodID,
        },
      }
      const { invoice: _invoice } = await chargebee.invoice
        .create(createData)
        .request()
    } else {
      if (purchaseCreditsApplied > 0 || creditsApplied > 0) {
        await this.addPromotionalCredits({
          purchaseCreditsApplied,
          creditsApplied,
          userId: customer.user.id,
        })

        promises.push(
          this.updatePurchaseCreditsUsed({
            purchaseCreditsApplied,
            creditsApplied,
            customerMembershipId: customer.membership.id,
            creditBalance: customer.membership.creditBalance,
          })
        )
      }
      const { invoice: _invoice } = await chargebee.invoice
        .create({ ...invoice, auto_collection: "on" })
        .request()
    }

    return promises
  }

  async updateOrderStatus({
    orderID,
    status,
    select,
  }: {
    orderID: string
    status: OrderStatus
    select: Prisma.OrderSelect
  }): Promise<Order> {
    const promises = []

    promises.push(
      this.prisma.client.order.update({
        where: { id: orderID },
        data: { status },
        select,
      })
    )

    const order = await this.prisma.client.order.findUnique({
      where: { id: orderID },
      select: {
        id: true,
        orderNumber: true,
        type: true,
        lineItems: { select: { recordID: true, recordType: true } },
        customer: { select: { id: true, user: true } },
        sentPackage: {
          select: {
            shippingLabel: {
              select: {
                trackingNumber: true,
                trackingURL: true,
              },
            },
          },
        },
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
          new Error("Unable to find physical product on order")
        )
        return null
      }
      const prodVar = await this.prisma.client.productVariant.findFirst({
        where: { physicalProducts: { some: { id: physicalProduct.recordID } } },
      })
      const reservedBagItem = await this.bag.getBagItem(
        prodVar.id,
        false,
        order.customer,
        { id: true }
      )
      const savedBagItem = await this.bag.getBagItem(
        prodVar.id,
        true,
        order.customer,
        { id: true }
      )
      if (!!reservedBagItem) {
        promises.push(
          this.prisma.client.bagItem.delete({
            where: { id: reservedBagItem.id },
          })
        )
      }
      if (!!savedBagItem) {
        promises.push(
          this.prisma.client.bagItem.delete({ where: { id: savedBagItem.id } })
        )
      }

      // Remove warehouse location from item
      promises.push(
        this.prisma.client.physicalProduct.update({
          where: { id: physicalProduct.recordID },
          data: { warehouseLocation: { disconnect: true } },
        })
      )

      const rpp = await this.prisma.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            physicalProductId: physicalProduct.recordID,
            customerId: order.customer.id,
          },
          select: {
            id: true,
          },
        }
      )

      if (!!rpp) {
        promises.push(
          this.prisma.client.reservationPhysicalProduct.update({
            where: {
              id: rpp.id,
            },
            data: {
              purchasedAt: new Date(),
              status: "Purchased",
            },
          })
        )
      }

      const shippingLabel = order.sentPackage?.shippingLabel
      await this.email.sendOrderProcessedEmail(order.customer.user, order, {
        trackingNumber: shippingLabel?.trackingNumber,
        trackingURL: shippingLabel?.trackingURL,
      })
    }

    const finalPromises = promises.filter(a => !!a)
    const [updateOrderResult] = await this.prisma.client.$transaction(
      finalPromises
    )

    return updateOrderResult
  }

  getChargebeeShippingAddress({
    location,
    user,
  }: {
    location: Location
    user: Pick<User, "email">
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
      state_code: this.utils.abbreviateState(location?.state),
      zip: location?.zipCode,
      country: location?.country || "US",
    }
  }

  getChargebeeChargeForOrderLineItem({
    price,
    recordType,
    productName,
    productTaxCode,
    shippingDescription,
  }: {
    price: number
    recordType: string
    productName: string
    productTaxCode: string
    shippingDescription: string
  }): InvoiceCharge | null {
    if (price === 0) {
      return null
    }

    if (recordType === "ExternalProduct" || recordType === "PhysicalProduct") {
      return {
        amount: price,
        taxable: true,
        description: productName,
        avalara_tax_code: productTaxCode,
      }
    }

    if (recordType === "Package" && price > 0) {
      return {
        amount: price,
        taxable: true,
        description: shippingDescription,
        avalara_tax_code: "FR020000",
      }
    }
  }

  private async addPromotionalCredits({
    purchaseCreditsApplied,
    creditsApplied,
    userId,
  }: {
    purchaseCreditsApplied: number
    creditsApplied: number
    userId: string
  }) {
    let description
    if (purchaseCreditsApplied > 0 && creditsApplied > 0) {
      description = `(MONSOON_IGNORE) Membership discount credits: $${
        purchaseCreditsApplied / 100
      } & Promotional credits $${
        creditsApplied / 100
      } applied towards order charges`
    } else if (purchaseCreditsApplied > 0) {
      description = `(MONSOON_IGNORE) Membership discount credits: $${
        purchaseCreditsApplied / 100
      } applied towards order charges`
    } else {
      description = `(MONSOON_IGNORE) Promotional credits: $${
        creditsApplied / 100
      } applied towards order charges`
    }

    await chargebee.promotional_credit
      .add({
        customer_id: userId,
        amount: creditsApplied + purchaseCreditsApplied,
        // (MONSOON_IGNORE) tells the chargebee webhook to not automatically move these credits to prisma.
        description,
      })
      .request()
  }

  private updatePurchaseCreditsUsed({
    customerMembershipId,
    creditBalance,
    purchaseCreditsApplied,
    creditsApplied,
  }: {
    customerMembershipId: string
    creditBalance: number
    purchaseCreditsApplied: number
    creditsApplied: number
  }) {
    let data
    if (purchaseCreditsApplied > 0 && creditsApplied > 0) {
      data = {
        purchaseCredits: 0,
        creditBalance: creditBalance - creditsApplied,
      }
    } else if (purchaseCreditsApplied > 0) {
      data = {
        purchaseCredits: 0,
      }
    } else {
      data = {
        creditBalance: creditBalance - creditsApplied,
      }
    }
    return this.prisma.client.customerMembership.update({
      where: {
        id: customerMembershipId,
      },
      data,
    })
  }

  private async getProductTaxCode(productCategoryId) {
    const outerwearCategoryIds = (await this.outerwearCategories).map(a => a.id)
    return outerwearCategoryIds.some(
      outerwearCategoryId => outerwearCategoryId === productCategoryId
    )
      ? "PC040111"
      : "PC040000"
  }

  private async getPhysicalProductForOrder(
    productVariants: Array<
      Pick<ProductVariant, "id"> & {
        product: Pick<Product, "name" | "id"> & {
          category: Pick<Category, "id">
        }
        physicalProducts: Array<
          Pick<PhysicalProduct, "inventoryStatus" | "id"> & {
            price: Pick<PhysicalProductPrice, "buyUsedEnabled" | "buyUsedPrice">
            productVariant: { product: Pick<Product, "discountedPrice"> }
          }
        >
      }
    >,
    customerWithData: {
      id: string
      bagItems: Array<
        Pick<BagItem, "status"> & {
          productVariant: Pick<ProductVariant, "id">
        } & {
          physicalProduct: Pick<PhysicalProduct, "id"> & {
            price: Pick<PhysicalProductPrice, "buyUsedEnabled" | "buyUsedPrice">
            productVariant: { product: Pick<Product, "discountedPrice"> }
          }
        }
      >
    }
  ) {
    const physicalProductsWithShippingRequirements = []
    for (const productVariant of productVariants) {
      const productTaxCode = await this.getProductTaxCode(
        productVariant?.product?.category?.id
      )
      const name = productVariant.product.name
      const isProductVariantReserved = this.isProductVariantReserved(
        productVariant,
        customerWithData
      )
      if (isProductVariantReserved) {
        const bagItem = customerWithData.bagItems.find(
          a =>
            a.productVariant.id === productVariant.id && a.status === "Reserved"
        )
        if (!bagItem) {
          throw "Expected reserved bag item"
        }
        physicalProductsWithShippingRequirements.push({
          physicalProduct: bagItem.physicalProduct,
          shippingRequired: false,
          name,
          productTaxCode,
        })
      } else {
        const physicalProduct = productVariant.physicalProducts.find(
          physicalProduct =>
            physicalProduct?.price?.buyUsedEnabled &&
            physicalProduct.inventoryStatus === "Reservable"
        )
        if (!physicalProduct) {
          const cartItem = await this.prisma.client.bagItem.findFirst({
            where: {
              customer: { id: customerWithData.id },
              productVariant: { id: productVariant.id },
              isInCart: true,
            },
          })
          if (cartItem) {
            await this.prisma.client.bagItem.delete({
              where: { id: cartItem.id },
            })
            // Delete the bag item
            throw new ApolloError("Could not find reservable unit to sell")
          } else {
            throw new ApolloError(
              "Please remove unreservable unit from local cart",
              "400",
              {
                productVariantId: productVariant.id,
              }
            )
          }
        }
        physicalProductsWithShippingRequirements.push({
          physicalProduct: physicalProduct,
          shippingRequired: true,
          name,
          productTaxCode,
        })
      }
    }
    return physicalProductsWithShippingRequirements
  }

  private isProductVariantReserved(
    productVariant: Pick<ProductVariant, "id"> & {
      physicalProducts: Array<
        Pick<PhysicalProduct, "inventoryStatus" | "id"> & {
          price: Pick<PhysicalProductPrice, "buyUsedEnabled" | "buyUsedPrice">
        }
      >
    },
    customerWithData: {
      bagItems: Array<
        Pick<BagItem, "status"> & {
          productVariant: Pick<ProductVariant, "id">
        } & {
          physicalProduct: Pick<PhysicalProduct, "id"> & {
            price: Pick<PhysicalProductPrice, "buyUsedEnabled" | "buyUsedPrice">
          }
        }
      >
    }
  ) {
    return customerWithData.bagItems.some(
      ({ status, productVariant: { id: productVariantId } }) =>
        status === "Reserved" && productVariantId === productVariant.id
    )
  }
}
