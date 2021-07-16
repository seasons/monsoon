import "module-alias/register"

import { ErrorService } from "@app/modules/Error/services/error.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { User } from "@app/prisma"
import { CustomerWhereInput } from "@app/prisma/prisma.binding"
import { PrismaService } from "@modules/Prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Prisma } from "@prisma/client"
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

  async syncUnsubscribesFromDrip() {
    const allUnsubscribedCustomers = await this.drip.client.listSubscribers({
      status: "unsubscribed",
    })
    const emails = allUnsubscribedCustomers.body.subscribers.map(a => a.email)
    const { count } = await this.prisma.client2.user.updateMany({
      where: { AND: [{ email: { in: emails } }, { sendSystemEmails: true }] },
      data: { sendSystemEmails: false },
    })
    return count
  }

  async syncCustomersDifferential() {
    const syncTiming = await this.utils.getSyncTimingsRecord("Drip")

    // Interested Users to Update
    const interestedUsers = await this.prisma.client2.interestedUser.findMany({
      where: { createdAt: { gte: syncTiming.syncedAt } },
      select: { email: true, zipcode: true },
    })
    const interestedUsersTurnedCustomers = (
      await this.prisma.client2.user.findMany({
        where: { email: { in: interestedUsers.map(a => a.email) } },
        select: { email: true },
      })
    ).map(b => b.email)
    const interestedUsersToUpdate = interestedUsers.filter(
      a => !interestedUsersTurnedCustomers.includes(a.email)
    )

    const result = { errors: [], successes: [] }
    for (const u of interestedUsersToUpdate) {
      try {
        await this.drip.client.createUpdateSubscriber({
          zip: u.zipcode,
          email: u.email,
        })
        result.successes.push(u.email)
      } catch (err) {
        result.errors.push(u.email)
        this.error.captureError(err)
      }
    }

    const customers = await this.getCustomersWithDripData({
      AND: [
        { user: { email: { not: { contains: "seasons.nyc" } } } },
        {
          OR: [
            { updatedAt: { gte: syncTiming.syncedAt } },
            { user: { updatedAt: { gte: syncTiming.syncedAt } } },
            { detail: { updatedAt: { gte: syncTiming.syncedAt } } },
            {
              detail: {
                shippingAddress: { updatedAt: { gte: syncTiming.syncedAt } },
              },
            },
          ],
        },
      ],
    })

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

  private async getCustomersWithDripData(
    where: Prisma.CustomerWhereInput = {}
  ) {
    const _customers = await this.prisma.client2.customer.findMany({
      where,
      select: {
        id: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            verificationStatus: true,
          },
        },
        status: true,
        reservations: { select: { status: true } },
        detail: {
          select: {
            phoneNumber: true,
            birthday: true,
            topSizes: true,
            waistSizes: true,
            preferredPronouns: true,
            style: true,
            phoneOS: true,
            shippingAddress: {
              select: {
                address1: true,
                address2: true,
                city: true,
                state: true,
                zipCode: true,
                locationType: true,
              },
            },
          },
        },
      },
    })
    return this.prisma.sanitizePayload(_customers, "Customer")
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
    await this.prisma.client2.syncTiming.create({
      data: { syncedAt: new Date(), type: "Drip" },
    })
  }
}
