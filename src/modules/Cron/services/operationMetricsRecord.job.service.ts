import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import sgMail from "@sendgrid/mail"
import chargebee from "chargebee"
import { Parser } from "json2csv"
import { head, isEmpty } from "lodash"
import moment from "moment"
import { queue } from "rxjs"

@Injectable()
export class OperationMetricsRecord {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async getOpsMetrics() {
    const queuedResProds = await this.prisma.client.reservationPhysicalProduct.groupBy(
      {
        by: ["reservationId"],
        where: {
          status: "Queued",
        },
        // select: {
        //   // id: true,
        // },
      }
    )

    const queuedResProdsCount = queuedResProds.length

    // const queuedReservations = queuedResProds.reduce((unique, resPhysProd) => { unique.includes()})
  }
}
