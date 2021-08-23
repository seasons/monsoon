import { PrismaService } from "@app/prisma/prisma.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Customer, ShippingCode, User } from "@prisma/client"
import { ApolloError } from "apollo-server-errors"
import { pick } from "lodash"
import shippo from "shippo"

import {
  CoreShippoAddressFields,
  ShippoRate,
  ShippoShipment,
  ShippoTransaction,
} from "../shipping.types.d"

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
    productVariantId: string,
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
    newProductVariantsBeingReserved: string[],
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

    // equality without regard for case or trailing whitespace
    const fuzzyEquals = (x: string, y: string) =>
      x?.toLowerCase().trim() === y?.toLowerCase().trim()

    const isValid = result.validation_results.is_valid

    // Shippo is very particular about how it formats street1 and street2
    // This function tries to do a "fuzzy match" between the street1/stret2
    // pair given and the pair returned in the result. It does that by
    // checking for various permutations of "fuzzy equality".
    const streetFuzzyMatches = (original, result) => {
      const performCommonShippoTranslations = x => {
        let translatedValue = !!x ? `${x}`.toLowerCase() : ""

        const replaceCommonWord = (longForm: string, shortForm: string) => {
          const lcLongForm = longForm.toLowerCase()
          const lcShortForm = shortForm.toLowerCase()
          const regex = new RegExp(` ${lcLongForm}\s?`) // space|word|optionalSpace

          const longFormMatch = translatedValue.match(regex)
          if (!!longFormMatch) {
            const spaceAfterMatch = longFormMatch[0].endsWith(" ")
            if (spaceAfterMatch) {
              translatedValue = translatedValue.replace(
                ` ${lcLongForm} `,
                ` ${lcShortForm} `
              )
            } else {
              translatedValue = translatedValue.replace(
                ` ${lcLongForm}`,
                ` ${lcShortForm}`
              )
            }
          }
        }
        replaceCommonWord("street", "st")
        replaceCommonWord("drive", "dr")
        replaceCommonWord("place", "pl")
        replaceCommonWord("avenue", "ave")
        replaceCommonWord("apt.", "apt")
        replaceCommonWord("west", "w")
        replaceCommonWord("east", "e")
        replaceCommonWord("north", "n")
        replaceCommonWord("south", "s")
        replaceCommonWord("point", "pt")
        replaceCommonWord("road", "rd")
        replaceCommonWord("st.", "st")
        replaceCommonWord("dr.", "dr")
        replaceCommonWord("pl.", "pl")
        replaceCommonWord("pt.", "pt")
        replaceCommonWord("rd.", "rd")
        replaceCommonWord("cove", "cv")
        replaceCommonWord("cv.", "cv")
        replaceCommonWord("trail", "trl")
        replaceCommonWord("trl.", "trl")
        replaceCommonWord("lane", "ln")
        replaceCommonWord("ln.", "ln")
        replaceCommonWord("terrace", "ter")
        replaceCommonWord("ter.", "ter")

        return translatedValue
      }

      const fuzzyStreetEquals = (addressStreet, resultStreet) => {
        const equalWithoutTranslations = fuzzyEquals(
          addressStreet,
          resultStreet
        )
        const equalWithTranslations = fuzzyEquals(
          performCommonShippoTranslations(addressStreet),
          resultStreet
        )

        return equalWithTranslations || equalWithoutTranslations
      }

      const basicallyEqual = fuzzyStreetEquals(address.street1, result.street1)

      const equalOnceStreetsCombined = fuzzyStreetEquals(
        `${address.street1} ${address.street2}`,
        result.street1
      )

      const equalExceptForAnApartmentQualifier =
        // No apartment qualifer in original address
        fuzzyStreetEquals(
          `${address.street1} Apt ${address.street2}`,
          result.street1
        ) ||
        fuzzyStreetEquals(
          `${address.street1} # ${address.street2}`,
          result.street1
        ) ||
        fuzzyStreetEquals(
          `${address.street1} Unit ${address.street2}`,
          result.street1
        ) ||
        // original address had something like #4b
        fuzzyStreetEquals(
          `${address.street1} ${address.street2}`
            .toLowerCase()
            .replace(" #", " unit "),
          result.street1
        ) ||
        fuzzyStreetEquals(
          `${address.street1} ${address.street2}`
            .toLowerCase()
            .replace(" #", " apt "),
          result.street1
        ) ||
        fuzzyStreetEquals(
          `${address.street1} ${address.street2}`
            .toLowerCase()
            .replace(" #", " # "),
          result.street1
        ) ||
        // original address had apt. shippo wants unit
        fuzzyStreetEquals(
          `${address.street1} ${address.street2}`
            .toLowerCase()
            .replace(" apt ", " unit "),
          result.street1
        ) ||
        // original address had unit. shippo wants apt
        fuzzyStreetEquals(
          `${address.street1} ${address.street2}`
            .toLowerCase()
            .replace(" unit ", " apt "),
          result.street1
        )

      // In some cases, the address is so edge casey that we can just let it
      // slide through shippo validation, and catch any errors at label creation
      // time. e.g if the street 2 is an entire floor "4th floor"
      const streetException = address.street2?.toLowerCase()?.endsWith("floor")

      return (
        basicallyEqual ||
        equalOnceStreetsCombined ||
        equalExceptForAnApartmentQualifier ||
        streetException
      )
    }

    const streetMatches = streetFuzzyMatches(address, result)
    const stateMatches =
      fuzzyEquals(address.state, result.state) ||
      fuzzyEquals(
        this.utilsService.abbreviateState(address.state),
        result.state
      )
    // check startsWith because shippo returns zips with extensions
    const zipMatches = result.zip.startsWith(address.zip)
    const cityMatches = fuzzyEquals(address.city, result.city)

    const needToSuggestAddress =
      !streetMatches || !cityMatches || !stateMatches || !zipMatches
    if (isValid && needToSuggestAddress) {
      // Clients rely on exact copy of error message to power
      // suggested address flow
      throw new ApolloError("Need to Suggest Address", "400", {
        suggestedAddress: pick(result, [
          "city",
          "country",
          "state",
          "street1",
          "street2",
          "zip",
        ]),
        failureMode: !streetMatches
          ? "Street mismatch"
          : !cityMatches
          ? "City mismatch"
          : !stateMatches
          ? "State mismatch"
          : !zipMatches
          ? "Zip mismatch"
          : "",
        originalAddress: address,
      })
    }
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

    const customerData = await this.prisma.client.customer.findUnique({
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
