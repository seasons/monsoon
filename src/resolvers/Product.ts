import {
  Context,
  sendTransactionalEmail,
  getPrismaLocationFromSlug,
  calcShipmentWeightFromProductVariantIDs,
} from "../utils"
import {
  getUserRequestObject,
  getCustomerFromContext,
  getUserFromContext,
  UserRequestObject,
} from "../auth/utils"
import sgMail from "@sendgrid/mail"
import {
  ProductVariantUpdateInput,
  ReservationCreateInput,
  Product as PrismaProduct,
  Prisma,
  Reservation,
  Customer,
  Location,
  PhysicalProduct,
  ID_Input,
  ProductVariant,
} from "../prisma"
import {
  getAllProductVariants,
  createReservation,
  getPhysicalProducts,
} from "../airtable/utils"
import { ApolloError } from "apollo-server"
import shippo from "shippo"
import { uniqBy } from "lodash"
import { updatePhysicalProduct } from "../airtable/updatePhysicalProduct"
import { base } from "../airtable/config"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
var activeShippo = shippo(process.env.SHIPPO_API_KEY)
const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

const SEASONS_CLEANER_LOCATION_SLUG = "seasons-cleaners-official"

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

interface PhysicalProductWithReservationSpecificData extends PhysicalProduct {
  productVariant: Pick<ProductVariant, "id">
}

export const ProductMutations = {
  async reserveItems(parent, { items }, ctx: Context, info) {
    let reservationReturnData
    try {
      // Get user data
      const userRequestObject = await getUserRequestObject(ctx)
      const customer = await getCustomerFromContext(ctx)

      // Get product data, update variant counts, update physical product statuses
      const allPhysicalProductsForGivenProductVariantIDs = await getPhysicalProductsWithReservationSpecificData(
        ctx,
        items
      )
      const [
        products,
        physicalProductsBeingReserved,
      ] = await updateProductVariantCounts(
        items,
        allPhysicalProductsForGivenProductVariantIDs,
        ctx
      )
      await updatePhysicalProductInventoryStatusesOnPrisma(
        ctx.prisma,
        physicalProductsBeingReserved as PhysicalProduct[]
      )
      await updatePhysicalProductInventoryStatusesOnAirtable(
        physicalProductsBeingReserved as PhysicalProduct[]
      )

      const physicalProductSUIDs = (physicalProductsBeingReserved as PhysicalProduct[]).map(
        p => ({
          seasonsUID: p.seasonsUID,
        })
      )

      // Create shipping labels. Wrap the transaction calls in a try-catch
      // so if the label creation fails, the call still continues as planned
      const shipmentWeight = await calcShipmentWeightFromProductVariantIDs(
        ctx.prisma,
        items
      )
      const [
        seasonsToShippoShipment,
        customerToSeasonsShipment,
      ] = await createShippoShipment(
        ctx.prisma,
        userRequestObject,
        customer,
        shipmentWeight
      )
      let seasonsToCustomerTransaction = await createShippingLabel(
        {
          shipment: seasonsToShippoShipment,
          carrier_account: process.env.UPS_ACCOUNT_ID,
          servicelevel_token: "ups_ground",
        },
        userRequestObject.id
      ).catch(e => {
        throw e
      })
      let customerToSeasonsTransaction = await createShippingLabel(
        {
          shipment: customerToSeasonsShipment,
          carrier_account: process.env.UPS_ACCOUNT_ID,
          servicelevel_token: "ups_ground",
        },
        userRequestObject.id
      ).catch(e => {
        throw e
      })

      // Create reservation records in prisma and airtable
      const reservationData = await createReservationData(
        ctx.prisma,
        seasonsToCustomerTransaction,
        customerToSeasonsTransaction,
        userRequestObject,
        customer,
        physicalProductSUIDs,
        shipmentWeight,
        physicalProductsBeingReserved as PhysicalProduct[]
      ).catch(e => {
        throw e
      })
      const reservation = await ctx.prisma
        .createReservation(reservationData)
        .catch(e => {
          throw e
        })
      await createReservation(
        userRequestObject.email,
        reservationData,
        seasonsToCustomerTransaction.formatted_error,
        customerToSeasonsTransaction.formatted_error
      )

      // Send confirmation email
      await sendReservationConfirmationEmail(
        ctx.prisma,
        userRequestObject,
        products as PrismaProduct[],
        reservation
      )

      // Get return data
      reservationReturnData = await ctx.db.query.reservation(
        { where: { id: reservation.id } },
        info
      )
    } catch (err) {
      console.log(err)
      throw err
    }

    // Track the selection
    const prismaUser = await getUserFromContext(ctx)
    ctx.analytics.track({
      userId: prismaUser.id,
      event: "Reserved Items",
      properties: {
        productVariantIDs: items,
      },
    })

    return reservationReturnData
  },
  async checkItemsAvailability(parent, { items }, ctx: Context, info) {
    const userRequestObject = getUserRequestObject(ctx)
    const physicalProducts = await getPhysicalProductsWithReservationSpecificData(
      ctx,
      items
    )

    await updateProductVariantCounts(items, physicalProducts, ctx, {
      dryRun: true,
    })

    return true
  },
}

async function updatePhysicalProductInventoryStatusesOnPrisma(
  prisma: Prisma,
  products: Array<PhysicalProduct>
) {
  for (let prod of products) {
    await prisma.updatePhysicalProduct({
      data: { inventoryStatus: "Reserved" },
      where: { id: prod.id },
    })
  }
}

/* Returns back [ProductsBeingReserved, PhysicalProductsBeingReserved] */
const updateProductVariantCounts = async (
  /* array of product variant ids */
  items: Array<ID_Input>,

  /* all physical products associated with the product variants indicated by `items` */
  physicalProducts: Array<PhysicalProductWithReservationSpecificData>,

  ctx: Context,
  { dryRun } = { dryRun: false }
): Promise<
  Array<PrismaProduct[] | PhysicalProductWithReservationSpecificData[]>
> => {
  const variants = await ctx.prisma.productVariants({
    where: { id_in: items },
  })

  // Are there any unavailable variants? If so, throw an error
  const unavailableVariants = variants.filter(v => v.reservable <= 0)
  if (unavailableVariants.length > 0) {
    throw new ApolloError(
      "The following item is not reservable",
      "511",
      unavailableVariants
    )
  }

  // Double check that the product variants have a sufficient number of available
  // physical products
  let availablePhysicalProducts = extractUniqueReservablePhysicalProducts(
    physicalProducts
  )
  if (availablePhysicalProducts.length < 3) {
    // TODO: list out unavailable items
    throw new ApolloError("Must reserve at least 3 items a time", "515")
  }

  // Get the corresponding product variant records from airtable
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

    // Update product variant counts in prisma and airtable
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

  return [products, availablePhysicalProducts]
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

interface ShippoShipment {
  address_from: any
  address_to: any
  parcels: any
}

interface CoreShippoAddressFields {
  name: string
  company: string
  street1: String
  street2: String
  city: String
  state: String
  zip: String
}
async function createShippoShipment(
  prisma: Prisma,
  user: UserRequestObject,
  customer: Customer,
  shipmentWeight: Number
): Promise<Array<ShippoShipment>> {
  // Create Next Cleaners Address object
  const nextCleanersAddressPrisma = await getPrismaLocationFromSlug(
    prisma,
    SEASONS_CLEANER_LOCATION_SLUG
  )
  const nextCleanersAddressShippo = {
    ...prismaLocationToCoreShippoAddressFields(nextCleanersAddressPrisma),
    ...seasonsHQOrCleanersSecondaryAddressFields(),
  }

  // Create customer address object
  const customerShippingAddressPrisma = await prisma
    .customer({ id: customer.id })
    .detail()
    .shippingAddress()
  const customerPhoneNumber = await prisma
    .customer({ id: customer.id })
    .detail()
    .phoneNumber()
  const customerAddressShippo = {
    ...prismaLocationToCoreShippoAddressFields(customerShippingAddressPrisma),
    name: `${user.firstName} ${user.lastName}`,
    phone: customerPhoneNumber,
    country: "US",
    email: user.email,
  }

  // Create parcel object
  const parcel = {
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
      address_from: nextCleanersAddressShippo,
      address_to: customerAddressShippo,
      parcels: [parcel],
    },
    {
      address_from: customerAddressShippo,
      address_to: nextCleanersAddressShippo,
      parcels: [parcel],
    },
  ]

  // **************************************************
  function prismaLocationToCoreShippoAddressFields(
    location: Location
  ): CoreShippoAddressFields {
    if (location == null) {
      throw new Error("can not extract values from null object")
    }
    return {
      name: location.name,
      company: location.company,
      street1: location.address1,
      street2: location.address2,
      city: location.city,
      state: location.state,
      zip: location.zipCode,
    }
  }
  function seasonsHQOrCleanersSecondaryAddressFields() {
    return {
      country: "US",
      phone: "706-271-7092",
      email: "reservations@seasons.nyc",
    }
  }
}

async function createReservationData(
  prisma: Prisma,
  seasonsToCustomerTransaction,
  customerToSeasonsTransaction,
  user: UserRequestObject,
  customer: Customer,
  physicalProductSUIDs: Array<{ seasonsUID: string }>,
  shipmentWeight: number,
  physicalProducts: Array<PhysicalProduct>
): Promise<ReservationCreateInput> {
  const customerShippingAddressRecordID = await prisma
    .customer({ id: customer.id })
    .detail()
    .shippingAddress()
    .id()
  interface UniqueIDObject {
    id: string
  }
  const uniqueReservationNumber = await getUniqueReservationNumber(prisma)

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
    sentPackage: {
      create: {
        weight: shipmentWeight,
        items: {
          // need to include the type on the function passed into map
          // or we get build errors comlaining about the type here
          connect: physicalProducts.map(function(prod): UniqueIDObject {
            return { id: prod.id }
          }),
        },
        shippingLabel: {
          create: {
            image: seasonsToCustomerTransaction.label_url || "",
            trackingNumber: seasonsToCustomerTransaction.tracking_number || "",
            trackingURL:
              seasonsToCustomerTransaction.tracking_url_provider || "",
            name: "UPS",
          },
        },
        fromAddress: {
          connect: {
            slug: SEASONS_CLEANER_LOCATION_SLUG,
          },
        },
        toAddress: {
          connect: { id: customerShippingAddressRecordID },
        },
      },
    },
    returnedPackage: {
      create: {
        shippingLabel: {
          create: {
            image: customerToSeasonsTransaction.label_url || "",
            trackingNumber: customerToSeasonsTransaction.tracking_number || "",
            trackingURL:
              customerToSeasonsTransaction.tracking_url_provider || "",
            name: "UPS",
          },
        },
        fromAddress: {
          connect: {
            id: customerShippingAddressRecordID,
          },
        },
        toAddress: {
          connect: {
            slug: SEASONS_CLEANER_LOCATION_SLUG,
          },
        },
      },
    },
    reservationNumber: uniqueReservationNumber,
    location: {
      connect: {
        slug: SEASONS_CLEANER_LOCATION_SLUG,
      },
    },
    shipped: false,
    status: "InQueue",
  }
}

async function getUniqueReservationNumber(prisma: Prisma): Promise<number> {
  return new Promise(async function checkRandomNumbersUntilWeFindAUniqueOne(
    resolve,
    reject
  ) {
    let reservationNumber: number
    let foundUnique = false
    while (!foundUnique) {
      reservationNumber = Math.floor(Math.random() * 900000000) + 100000000
      const reservationWithThatNumber = await prisma.reservation({
        reservationNumber,
      })
      foundUnique = !reservationWithThatNumber
    }
    resolve(reservationNumber)
  })
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
  return new Promise(async function(resolve, reject) {
    let transaction = await activeShippo.transaction
      .create(inputs)
      .catch(err => reject(err))
    if (
      transaction.object_state === "VALID" &&
      transaction.status === "ERROR"
    ) {
      reject(
        transaction.messages.reduce(function(acc, curVal) {
          return `${acc}. Source: ${curVal.source}. Code: ${curVal.code}. Error Message: ${curVal.text}`
        }, "")
      )
    } else if (!transaction.label_url) {
      reject(JSON.stringify(transaction))
    }
    resolve(transaction)
  })
}

async function getPhysicalProductsWithReservationSpecificData(
  ctx: Context,
  items: ID_Input[]
): Promise<Array<PhysicalProductWithReservationSpecificData>> {
  return await ctx.db.query.physicalProducts(
    {
      where: {
        productVariant: {
          id_in: items,
        },
      },
    },
    `{ 
        id
        seasonsUID
        inventoryStatus 
        productVariant { 
            id 
        } 
    }`
  )
}

function extractUniqueReservablePhysicalProducts(
  physicalProducts: PhysicalProductWithReservationSpecificData[]
): PhysicalProductWithReservationSpecificData[] {
  return uniqBy(
    physicalProducts.filter(a => a.inventoryStatus === "Reservable"),
    b => b.productVariant.id
  )
}

async function updatePhysicalProductInventoryStatusesOnAirtable(
  physicalProducts: PhysicalProduct[]
) {
  const airtablePhysicalProductRecords = await getPhysicalProducts(
    physicalProducts.map(prod => prod.seasonsUID)
  )
  for (let prod of airtablePhysicalProductRecords) {
    base("Physical Products").find(prod.id, function(err, record) {
      if (err) {
        Sentry.captureException(err)
        return
      }
      updatePhysicalProduct(record.id, { "Inventory Status": "Reserved" })
    })
  }
}
