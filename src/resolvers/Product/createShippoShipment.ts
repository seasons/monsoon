import { Prisma, Customer, Location } from "../../prisma"
import { UserRequestObject } from "../../auth/utils"
import { getPrismaLocationFromSlug } from "../../utils"

export async function createShippoShipment(
  prisma: Prisma,
  user: UserRequestObject,
  customer: Customer,
  shipmentWeight: Number,
  insuranceAmount: Number
): Promise<Array<ShippoShipment>> {
  // Create Next Cleaners Address object
  const nextCleanersAddressPrisma = await getPrismaLocationFromSlug(
    prisma,
    process.env.SEASONS_CLEANER_LOCATION_SLUG
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
      extra: {
        insurance: {
          amount: insuranceAmount.toString(),
          currency: "USD",
        },
      },
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

export interface ShippoShipment {
  address_from: any
  address_to: any
  parcels: any
  extra?: any
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
