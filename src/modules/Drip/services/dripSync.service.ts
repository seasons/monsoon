import "module-alias/register"

import { ErrorService } from "@app/modules/Error/services/error.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { User } from "@app/prisma"
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
    private readonly utils: UtilsService,
    private readonly error: ErrorService
  ) {}

  async syncCustomersDifferential() {
    const syncTimings = await this.getSyncTimingsRecord()

    const customers = await this.getCustomersWithDripData({
      OR: [
        { updatedAt_gte: syncTimings.dripSyncedAt },
        { user: { updatedAt_gte: syncTimings.dripSyncedAt } },
        { detail: { updatedAt_gte: syncTimings.dripSyncedAt } },
        {
          detail: {
            shippingAddress: { updatedAt_gte: syncTimings.dripSyncedAt },
          },
        },
      ],
    })
    const result = { errors: [], successes: [] }
    for (const cust of customers) {
      const sub = this.customerToDripRecord(cust)
      try {
        await this.drip.client.createUpdateSubscriber(sub)
        result.successes.push(cust.user.email)
      } catch (err) {
        result.errors.push(cust.user.email)
        this.error.setUserContext(cust.user as User)
        this.error.setExtraContext(sub, "payload")
        this.error.captureError(err)
      }
    }

    await this.updateDripSyncedAt()
    return result
  }

  async syncAllCustomers(batched = true) {
    let customers = await this.getCustomersWithDripData()
    const subscribers = customers.map(this.customerToDripRecord)
    const total = customers.length

    this.logger.log(`Syncing ${total} customers with Drip`)

    // Batch sync
    if (batched) {
      const batchSize = 1000
      const subscriberBatches = []

      for (let i = 0, j = subscribers.length; i < j; i += batchSize) {
        subscriberBatches.push(subscribers.slice(i, i + batchSize))
      }

      try {
        await Promise.all(subscriberBatches.map(this.batchUpdateSubscribers))
      } catch (err) {
        Sentry.captureException(err)
        console.log(err)
      }
    } else {
      let progressBar = this.utils
        .makeCLIProgressBar()
        .create(customers.length, 0, {
          modelName: "Customers",
        })

      for (const sub of subscribers) {
        progressBar.increment()
        try {
          await this.drip.client.createUpdateSubscriber(sub)
        } catch (err) {
          Sentry.captureException(err)
          console.log(err)
          console.log(sub)
          break
        }
      }
    }

    await this.updateDripSyncedAt()
  }

  // wrapper around the drip batch upload func
  private batchUpdateSubscribers = async (subscribers: any[]) => {
    if (subscribers.length > 1000) {
      throw new Error(
        `Subscribers with length ${subscribers.length} greater than max size 1000`
      )
    }
    return new Promise((resolve, reject) =>
      this.drip.client.updateBatchSubscribers(
        { batches: [{ subscribers }] },
        // the errors result from drip doesn't work as expected.
        (_, __, bodies) => {
          const trueErrors = bodies
            .map(a => a.errors)
            .filter(b => b !== undefined)
          if (trueErrors?.length > 0) {
            Sentry.captureException(trueErrors)
            reject(trueErrors)
          }
          resolve(bodies)
        }
      )
    )
  }

  private async getCustomersWithDripData(where: CustomerWhereInput = {}) {
    return await this.prisma.binding.query.customers(
      { where },
      `{
        id
        user {
          id
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
