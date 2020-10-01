import "module-alias/register"

import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { CustomerWhereInput } from "@app/prisma/prisma.binding"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import { head } from "lodash"

import { DripService } from "./drip.service"

@Injectable()
export class DripSyncService {
  private readonly logger = new Logger(DripSyncService.name)

  constructor(
    private readonly drip: DripService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  async syncCustomersDifferential() {
    const syncTimings = await this.getSyncTimingsRecord()

    const customers = await this.getCustomersWithDripData({
      updatedAt_gte: syncTimings.dripSyncedAt,
    })
    for (const cust of customers) {
      try {
        await this.drip.client.createUpdateSubscriber(
          this.customerToDripRecord(cust)
        )
      } catch (err) {
        Sentry.captureException(err)
      }
    }

    await this.updateDripSyncedAt()
  }

  async syncAllCustomers(withProgressBar = true) {
    const customers = await this.getCustomersWithDripData({})

    let progressBar
    if (withProgressBar) {
      progressBar = this.utils
        .makeCLIProgressBar()
        .create(customers.length, 0, {
          modelName: "Customers",
        })
    }

    this.logger.log(`Syncing ${customers.length} customers with Drip`)

    try {
      const results = await Promise.all(
        customers.map(async customer => {
          if (withProgressBar) {
            progressBar.increment()
          }
          return await this.drip.client.createUpdateSubscriber(
            this.customerToDripRecord(customer)
          )
        })
      )
      return results
    } catch (err) {
      console.error(err)
      Sentry.captureException(err)
    }

    await this.updateDripSyncedAt()
    this.logger.log("Completed sync customers with Drip")
  }

  private async getCustomersWithDripData(where: CustomerWhereInput) {
    return await this.prisma.binding.query.customers(
      { where },
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
  }

  private customerToDripRecord(customer: any) {
    const address = customer.detail.shippingAddress
    const {
      phoneNumber,
      birthday,
      topSizes,
      waistSizes,
      preferredPronouns,
      style,
      phoneOS,
    } = customer.detail

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
      email: customer.user.email,
      first_name: customer.user.firstName,
      last_name: customer.user.lastName,
      phone: customer.detail?.phoneNumber,
      custom_fields: {
        status: customer.status,
        reservation_count: customer.reservations.length,
        hasActiveReservation:
          customer.reservations.filter(a => a.status === "Received").length > 0,
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

  private async updateDripSyncedAt() {
    const syncTimings = await this.getSyncTimingsRecord()
    await this.prisma.client.updateSyncTiming({
      where: { id: syncTimings.id },
      data: { dripSyncedAt: new Date() },
    })
  }

  private async getSyncTimingsRecord() {
    const syncTimings = await this.prisma.client.syncTimings({})
    if (syncTimings.length !== 1) {
      throw new Error(
        `SyncTimings table has ${syncTimings.length} records. Should have exactly 1`
      )
    }

    return head(syncTimings)
  }
}
