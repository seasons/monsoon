import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import { ErrorService } from "@modules/Error/services/error.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Reservation } from "@prisma/index"
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
    const reservations = await this.prisma.client.reservations({
      orderBy: "createdAt_DESC",
    })
    const report = {
      reservationsForWhichRemindersWereSent: [],
      errors: [],
    }
    for (const reservation of reservations) {
      try {
        this.errorService.setExtraContext(reservation, "reservation")

        if (await this.returnNoticeNeeded(reservation)) {
          const user = await this.prisma.client
            .reservation({
              id: reservation.id,
            })
            .customer()
            .user()

          await this.emailService.sendReturnReminderEmail(user, reservation)

          const now = new Date()
          await this.pushNotifs.pushNotifyUser({
            email: user.email,
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
    const tier = await this.prisma.client
      .reservation({
        id: reservation.id,
      })
      .customer()
      .membership()
      .plan()
      .tier()
    const reservationCreatedAt = moment(reservation.createdAt)
    return (
      this.utils.isXDaysBefore({
        beforeDate: new Date(
          reservationCreatedAt.year(),
          reservationCreatedAt.month(),
          reservationCreatedAt.date()
        ),
        // now
        afterDate: new Date(),
        numDays: 27,
      }) &&
      !reservation.reminderSentAt &&
      tier === "Essential" &&
      !["Cancelled", "Completed"].includes(reservation.status)
    )
  }
}
