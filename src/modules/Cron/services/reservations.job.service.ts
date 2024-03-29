import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import { ErrorService } from "@modules/Error/services/error.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PaymentPlan, Reservation } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { DateTime } from "luxon"

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
  async setAtHomeReservationPhysicalProducts() {
    this.logger.log(
      "Reservation Set At home Reservation Physical Products Job ran"
    )
    const rpps = await this.prisma.client.reservationPhysicalProduct.findMany({
      where: {
        status: "DeliveredToCustomer",
      },
      select: {
        id: true,
        deliveredToCustomerAt: true,
      },
    })

    const report = {
      reservationPhysicalProductsUpdated: [],
      errors: [],
    }

    for (const rpp of rpps) {
      try {
        const updatedMoreThan24HoursAgo = this.checkIfDeliveredMoreThan24HoursAgo(
          rpp
        )
        if (updatedMoreThan24HoursAgo) {
          report.reservationPhysicalProductsUpdated.push(rpp.id)
        }
      } catch (err) {
        console.error(err)
      }
    }

    try {
      if (report.reservationPhysicalProductsUpdated.length > 0) {
        await this.prisma.client.reservationPhysicalProduct.updateMany({
          where: {
            id: {
              in: report.reservationPhysicalProductsUpdated,
            },
          },
          data: {
            status: "AtHome",
          },
        })
      }
    } catch (e) {
      report.errors.push(e)
      this.errorService.captureError(e)
    }

    this.logger.log("Set AtHome reservation physical products results:")
    this.logger.log(report)
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async sendReturnNotifications() {
    this.logger.log("Reservation Return Notifications Job ran")
    const reservations = await this.prisma.client.reservation.findMany({
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
          await this.prisma.client.reservation.update({
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

  private checkIfDeliveredMoreThan24HoursAgo = rpp => {
    if (!rpp?.deliveredToCustomerAt) {
      return false
    }

    const date = rpp?.deliveredToCustomerAt?.toISOString()
    return (
      // @ts-ignore
      DateTime.fromISO(date).diffNow("days")?.values?.days <= -1
    )
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
