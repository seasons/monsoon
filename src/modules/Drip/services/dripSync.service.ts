import "module-alias/register"

import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { chunk } from "lodash"

import { DripService } from "./drip.service"

@Injectable()
export class DripSyncService {
  private readonly logger = new Logger(DripSyncService.name)

  constructor(
    private readonly drip: DripService,
    private readonly prisma: PrismaService
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
        }`
    )

    const batches = chunk(customers, 500)

    this.logger.log(`Syncing ${customers.length} customers with Drip`)

    const data = {
      batches: batches.map(customerBatch => ({
        subscribers: customerBatch.map(a => ({
          id: a.id,
          email: a.user.email,
          first_name: a.user.firstName,
          last_name: a.user.lastName,
          custom_fields: {
            status: a.status,
            reservation_count: a.reservations.length,
          },
        })),
      })),
    }

    const res = await new Promise((resolve, reject) => {
      this.drip.client.updateBatchSubscribers(data, (_, req, res) => {
        // Do stuff
        if (res.errors) {
          return reject(res.errors)
        }
        resolve(res)
      })
    })

    this.logger.log("Completed sync customers with Drip")

    return res
  }
}
