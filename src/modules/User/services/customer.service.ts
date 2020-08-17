import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  BillingInfoUpdateDataInput,
  CustomerStatus,
  CustomerWhereUniqueInput,
  ID_Input,
  User,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"
import { ApolloError } from "apollo-server"

import { AdmissionsService } from "./admissions.service"
import { AuthService } from "./auth.service"

type TriageCustomerResult = "Waitlisted" | "Authorized"

@Injectable()
export class CustomerService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly admissions: AdmissionsService
  ) {}

  async setCustomerPrismaStatus(user: User, status: CustomerStatus) {
    const customer = await this.authService.getCustomerFromUserID(user.id)
    await this.prisma.client.updateCustomer({
      data: { status },
      where: { id: customer.id },
    })
  }

  async addCustomerDetails({ details, status }, customer, user, info) {
    // If any of these keys is present, the entire address must be present and valid.
    const groupedKeys = ["name", "address1", "address2", "city", "state"]
    if (
      details.shippingAddress?.create &&
      Object.keys(details.shippingAddress?.create)?.some(key =>
        groupedKeys.includes(key)
      )
    ) {
      const {
        name,
        address1: street1,
        city,
        state,
        zipCode: zip,
      } = details.shippingAddress.create
      if (!(name && street1 && city && state && zip)) {
        throw new Error(
          "Missing a required field. Expected name, address1, city, state, and zipCode."
        )
      }
      const {
        isValid: shippingAddressIsValid,
      } = await this.shippingService.shippoValidateAddress({
        name,
        street1,
        city,
        state,
        zip,
      })
      if (!shippingAddressIsValid) {
        throw new Error("Shipping address is invalid")
      }
    }

    await this.prisma.client.updateCustomer({
      data: {
        detail: {
          upsert: {
            update: details,
            create: details,
          },
        },
      },
      where: { id: customer.id },
    })

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await this.setCustomerPrismaStatus(user, status)
    }

    // Return the updated customer object
    return await this.prisma.binding.query.customer(
      { where: { id: customer.id } },
      info
    )
  }

  async updateCustomerDetail(user, customer, shippingAddress, phoneNumber) {
    const {
      city: shippingCity,
      postalCode: shippingPostalCode,
      state: shippingState,
      street1: shippingStreet1,
      street2: shippingStreet2,
    } = shippingAddress
    const {
      isValid: shippingAddressIsValid,
    } = await this.shippingService.shippoValidateAddress({
      name: user.firstName,
      street1: shippingStreet1,
      city: shippingCity,
      state: shippingState,
      zip: shippingPostalCode,
    })
    if (!shippingAddressIsValid) {
      throw new Error("Shipping address is invalid")
    }

    // Update the user's shipping address
    const detailID = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .id()
    const shippingAddressData = {
      slug: `${user.firstName}-${user.lastName}-shipping-address`,
      name: `${user.firstName} ${user.lastName}`,
      city: shippingCity,
      zipCode: shippingPostalCode,
      state: shippingState,
      address1: shippingStreet1,
      address2: shippingStreet2,
    }
    if (detailID) {
      const shippingAddressID = await this.prisma.client
        .customer({ id: customer.id })
        .detail()
        .shippingAddress()
        .id()
      const shippingAddress = await this.prisma.client.upsertLocation({
        create: shippingAddressData,
        update: shippingAddressData,
        where: { id: shippingAddressID },
      })
      if (shippingAddress) {
        await this.prisma.client.updateCustomerDetail({
          data: {
            phoneNumber,
            shippingAddress: { connect: { id: shippingAddress.id } },
          },
          where: { id: detailID },
        })
      }
    } else {
      await this.prisma.client.updateCustomer({
        data: {
          detail: {
            create: {
              phoneNumber,
              shippingAddress: {
                create: shippingAddressData,
              },
            },
          },
        },
        where: { id: customer.id },
      })
    }

    return await this.prisma.client.customer({ id: customer.id })
  }

  async updateCustomerBillingInfo({
    billingInfo,
    customerId,
  }: {
    billingInfo: BillingInfoUpdateDataInput
    customerId: ID_Input
  }) {
    const billingInfoId = await this.prisma.client
      .customer({ id: customerId })
      .billingInfo()
      .id()
    if (billingInfoId) {
      await this.prisma.client.updateBillingInfo({
        data: billingInfo,
        where: { id: billingInfoId },
      })
    }
  }

  async triageCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<TriageCustomerResult> {
    const customer = await this.prisma.binding.query.customer(
      { where },
      `{
        status
        detail {
          shippingAddress {
            zipCode
          }
          topSizes
          waistSizes
        }
      }`
    )

    if (!["Created", "Invited"].includes(customer.status)) {
      throw new ApolloError(
        `Invalid customer status: ${customer.status}. Can only triage an "Invited" or "Created" customer`
      )
    }

    let status = "Waitlisted" as TriageCustomerResult
    try {
      if (
        process.env.AUTOMATIC_ADMISSIONS === "true" &&
        this.admissions.zipcodeAllowed(
          customer.detail.shippingAddress.zipCode
        ) &&
        (await this.admissions.belowWeeklyNewActiveUsersOpsThreshold()) &&
        (await this.admissions.haveSufficientInventoryToServiceCustomer(where))
      ) {
        status = "Authorized"
      }
    } catch (err) {
      Sentry.captureException(err)
    }

    await this.prisma.client.updateCustomer({
      where,
      data: { status },
    })
    return status
  }
}
