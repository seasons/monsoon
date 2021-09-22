import { PrismaService } from "@app/prisma/prisma.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Customer, ShippingCode, User } from "@prisma/client"
import shippo from "shippo"

import {
  CoreShippoAddressFields,
  ShippoRate,
  ShippoShipment,
  ShippoTransaction,
} from "../shipping.types.d"

export enum UPSServiceLevel {
  Ground = "ups_ground",
  Select = "ups_3_day_select",
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

  async getBuyUsedShippingRate(productVariantId: string, customer: Customer) {
    return this.getShippingRateForVariantIDs([productVariantId], { customer })
  }

  async getShippingRateForVariantIDs(
    ids: string[],
    options: {
      customer: Pick<Customer, "id">
      serviceLevel?: UPSServiceLevel
      includeSentPackage?: boolean
      includeReturnPackage?: boolean
    }
  ): Promise<{ sentRate: ShippoRate | null; returnRate: ShippoRate | null }> {
    const {
      customer,
      serviceLevel = UPSServiceLevel.Ground,
      includeSentPackage = true,
      includeReturnPackage = true,
    } = options

    // TODO: do these values change, as we're not shipping in seasons bags?
    const shipmentWeight = await this.calcShipmentWeightFromProductVariantIDs(
      ids
    )
    const insuranceAmount = await this.calcTotalRetailPriceFromProductVariantIDs(
      ids
    )

    const [sentPackage, returnPackage] = await this.createShippoShipments({
      customer,
      shipmentWeight,
      insuranceAmount,
    })

    const { rate: sentRate } = includeSentPackage
      ? await this.getShippingRate({
          shipment: sentPackage,
          servicelevel_token: serviceLevel,
        })
      : { rate: null }

    const { rate: returnRate } = includeReturnPackage
      ? await this.getShippingRate({
          shipment: returnPackage,
          servicelevel_token: serviceLevel,
        })
      : { rate: null }

    return {
      sentRate,
      returnRate,
    }
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

    const [seasonsToShippoShipment] = await this.createShippoShipments({
      customer,
      shipmentWeight,
      insuranceAmount,
    })

    const seasonsToCustomerTransaction = await this.createShippingLabel({
      shipment: seasonsToShippoShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: "ups_ground",
    })

    return seasonsToCustomerTransaction
  }

  async createReservationShippingLabels(
    newProductVariantsBeingReserved: string[],
    customer: Pick<Customer, "id">,
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
    ] = await this.createShippoShipments({
      customer,
      shipmentWeight,
      insuranceAmount,
    })

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
    const productVariants = await this.prisma.client.productVariant.findMany({
      where: { id: { in: itemIDs } },
      select: { weight: true },
    })
    return productVariants.reduce((acc, curProdVar) => {
      return acc + curProdVar.weight
    }, shippingBagWeight)
  }

  async shippoValidateAddress(address: CoreShippoAddressFields) {
    const result = await this.shippo.address.create({
      ...address,
      country: "US",
      validate: true,
    })

    const validationResults = result.validation_results

    // Patchwork case for invalid city/state/zip combo, pending
    // response from shippo about why their validator doesn't properly
    // handle this case
    const isValid = result.validation_results.is_valid
    const streetMatches =
      address.street1 === result.street1 ||
      `${address.street1} ${address.street2}` === result.street1

    const needToSuggestAddress =
      !streetMatches ||
      address.city !== result.city ||
      address.state !== result.state ||
      // check startsWith because shippo returns zips with extensions
      !result.zip.startsWith(address.zip)
    // FIXME: Turn off error for now until we fix existing accounts and harvest supports error
    // if (isValid && needToSuggestAddress) {
    //   // Clients rely on exact copy of error message to power
    //   // suggested address flow
    //   throw new ApolloError("Need to Suggest Address", "400", {
    //     suggestedAddress: pick(result, [
    //       "city",
    //       "country",
    //       "state",
    //       "street1",
    //       "street2",
    //       "zip",
    //     ]),
    //   })
    // }
    const message = validationResults?.messages?.[0]

    return {
      isValid,
      code: message?.code,
      text: message?.text,
    }
  }

  async validateAddress(input) {
    const { location } = input

    const shippoAddress = this.locationDataToShippoAddress(location)
    return await this.shippoValidateAddress({
      ...shippoAddress,
      name: location.name,
    })
  }

  private async calcTotalRetailPriceFromProductVariantIDs(
    itemIDs: string[]
  ): Promise<number> {
    const products = await this.prisma.client.product.findMany({
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

  private async createShippoShipments({
    customer,
    shipmentWeight,
    insuranceAmount,
  }: {
    customer: Pick<Customer, "id">
    shipmentWeight: number
    insuranceAmount: number
  }): Promise<ShippoShipment[]> {
    // Create Next Cleaners Address object
    const nextCleanersAddressPrisma = await this.utilsService.getPrismaLocationFromSlug(
      process.env.SEASONS_CLEANER_LOCATION_SLUG || "seasons-cleaners-official"
    )
    const nextCleanersAddressShippo = {
      ...this.locationDataToShippoAddress(nextCleanersAddressPrisma),
      ...this.seasonsHQOrCleanersSecondaryAddressFields(),
    }

    // Create customer address object
    const customerData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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

    const user = customerData.user
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

    const sentPackage = {
      ...shipmentBase,
      ...(insureShipmentForCustomer && {
        extra: {
          insurance: {
            amount: insuranceAmount.toString(),
            currency: "USD",
          },
        },
      }),
    }

    const returnPackage = {
      ...shipmentBase,
      extra: { is_return: true },
    }

    return [sentPackage, returnPackage]
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

    // We'll want to pull that number dynamically from the Shippo API once it's fixed
    const discountPercentage = 0.58

    return {
      rate: {
        ...rate,
        amount:
          parseFloat(((rate?.amount as unknown) as string) || "0.00") *
          100 *
          discountPercentage,
      },
      shipmentId: shipment.object_id,
    }
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

  locationDataToShippoAddress(location): CoreShippoAddressFields {
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
