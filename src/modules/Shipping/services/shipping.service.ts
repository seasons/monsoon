import { Injectable } from "@nestjs/common"
import { PrismaClientService } from "../../../prisma/client.service"
import { User, Customer, ID_Input, Location } from "../../../prisma"
import { UtilsService } from "../../Utils/utils.service"
import shippo from "shippo"
import { ShippoTransaction, ShippoShipment } from "../shipping.types"

interface CoreShippoAddressFields {
  name: string
  company: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
}

interface ShippoLabelInputs {
  shipment: ShippoShipment
  carrier_account: string
  servicelevel_token: string
}

@Injectable()
export class ShippingService {
  private readonly shippo = shippo(process.env.SHIPPO_API_KEY)

  constructor(
    private readonly prisma: PrismaClientService,
    private readonly utilsService: UtilsService
  ) {}

  async createReservationShippingLabels(
    newProductVariantsBeingReserved: ID_Input[],
    user: User,
    customer: Customer
  ): Promise<ShippoTransaction[]> {
    const shipmentWeight = await this.calcShipmentWeightFromProductVariantIDs(
      newProductVariantsBeingReserved as string[]
    )
    const insuranceAmount = await this.calcTotalRetailPriceFromProductVariantIDs(
      newProductVariantsBeingReserved as string[]
    )

    const [
      seasonsToShippoShipment,
      customerToSeasonsShipment,
    ] = await this.createShippoShipment(
      user,
      customer,
      shipmentWeight,
      insuranceAmount
    )

    const seasonsToCustomerTransaction = await this.createShippingLabel({
      shipment: seasonsToShippoShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: "ups_ground",
    })
    const customerToSeasonsTransaction = await this.createShippingLabel({
      shipment: customerToSeasonsShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: "ups_ground",
    })

    return [seasonsToCustomerTransaction, customerToSeasonsTransaction]
  }

  async calcShipmentWeightFromProductVariantIDs(
    itemIDs: string[]
  ): Promise<number> {
    const shippingBagWeight = 1
    const productVariants = await this.prisma.client.productVariants({
      where: { id_in: itemIDs },
    })
    return productVariants.reduce(function addProductWeight(acc, curProdVar) {
      return acc + curProdVar.weight
    }, shippingBagWeight)
  }

  async shippoValidateAddress(address) {
    const result = await shippo.address.create({
      ...address,
      country: "US",
      validate: true,
    })
  
    const validationResults = result.validation_results
    const isValid = result.validation_results.is_valid
    const message = validationResults?.messages?.[0]
    return {
      isValid,
      code: message?.code,
      text: message?.text,
    }
  }

  private async calcTotalRetailPriceFromProductVariantIDs(
    itemIDs: string[]
  ): Promise<number> {
    const products = await this.prisma.client.products({
      where: {
        variants_some: {
          id_in: itemIDs,
        },
      },
    })
    return products.reduce((acc, prod) => acc + prod.retailPrice, 0)
  }

  private async createShippoShipment(
    user: User,
    customer: Customer,
    shipmentWeight: number,
    insuranceAmount: number
  ): Promise<ShippoShipment[]> {
    // Create Next Cleaners Address object
    const nextCleanersAddressPrisma = await this.utilsService.getPrismaLocationFromSlug(
      process.env.SEASONS_CLEANER_LOCATION_SLUG || "seasons-cleaners-official"
    )
    const nextCleanersAddressShippo = {
      ...this.locationDataToShippoAddress(nextCleanersAddressPrisma),
      ...this.seasonsHQOrCleanersSecondaryAddressFields(),
    }

    // Create customer address object
    const customerShippingAddressPrisma = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .shippingAddress()
    const customerPhoneNumber = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .phoneNumber()
    const insureShipmentForCustomer = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .insureShipment()
    const customerAddressShippo = {
      ...this.locationDataToShippoAddress(customerShippingAddressPrisma),
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
        ...(insureShipmentForCustomer && {
          extra: {
            insurance: {
              amount: insuranceAmount.toString(),
              currency: "USD",
            },
          },
        }),
      },
      {
        address_from: customerAddressShippo,
        address_to: nextCleanersAddressShippo,
        parcels: [parcel],
        extra: { is_return: true },
      },
    ]
  }

  private async createShippingLabel(
    inputs: ShippoLabelInputs
  ): Promise<ShippoTransaction> {
    return new Promise(async (resolve, reject) => {
      const transaction = await this.shippo.transaction
        .create(inputs)
        .catch(reject)

      if (
        transaction.object_state === "VALID" &&
        transaction.status === "ERROR"
      ) {
        return reject(
          transaction.messages.reduce((acc, curVal) => {
            return `${acc}. Source: ${curVal.source}. Code: ${curVal.code}. Error Message: ${curVal.text}`
          }, "")
        )
      } else if (!transaction.label_url) {
        return reject(JSON.stringify(transaction))
      }
      return resolve(transaction)
    })
  }

  private locationDataToShippoAddress(
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

  private seasonsHQOrCleanersSecondaryAddressFields() {
    return {
      country: "US",
      phone: "706-271-7092",
      email: "reservations@seasons.nyc",
    }
  }
}
