import { Context, sendTransactionalEmail } from "../utils"
import {
  getUserRequestObject,
  getCustomerFromContext,
  UserRequestObject,
} from "../auth/utils"
import sgMail from "@sendgrid/mail"
import {
  ProductVariantUpdateInput,
  ReservationCreateInput,
  User,
  Product as PrismaProduct,
  Prisma,
  Reservation,
  Customer,
} from "../prisma"
import { getAllProductVariants, createReservation } from "../airtable/utils"
import { ApolloError } from "apollo-server"
import shippo from "shippo"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
var activeShippo = shippo(process.env.SHIPPO_API_KEY)

export const Product = {
  async isSaved(parent, {}, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const product = await ctx.prisma
      .customer({
        id: customer.id,
      })
      .savedProducts({
        where: {
          id: parent.id,
        },
      })

    return !!product.length
  },
}

export const ProductMutations = {
  async reserveItems(parent, { items }, ctx: Context, info) {
    let reservationReturnData
    try {
      // Get user data
      const userRequestObject = await getUserRequestObject(ctx)
      const customer = await getCustomerFromContext(ctx)

      // Get product data and update variant counts
      const physicalProducts = await ctx.prisma.physicalProducts({
        where: {
          productVariant: {
            id_in: items,
          },
        },
      })
      const products = await updateProductVariantCounts(
        items,
        physicalProducts,
        ctx
      )
      const physicalProductSUIDs = physicalProducts.map(p => ({
        seasonsUID: p.seasonsUID,
      }))

      // Create shipping labels. Wrap the transaction calls in a try-catch
      // so if the label creation fails, the call still continues as planned
      const [
        seasonsToShippoShipment,
        customerToSeasonsShipment,
      ] = await createShippoShipment(
        ctx.prisma,
        userRequestObject,
        customer,
        items
      )
      let seasonsToCustomerTransaction = await createShippingLabel(
        {
          shipment: seasonsToShippoShipment,
          carrier_account: process.env.UPS_ACCOUNT_ID,
          servicelevel_token: "ups_ground",
        },
        userRequestObject.id
      )
      let customerToSeasonsTransaction = await createShippingLabel(
        {
          shipment: customerToSeasonsShipment,
          carrier_account: process.env.UPS_ACCOUNT_ID,
          servicelevel_token: "ups_ground",
        },
        userRequestObject.id
      )

      // Create reservation records in prisma and airtable
      const reservationData = createReservationData(
        seasonsToCustomerTransaction,
        customerToSeasonsTransaction,
        userRequestObject,
        customer,
        physicalProductSUIDs
      )
      const reservation = await ctx.prisma.createReservation(reservationData)
      createReservation(
        userRequestObject.email,
        reservationData,
        seasonsToCustomerTransaction.formatted_error,
        customerToSeasonsTransaction.formatted_error
      )

      // Send confirmation email
      await sendReservationConfirmationEmail(
        ctx.prisma,
        userRequestObject,
        products,
        reservation
      )

      // Get return data
      reservationReturnData = await ctx.db.query.reservation(
        { where: { id: reservation.id } },
        info
      )
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }

    return reservationReturnData
  },
  async checkItemsAvailability(parent, { items }, ctx: Context, info) {
    const userRequestObject = getUserRequestObject(ctx)
    const physicalProducts = await ctx.prisma.physicalProducts({
      where: {
        productVariant: {
          id_in: items,
        },
      },
    })

    await updateProductVariantCounts(items, physicalProducts, ctx, {
      dryRun: true,
    })

    return true
  },
}

const updateProductVariantCounts = async (
  items,
  physicalProducts,
  ctx,
  { dryRun } = { dryRun: false }
) => {
  // Check if physical product is available for each product variant
  const variants = await ctx.prisma.productVariants({
    where: { id_in: items },
  })

  const unavailableVariants = variants.filter(v => v.reservable <= 0)
  if (unavailableVariants.length > 0) {
    throw new ApolloError(
      "The following item is not reservable",
      "511",
      unavailableVariants
    )
  }

  const availablePhysicalProducts = []
  for (let physicalProduct of physicalProducts) {
    if (true) {
      availablePhysicalProducts.push(physicalProduct)
    }
  }

  if (availablePhysicalProducts.length < 3) {
    // TODO: list out unavailable items
    throw new ApolloError("Must reserve at least 3 items a time", "515")
  }

  const allProductVariants = await getAllProductVariants()
  const variantSlugs = variants.map(a => a.sku)
  const productVariants = allProductVariants.filter(a =>
    variantSlugs.includes(a.model.sKU)
  )
  const products = []

  //TODO: convert to transaction
  for (let variant of variants) {
    const iProduct = await ctx.prisma
      .productVariant({ id: variant.id })
      .product()

    products.push(iProduct)
    // console.log(iProduct, variant)

    if (!dryRun) {
      const data = {
        reservable: variant.reservable - 1,
        reserved: variant.reserved + 1,
      } as ProductVariantUpdateInput

      try {
        const update = ctx.prisma.updateProductVariant({
          where: {
            id: variant.id,
          },
          data,
        })

        const { reservable, reserved, nonReservable } = await update

        // Airtable record of product variant
        const aProductVariant = productVariants.find(
          a => a.model.sKU === variant.sku
        )

        aProductVariant.patchUpdate({
          "Reservable Count": reservable,
          "Reserved Count": reserved,
          "Non-Reservable Count": nonReservable,
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  return products
}

async function sendReservationConfirmationEmail(
  prisma: Prisma,
  user: UserRequestObject,
  products: Array<PrismaProduct>,
  reservation: Reservation
) {
  try {
    const prod1Data = await getReservationConfirmationDataForProduct(
      prisma,
      products[0],
      "item1"
    )
    const prod2Data = await getReservationConfirmationDataForProduct(
      prisma,
      products[1],
      "item2"
    )
    const prod3Data = await getReservationConfirmationDataForProduct(
      prisma,
      products[2],
      "item3"
    )
    sendTransactionalEmail(user.email, "d-f1de06bb4b89408e8059c07eb30d9f8f", {
      order_number: reservation.reservationNumber,
      ...prod1Data,
      ...prod2Data,
      ...prod3Data,
    })
  } catch (err) {
    console.log(err)
    throw err
  }

  // *************************************************************************
  async function getReservationConfirmationDataForProduct(
    prisma: Prisma,
    product: PrismaProduct,
    prefix: String
  ) {
    let data = {}
    data[`${prefix}_url`] = product.images[0].url
    data[`${prefix}_brand`] = await prisma
      .product({ id: product.id })
      .brand()
      .name()
    data[`${prefix}_name`] = product.name
    data[`${prefix}_price`] = product.retailPrice
    return data
  }
}

async function calcShipmentWeight(
  prisma: Prisma,
  itemIDs: Array<string>
): Promise<Number> {
  const shippingBagWeight = 1
  const productVariants = await prisma.productVariants({
    where: { id_in: itemIDs },
  })
  return productVariants.reduce(function addProductWeight(acc, curProdVar) {
    return acc + curProdVar.weight
  }, shippingBagWeight)
}

interface ShippoShipment {
  address_from: any
  address_to: any
  parcels: any
}

async function createShippoShipment(
  prisma: Prisma,
  user: UserRequestObject,
  customer: Customer,
  items: Array<string>
): Promise<Array<ShippoShipment>> {
  var seasonsAddressShippo = {
    name: "Seasons NYC",
    company: "Seasons NYC",
    street1: "134 Mulberry Street",
    street2: "Unit 5A2",
    city: "New York",
    state: "NY",
    zip: "10003",
    country: "US",
    phone: "706-271-7092",
    email: "reservations@seasons.nyc",
  }
  var nextCleanersAddressShippo = {
    name: "Seasons NYC",
    company: "Seasons NYC",
    street1: "650 Belleville Tpke",
    street2: "",
    city: "Kearny",
    state: "New Jersey",
    zip: "07032",
    country: "US",
    phone: "706-271-7092",
    email: "reservations@seasons.nyc",
  }
  const customerShippingAddressPrisma = await prisma
    .customer({ id: customer.id })
    .detail()
    .shippingAddress()
  const customerPhoneNumber = await prisma
    .customer({ id: customer.id })
    .detail()
    .phoneNumber()
  var customerAddressShippo = {
    name: `${user.firstName} ${user.lastName}`,
    street1: customerShippingAddressPrisma.address1,
    street2: customerShippingAddressPrisma.address2,
    city: customerShippingAddressPrisma.city,
    state: customerShippingAddressPrisma.state,
    zip: customerShippingAddressPrisma.zipCode,
    country: "US",
    email: user.email,
  }
  const shipmentWeight = await calcShipmentWeight(prisma, items)
  var parcel = {
    // dimensions of seasons bag
    length: "20",
    width: "28",
    height: "5",
    distance_unit: "in",
    weight: shipmentWeight,
    mass_unit: "lb",
  }
  return [
    {
      address_from: seasonsAddressShippo,
      address_to: customerAddressShippo,
      parcels: [parcel],
    },
    {
      address_from: customerAddressShippo,
      address_to: nextCleanersAddressShippo,
      parcels: [parcel],
    },
  ]
}

function createReservationData(
  seasonsToCustomerTransaction,
  customerToSeasonsTransaction,
  user: UserRequestObject,
  customer: Customer,
  physicalProductSUIDs: Array<{ seasonsUID: string }>
): ReservationCreateInput {
  return {
    products: {
      connect: physicalProductSUIDs,
    },
    customer: {
      connect: {
        id: customer.id,
      },
    },
    user: {
      connect: {
        id: user.id,
      },
    },
    shippingLabel: {
      create: {
        image: seasonsToCustomerTransaction.label_url || "",
        trackingNumber: seasonsToCustomerTransaction.tracking_number || "",
        trackingURL: seasonsToCustomerTransaction.tracking_url_provider || "",
        name: "UPS",
      },
    },
    returnLabel: {
      create: {
        image: customerToSeasonsTransaction.label_url || "",
        trackingNumber: customerToSeasonsTransaction.tracking_number || "",
        trackingURL: customerToSeasonsTransaction.tracking_url_provider || "",
        name: "UPS",
      },
    },
    reservationNumber: Math.floor(Math.random() * 90000) + 10000,
    shipped: false,
    status: "InQueue",
  }
}

interface ShippoTransaction {
  label_url: string
  tracking_number: string
  tracking_url_provider: string
  messages: Array<any>
  formatted_error?: string
  status: string
}

interface ShippoLabelInputs {
  shipment: ShippoShipment
  carrier_account: string
  servicelevel_token: string
}
async function createShippingLabel(
  inputs: ShippoLabelInputs,
  userID: string
): Promise<ShippoTransaction> {
  let transaction = await activeShippo.transaction.create(inputs)
  transaction.formatted_error =
    transaction.status === "ERROR"
      ? `Failed to make one or more shipping labels for user with id: ` +
        ` ${userID}.\nError Messages: ${JSON.stringify(transaction.messages)}`
      : ""
  return transaction
}
