import "module-alias/register"

import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"

import { DripService } from "./drip.service"

@Injectable()
export class DripSyncService {
  private readonly logger = new Logger(DripSyncService.name)

  constructor(
    private readonly drip: DripService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  async syncCustomers() {
    const customers = await this.prisma.binding.query.customers(
      {},
      `{
        id
        user {
          firstName
          lastName
          email
          verificationStatus
        }
        status
        reservations {
          status
        }
        detail {
          phoneNumber
          birthday
          topSizes
          waistSizes
          preferredPronouns
          style
          phoneOS
          shippingAddress {
            address1
            address2
            city
            state
            zipCode
            locationType
          }
        }
      }`
    )

    const progressBar = this.utils
      .makeCLIProgressBar()
      .create(customers.length, 0, {
        modelName: "Customers",
      })

    this.logger.log(`Syncing ${customers.length} customers with Drip`)

    const customerToDripRecord = a => {
      const address = a.detail.shippingAddress
      const {
        phoneNumber,
        birthday,
        topSizes,
        waistSizes,
        preferredPronouns,
        style,
        phoneOS,
      } = a.detail

      const addr = !!address
        ? {
            address1: address?.address1,
            address2: address?.address2,
            city: address?.city,
            state: address?.state,
            zip: address?.zipCode,
          }
        : {}

      return {
        ...addr,
        email: a.user.email,
        first_name: a.user.firstName,
        last_name: a.user.lastName,
        phone: a.detail?.phoneNumber,
        custom_fields: {
          status: a.status,
          reservation_count: a.reservations.length,
          hasActiveReservation:
            a.reservations.filter(a => a.status === "Received").length > 0,
          phoneNumber,
          birthday,
          topSizes,
          waistSizes,
          preferredPronouns,
          style,
          phoneOS,
        },
      }
    }

    try {
      const results = await Promise.all(
        customers.map(async customer => {
          progressBar.increment()
          return await this.drip.client.createUpdateSubscriber(
            customerToDripRecord(customer)
          )
        })
      )
      return results
    } catch (err) {
      console.error(err)
    }

    this.logger.log("Completed sync customers with Drip")
  }
}
