import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import { ErrorService } from "@modules/Error/services/error.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PaymentPlan, Reservation } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

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
    const _reservations = await this.prisma.client2.reservation.findMany({
      where: {
        status: {
          notIn: ["Completed", "Cancelled", "Queued", "Picked", "Packed"],
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        receivedAt: true,
        status: true,
        reminderSentAt: true,
        reservationNumber: true,
        customer: {
          select: {
            user: { select: { id: true, email: true, firstName: true } },
            membership: {
              select: { plan: { select: { tier: true } } },
            },
          },
        },
      },
    })
    const reservations = this.prisma.sanitizePayload(
      _reservations,
      "Reservation"
    )
    const report = {
      reservationsForWhichRemindersWereSent: [],
      errors: [],
    }
    for (const reservation of reservations) {
      try {
        this.errorService.setExtraContext(reservation, "reservation")

        if (await this.returnNoticeNeeded(reservation as any)) {
          await this.emailService.sendReturnReminderEmail(
            reservation.customer.user
          )

          await this.pushNotifs.pushNotifyUsers({
            emails: [reservation.customer.user.email],
            pushNotifID: "ReturnDue",
          })
          await this.prisma.client2.reservation.update({
            where: { id: reservation.id },
            data: { reminderSentAt: new Date() },
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

  private async returnNoticeNeeded(
    reservation: Reservation & {
      customer: { membership: { plan: Pick<PaymentPlan, "tier"> } }
    }
  ) {
    const dueBackIn3Days = this.utils.isXDaysBefore({
      beforeDate: new Date(), // now
      afterDate: this.utils.getReservationReturnDate(reservation),
      numDays: 3,
    })
    return (
      dueBackIn3Days &&
      !reservation.reminderSentAt &&
      reservation.customer.membership.plan.tier === "Essential" &&
      !["Cancelled", "Completed"].includes(reservation.status)
    )
  }
}
