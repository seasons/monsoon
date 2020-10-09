import "module-alias/register"

import * as util from "util"

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
      console.log(`updating cust: ${cust.user.email}`)
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

  // TODO: Rewrite this to use the batch API. AS IS, we may hit the 3600 requests per hour rate limit
  async syncAllCustomers(batched = true) {
    let customers = await this.getCustomersWithDripData()

    const total = customers.length
    this.logger.log(`Syncing ${total} customers with Drip`)

    // Batch sync
    if (batched) {
      let sliceLimit = 1000
      let batchIndex = 0
      const batches = []
      while (customers.length + 1000 > sliceLimit) {
        batches[batchIndex++] = [
          {
            subscribers: customers
              .slice(sliceLimit - 1000, sliceLimit)
              .map(this.customerToDripRecord),
          },
        ]
        sliceLimit = sliceLimit + 1000
      }

      const payload = { batches }
      const prom = new Promise((resolve, reject) => {
        this.drip.client.updateBatchSubscribers(
          payload,
          (errors, responses, bodies) => {
            if (!!bodies?.[0].errors) {
              console.log(bodies[0].errors)
              Sentry.captureException(bodies[0].errors)
              reject(bodies[0].errors)
            }
            resolve(bodies)
          }
        )
      })
      await prom
    } else {
      let progressBar = this.utils
        .makeCLIProgressBar()
        .create(customers.length, 0, {
          modelName: "Customers",
        })

      for (const cust of customers) {
        progressBar.increment()
        try {
          await this.drip.client.createUpdateSubscriber(
            this.customerToDripRecord(cust)
          )
        } catch (err) {
          Sentry.captureException(err)
          console.log(err)
          console.log(this.customerToDripRecord(cust))
          break
        }
      }
    }

    console.log(`success!`)
    await this.updateDripSyncedAt()
  }

  private async getCustomersWithDripData(where: CustomerWhereInput = {}) {
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
    const address = customer.detail?.shippingAddress
    const {
      birthday,
      topSizes,
      waistSizes,
      preferredPronouns,
      style,
      phoneOS,
    } = customer.detail || {}

    let addr = {}
    if (!!address) {
      addr = {
        city: address?.city || "",
        state: address?.state || "",
        zip: address?.zipCode || "",
      }
      if (!!address.address1) {
        addr = {
          ...addr,
          address1: address?.address1 || "",
          address2: address?.address2 || "",
        }
      }
    }

    const payload = {
      ...addr,
      email: customer.user.email,
      first_name: customer.user.firstName,
      last_name: customer.user.lastName,
      phone: customer.detail?.phoneNumber || "",
      custom_fields: {
        status: customer.status,
        reservation_count: customer.reservations.length,
        hasActiveReservation:
          customer.reservations.filter(a => a.status === "Delivered").length >
          0,
        birthday,
        topSizes,
        waistSizes,
        preferredPronouns,
        style,
        phoneOS,
      },
    }
    return payload
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
