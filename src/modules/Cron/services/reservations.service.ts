import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as Sentry from "@sentry/node"
import { PrismaClientService } from '../../../prisma/client.service'
import { EmailService } from '../../Email/services/email.service'
import { DateTime, Interval } from 'luxon'
import { Reservation } from '../../../prisma'

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name)

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaClientService
  ) {}

  // TODO: Handle 1 minute timeout (if necessary)
  @Cron(CronExpression.EVERY_MINUTE)
  async sendReturnNotifications() {
    const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"
    const reservations = await this.prisma.client.reservations({
      orderBy: "createdAt_DESC",
    })
    const report = {
      reservationsForWhichRemindersWereSent: [],
      errors: [],
    }
    for (const reservation of reservations) {
      try {
        if (shouldReportErrorsToSentry) {
          Sentry.configureScope(scope => {
            scope.setExtra("reservationNumber", reservation.reservationNumber)
            scope.setExtra("reservation createdAt", reservation.createdAt)
            scope.setExtra("reservation status", reservation.status)
          })
        }
        if (await this.returnNoticeNeeded(reservation)) {
          //   Remind customer to return items
          const user = await this.prisma.client
            .reservation({
              id: reservation.id,
            })
            .customer()
            .user()
  
          this.emailService.sendReturnReminderEmail(user, reservation)
  
          await this.prisma.client.updateReservation({
            where: { id: reservation.id },
            data: { reminderSentAt: DateTime.local().toString() },
          })
  
          report.reservationsForWhichRemindersWereSent.push(
            reservation.reservationNumber
          )
        }
      } catch (err) {
        report.errors.push(err)
        if (shouldReportErrorsToSentry) {
          Sentry.captureException(err)
        }
      }
    }
  
    this.logger.log(report)
  }

  private async returnNoticeNeeded(reservation: Reservation) {
    const now = DateTime.local()
    const reservationCreatedAt = DateTime.fromISO(reservation.createdAt)
    const twentyEightToTwentyNineDaysAgo = Interval.fromDateTimes(
      now.minus({ days: 29 }),
      now.minus({ days: 28 })
    )
    const customer = await this.prisma.client
      .reservation({
        id: reservation.id,
      })
      .customer()
  
    return (
      twentyEightToTwentyNineDaysAgo.contains(reservationCreatedAt) &&
      !reservation.reminderSentAt &&
      customer.plan === "Essential" &&
      !["Cancelled", "Completed"].includes(reservation.status)
    )
  }
  
}