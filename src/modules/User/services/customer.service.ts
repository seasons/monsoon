import { Injectable } from "@nestjs/common"
import { User, CustomerStatus } from "../../../prisma"
import { PrismaClientService } from "../../../prisma/client.service"
import { AuthService } from "./auth.service"
import { DBService } from "../../../prisma/db.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { ShippingService } from "../../Shipping/services/shipping.service"
import zipcodes from "zipcodes"

@Injectable()
export class CustomerService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly authService: AuthService,
    private readonly db: DBService,
    private readonly prisma: PrismaClientService,
    private readonly shippingService: ShippingService,
  ) { }

  private async setCustomerPrismaStatus(
    user: User,
    status: CustomerStatus
  ) {
    const customer = await this.authService.getCustomerFromUserID(user.id)
    await this.prisma.client.updateCustomer({
      // @ts-ignore
      data: { status },
      where: { id: customer.id },
    })
  }

  async addCustomerDetails({ details, status }, customer, user, info) {
    const currentCustomerDetail = await this.prisma.client
      .customer({ id: customer.id })
      .detail()

    await this.prisma.client.updateCustomer({
      data: {
        detail: {
          upsert: {
            update: details,
            create: details
          }
        }
      },
      where: { id: customer.id },
    })

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await this.setCustomerPrismaStatus(user, status)
    }

    // Sync with airtable
    await this.airtableService.createOrUpdateAirtableUser(user, {
      ...currentCustomerDetail,
      ...details,
      status,
    })

    // Return the updated customer object
    const returnData = await this.db.query.customer(
      { where: { id: customer.id } },
      info
    )
    return returnData
  }

  async updateCustomerDetail(user, customer, shippingAddress, phoneNumber) {
    const {
      city: shippingCity,
      postalCode: shippingPostalCode,
      state: shippingState,
      street1: shippingStreet1,
      street2: shippingStreet2
    } = shippingAddress
    const { isValid: shippingAddressIsValid } = await this.shippingService.shippoValidateAddress({
      name: user.firstName,
      street1: shippingStreet1,
      city: shippingCity,
      state: shippingState,
      zip: shippingPostalCode
    })
    if (!shippingAddressIsValid) {
      throw new Error("Shipping address is invalid")
    }

    const zipcodesData = zipcodes.lookup(parseInt(shippingPostalCode))
    const validCities = ["Brooklyn", "New York", "Queens", "The Bronx"]
    if (zipcodesData?.state !== "NY" || !validCities.includes(zipcodesData?.city)) {
      throw new Error("SHIPPING_ADDRESS_NOT_NYC")
    }

    // Update the user's shipping address
    const detailID = await this.prisma.client.customer({ id: customer.id })
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
      const shippingAddressID = await this.prisma.client.customer({ id: customer.id })
        .detail()
        .shippingAddress()
        .id()
      const shippingAddress = await this.prisma.client.upsertLocation({
        create: shippingAddressData,
        update: shippingAddressData,
        where: { id: shippingAddressID }
      })
      if (shippingAddress) {
        await this.prisma.client.updateCustomerDetail({
          data: {
            phoneNumber,
            shippingAddress: { connect: { id: shippingAddress.id } }
          },
          where: { id: detailID }
        })
      }
    } else {
      await this.prisma.client.updateCustomer({
        data: {
          detail: {
            create: {
              phoneNumber,
              shippingAddress: {
                create: shippingAddressData
              }
            }
          }
        },
        where: { id: customer.id }
      })
    }
  }
}
