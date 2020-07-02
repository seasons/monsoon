import { SyncError } from "@app/errors"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { UtilsService } from "@app/modules/Utils"
import {
  AirtableInventoryStatus,
  AirtableProductVariantCounts,
} from "@modules/Airtable/airtable.types"
import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { EmailService } from "@modules/Email/services/email.service"
import { ErrorService } from "@modules/Error/services/error.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InventoryStatus, ProductVariant, Reservation } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import { head } from "lodash"
import moment from "moment"

@Injectable()
export class PaymentScheduledJobs {
  private readonly logger = new Logger(PaymentScheduledJobs.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly utils: UtilsService
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async updatePlans() {
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })

    const plans = []
    const result = await chargebee.plan.list().request()
    const plansResults = result?.list || []
    const activePlans = plansResults.filter(
      result => result.plan.status === "active"
    )
    activePlans.forEach(activePlan => {
      plans.push({
        description: activePlan.plan.description,
        id: activePlan.plan.id,
        name: activePlan.plan.name,
        price: activePlan.plan.price,
      })
    })

    this.logger.log("Update plan job ran")

    // this.logger.log("Update plan job results:")
    // this.logger.log(report)
  }
}
