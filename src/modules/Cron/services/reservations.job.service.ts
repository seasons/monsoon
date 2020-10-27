import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Reservation as ClientReservation } from "@app/prisma/index"
import { Reservation } from "@app/prisma/prisma.binding"
import { EmailService } from "@modules/Email/services/email.service"
import { ErrorService } from "@modules/Error/services/error.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PrismaService } from "@prisma/prisma.service"
import moment from "moment"

@Injectable()
export class ReservationScheduledJobs {
  private readonly logger = new Logger(ReservationScheduledJobs.name)

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly pushNotifs: PushNotificationService,
    private readonly utils: UtilsService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async sendReturnNotifications() {
    this.logger.log("Reservation Return Notifications Job ran")
    const reservations = await this.prisma.binding.query.reservations(
      {
        orderBy: "createdAt_DESC",
      },
      `{
      id
      createdAt
      receivedAt
      status
      reminderSentAt
      customer {
        user {
          id
          email
          firstName
        }
        membership {
          plan {
            tier
          }
        }
      }
    }`
    )
    const report = {
      reservationsForWhichRemindersWereSent: [],
      errors: [],
    }
    for (const reservation of reservations) {
      try {
        this.errorService.setExtraContext(reservation, "reservation")

        if (await this.returnNoticeNeeded(reservation)) {
          await this.emailService.sendReturnReminderEmail(
            reservation.customer.user,
            reservation as ClientReservation
          )

          const now = new Date()
          await this.pushNotifs.pushNotifyUser({
            email: reservation.customer.user.email,
            pushNotifID: "ReturnDue",
          })
          await this.prisma.client.updateReservation({
            where: { id: reservation.id },
            data: { reminderSentAt: now.toISOString() },
          })

          report.reservationsForWhichRemindersWereSent.push(
            reservation.reservationNumber
          )
        }
      } catch (err) {
        report.errors.push(err)
        this.errorService.captureError(err)
      }
    }

    this.logger.log("Reservation Return Notifications Job results:")
    this.logger.log(report)
  }

  private async returnNoticeNeeded(reservation: Reservation) {
    return (
      this.utils.isXDaysBefore({
        beforeDate: this.utils.getReservationReturnDate(
          reservation as ClientReservation
        ),
        // now
        afterDate: new Date(),
        numDays: 3,
      }) &&
      !reservation.reminderSentAt &&
      reservation.customer.membership.plan.tier === "Essential" &&
      !["Cancelled", "Completed"].includes(reservation.status)
    )
  }
}
