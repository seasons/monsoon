import { Int } from "@app/prisma/prisma.binding"
import { PrismaService } from "@app/prisma/prisma.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import {
  Customer,
  Package,
  PackageDirection,
  Prisma,
  PrismaPromise,
  ShippingCode,
} from "@prisma/client"
import { ApolloError } from "apollo-server"
import cuid from "cuid"
import { pick } from "lodash"
import { merge } from "lodash"
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
  servicelevel_token: UPSServiceLevel
}

@Injectable()
export class ShippingService {
  private readonly shippo = shippo(process.env.SHIPPO_API_KEY)

  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService
  ) {}

  async getBuyUsedShippingRate(
    productVariantIds: string[],
    customer: Customer
  ) {
    return this.getShippingRateForVariantIDs(productVariantIds, { customer })
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
          shipmentType: "Outbound",
        })
      : { rate: null }

    const { rate: returnRate } = includeReturnPackage
      ? await this.getShippingRate({
          shipment: returnPackage,
          servicelevel_token: serviceLevel,
          shipmentType: "Inbound",
        })
      : { rate: null }

    return {
      sentRate,
      returnRate,
    }
  }

  async createBuyUsedShippingLabel(
    productVariantIds: string[],
    customer: Customer
  ): Promise<ShippoTransaction> {
    const shipmentWeight = await this.calcShipmentWeightFromProductVariantIDs(
      productVariantIds
    )
    const insuranceAmount = await this.calcTotalRetailPriceFromProductVariantIDs(
      productVariantIds
    )

    const [seasonsToShippoShipment] = await this.createShippoShipments({
      customer,
      shipmentWeight,
      insuranceAmount,
    })

    const seasonsToCustomerTransaction = await this.createShippingLabel({
      shipment: seasonsToShippoShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: UPSServiceLevel.Ground,
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

    let serviceLevelToken = UPSServiceLevel.Ground
    if (!!shippingCode && shippingCode === "UPSSelect") {
      serviceLevelToken = UPSServiceLevel.Select
    }

    const seasonsToCustomerTransaction =
      shippingCode === "Pickup"
        ? null
        : await this.createShippingLabel({
            shipment: seasonsToShippoShipment,
            carrier_account: process.env.UPS_ACCOUNT_ID,
            servicelevel_token: serviceLevelToken,
          })

    const customerToSeasonsTransaction = await this.createShippingLabel({
      shipment: customerToSeasonsShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: UPSServiceLevel.Ground, // Inbound should always be ground, to save customer/us money
    })

    return [seasonsToCustomerTransaction, customerToSeasonsTransaction]
  }

  async createPackages({
    bagItems,
    customer,
    select,
  }: {
    bagItems: {
      reservationPhysicalProduct: {
        physicalProduct: {
          id: string
          productVariant: {
            id: string
          }
        }
        reservation: {
          id: string
          shippingMethod: {
            code: string
          }
        }
      }
    }[]
    customer: Pick<Customer, "id">
    select?: Prisma.PackageSelect
  }): Promise<{
    promises: {
      outboundPackagePromise: Promise<Partial<Package>>
      inboundPackagePromise: Promise<Partial<Package>>
    }
    inboundPackageId: string
    outboundPackageId: string
  }> {
    if (bagItems.length === 0) {
      throw new Error("No bag items provided, cannot create packages")
    }

    const productVariantIDs = bagItems.map(a => {
      return a.reservationPhysicalProduct.physicalProduct.productVariant.id
    })

    const shipmentWeight = await this.calcShipmentWeightFromProductVariantIDs(
      productVariantIDs as string[]
    )

    const electShippingCode = () => {
      const shippingCodes = bagItems.map(
        a => a.reservationPhysicalProduct.reservation?.shippingMethod?.code
      )

      let shippingCode: ShippingCode = "UPSGround"

      if (shippingCodes.includes("Pickup")) {
        shippingCode = "Pickup"
      } else if (shippingCodes.includes("UPSSelect")) {
        shippingCode = "UPSSelect"
      }

      return shippingCode
    }

    const customerWithShippingAddress = await this.prisma.client.customer.findUnique(
      {
        where: {
          id: customer.id,
        },
        select: {
          id: true,
          detail: {
            select: {
              shippingAddress: true,
            },
          },
        },
      }
    )

    const customerShippingAddressSlug =
      customerWithShippingAddress.detail.shippingAddress.slug

    const shippingCode = electShippingCode()

    // Creates Outbound (if appropriate) and Inbound labels
    const [
      outboundLabel,
      inboundLabel,
    ] = await this.createReservationShippingLabels(
      productVariantIDs,
      customer,
      shippingCode
    )

    const outboundPackageId = outboundLabel ? cuid() : null
    const inboundPackageId = cuid()

    // Create Label and Package records
    const outboundPackagePromise =
      outboundLabel &&
      this.createPackage({
        id: outboundPackageId,
        bagItems,
        label: outboundLabel,
        shippingCode,
        shipmentWeight,
        locationSlug: customerShippingAddressSlug,
        direction: PackageDirection.Outbound,
        select: merge(select, {
          id: true,
        }),
      })

    const inboundPackagePromise = this.createPackage({
      id: inboundPackageId,
      bagItems,
      label: inboundLabel,
      shippingCode,
      shipmentWeight,
      locationSlug: customerShippingAddressSlug,
      direction: PackageDirection.Inbound,
      select: merge(select, {
        id: true,
      }),
    })

    return {
      promises: { outboundPackagePromise, inboundPackagePromise },
      inboundPackageId,
      outboundPackageId,
    }
  }

  createPackage({
    id,
    bagItems,
    label,
    shippingCode,
    shipmentWeight,
    locationSlug,
    direction,
    select,
  }: {
    id?: string
    bagItems: {
      reservationPhysicalProduct: {
        physicalProduct: {
          id: string
          productVariant: {
            id: string
          }
        }
        reservation: {
          id: string
          shippingMethod: {
            code: string
          }
        }
      }
    }[]
    label: ShippoTransaction
    shippingCode: ShippingCode
    shipmentWeight: number
    locationSlug: string
    direction: "Outbound" | "Inbound"
    select?: Prisma.PackageSelect
  }) {
    const createPartialPackageCreateInput = (
      shippoTransaction
    ): Partial<Prisma.PackageCreateInput> & { transactionID: string } => {
      return {
        transactionID: shippoTransaction.object_id,
        shippingLabel: {
          create: {
            image: shippoTransaction.label_url || "",
            trackingNumber: shippoTransaction.tracking_number || "",
            trackingURL: shippoTransaction.tracking_url_provider || "",
            name: "UPS",
          },
        },
        amount: Math.round(shippoTransaction.rate.amount * 100),
      }
    }

    const cleanersLocationSlug = process.env.SEASONS_CLEANER_LOCATION_SLUG

    return this.prisma.client.package.create({
      data: {
        id,
        ...createPartialPackageCreateInput(label),
        weight: shipmentWeight,
        ...(direction === "Outbound"
          ? {
              items: {
                connect: bagItems.map(a => ({
                  id: a.reservationPhysicalProduct.physicalProduct.id,
                })),
              },
            }
          : {}),
        fromAddress: {
          connect: {
            slug:
              direction === "Outbound" ? cleanersLocationSlug : locationSlug,
          },
        },
        toAddress: {
          connect: {
            slug:
              direction === "Outbound" ? locationSlug : cleanersLocationSlug,
          },
        },
        shippingMethod: {
          connect: {
            code: shippingCode,
          },
        },
        direction,
      },
      select: merge(select, {
        id: true,
      }),
    })
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

  async voidLabel(shipment: Pick<Package, "transactionID">) {
    return await this.shippo.refund.create({
      transaction: shipment.transactionID,
    })
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

    const streetFuzzyMatches = (original, result) => {
      const basicallyEqual = fuzzyEquals(original.street1, result.street1)
      const equalOnceStreetsCombined = fuzzyEquals(
        `${original.street1} ${original.street2}`,
        result.street1
      )
      return basicallyEqual || equalOnceStreetsCombined
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
      const suggestedAddress = {
        ...pick(result, [
          "city",
          "country",
          "state",
          "street2",
          "zip",
          "street1",
        ]),
      }
      // throw new ApolloError("Need to Suggest Address", "400", {
      //   suggestedAddress,
      //   failureMode: !streetMatches
      //     ? "Street mismatch"
      //     : !cityMatches
      //     ? "City mismatch"
      //     : !stateMatches
      //     ? "State mismatch"
      //     : !zipMatches
      //     ? "Zip mismatch"
      //     : "",
      //   originalAddress: address,
      // })
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

  discountShippingRate(
    rate: Int,
    servicelevel: "UPSGround" | "UPSSelect",
    shipmentType: "Inbound" | "Outbound"
  ) {
    let discountPercentage
    if (servicelevel === "UPSSelect") {
      discountPercentage = 0.55
    } else if (servicelevel === "UPSGround" && shipmentType === "Inbound") {
      discountPercentage = 0.38
    } else if (servicelevel === "UPSGround" && shipmentType === "Outbound") {
      discountPercentage = 0.3
    } else {
      throw new Error(
        `Unexpected servicelevel, shipment type tuple: ${servicelevel}, ${shipmentType}`
      )
    }
    return Math.round(rate * (1 - discountPercentage))
  }

  private async getShippingRate({
    shipment: shipmentInput,
    servicelevel_token,
    shipmentType,
  }: Omit<ShippoLabelInputs, "carrier_account"> & {
    shipmentType: "Inbound" | "Outbound"
  }): Promise<{
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
    const rawAmount = Math.round(
      parseFloat(((rate?.amount as unknown) as string) || "0.00") * 100
    )
    const discountedAmount = this.discountShippingRate(
      rawAmount,
      servicelevel_token === UPSServiceLevel.Ground ? "UPSGround" : "UPSSelect",
      shipmentType
    )

    return {
      rate: {
        ...rate,
        amount: discountedAmount,
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
