import { PrismaService } from "@modules/Prisma/prisma.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Customer, User } from "@prisma/client"
import { Location } from "@prisma/client"
import { ID_Input, ShippingCode } from "@prisma1/index"
import shippo from "shippo"

import {
  ShippoRate,
  ShippoShipment,
  ShippoTransaction,
} from "../shipping.types"

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
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService
  ) {}

  async getBuyUsedShippingRate(
    productVariantId: ID_Input,
    user: User,
    customer: Customer
  ): Promise<ShippoRate> {
    // TODO: do these values change, as we're not shipping in seasons bags?
    const shipmentWeight = await this.calcShipmentWeightFromProductVariantIDs([
      productVariantId,
    ] as string[])
    const insuranceAmount = await this.calcTotalRetailPriceFromProductVariantIDs(
      [productVariantId] as string[]
    )

    const [seasonsToShippoShipment] = await this.createShippoShipment(
      user,
      customer,
      shipmentWeight,
      insuranceAmount
    )

    const shipping = await this.getShippingRate({
      shipment: seasonsToShippoShipment,
      servicelevel_token: "ups_ground",
    })

    return shipping.rate
  }

  async createBuyUsedShippingLabel(
    productVariantId: string,
    user: User,
    customer: Customer
  ): Promise<ShippoTransaction> {
    const shipmentWeight = await this.calcShipmentWeightFromProductVariantIDs([
      productVariantId,
    ] as string[])
    const insuranceAmount = await this.calcTotalRetailPriceFromProductVariantIDs(
      [productVariantId] as string[]
    )

    const [seasonsToShippoShipment] = await this.createShippoShipment(
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

    return seasonsToCustomerTransaction
  }

  async createReservationShippingLabels(
    newProductVariantsBeingReserved: ID_Input[],
    user: User,
    customer: Customer,
    shippingCode: ShippingCode
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

    let serviceLevelToken = "ups_ground"
    if (!!shippingCode && shippingCode === "UPSSelect") {
      serviceLevelToken = "ups_3_day_select"
    }

    const seasonsToCustomerTransaction = await this.createShippingLabel({
      shipment: seasonsToShippoShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: serviceLevelToken,
    })
    const customerToSeasonsTransaction = await this.createShippingLabel({
      shipment: customerToSeasonsShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: serviceLevelToken,
    })

    return [seasonsToCustomerTransaction, customerToSeasonsTransaction]
  }

  async calcShipmentWeightFromProductVariantIDs(
    itemIDs: string[]
  ): Promise<number> {
    const shippingBagWeight = 1
    const productVariants = await this.prisma.client2.productVariant.findMany({
      where: { id: { in: itemIDs } },
      select: { weight: true },
    })
    return productVariants.reduce((acc, curProdVar) => {
      return acc + curProdVar.weight
    }, shippingBagWeight)
  }

  async shippoValidateAddress(address) {
    const result = await this.shippo.address.create({
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

  async validateAddress(input) {
    const { email, location } = input

    const shippoAddress = this.locationDataToShippoAddress(location)
    return await this.shippoValidateAddress({
      ...shippoAddress,
      email,
      name: location.name,
    })
  }

  private async calcTotalRetailPriceFromProductVariantIDs(
    itemIDs: string[]
  ): Promise<number> {
    const products = await this.prisma.client2.product.findMany({
      where: {
        variants: {
          some: {
            id: { in: itemIDs },
          },
        },
      },
      select: { retailPrice: true },
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

    const customerData = await this.prisma.client2.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        detail: {
          select: {
            shippingAddress: true,
            id: true,
            phoneNumber: true,
            insureShipment: true,
          },
        },
      },
    })
    const customerShippingAddressPrisma = customerData.detail.shippingAddress
    const insureShipmentForCustomer = customerData.detail.insureShipment

    const customerAddressShippo = {
      ...this.locationDataToShippoAddress(customerShippingAddressPrisma),
      name: `${user.firstName} ${user.lastName}`,
      phone: customerData.detail.phoneNumber,
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

    const shipmentBase = {
      address_from: nextCleanersAddressShippo,
      address_to: customerAddressShippo,
      parcels: [parcel],
    }
    return [
      {
        ...shipmentBase,
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
        ...shipmentBase,
        extra: { is_return: true },
      },
    ]
  }

  private async getShippingRate({
    shipment: shipmentInput,
    servicelevel_token,
  }: Omit<ShippoLabelInputs, "carrier_account">): Promise<{
    rate: ShippoRate
    shipmentId: string
  }> {
    const shipment: ShippoShipment = await this.shippo.shipment.create({
      ...shipmentInput,
      async: false,
    })

    const rate = shipment.rates.find(rate => {
      return rate.servicelevel.token === servicelevel_token
    })

    return { rate, shipmentId: shipment.object_id }
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

  private locationDataToShippoAddress(location): CoreShippoAddressFields {
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
