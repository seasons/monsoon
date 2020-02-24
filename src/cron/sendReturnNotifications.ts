import { prisma, Reservation } from "../prisma"
import { DateTime, Interval } from "luxon"
import { sendTransactionalEmail } from "../sendTransactionalEmail"
import { emails } from "../emails"
import { formatReservationReturnDate } from "../resolvers/Product/formatReservationReturnDate"
import * as Sentry from "@sentry/node"

const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

if (shouldReportErrorsToSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

export const sendReturnNotifications = async () => {
  const reservations = await prisma.reservations({
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
      if (await returnNoticeNeeded(reservation)) {
        //   Remind customer to return items
        const user = await prisma
          .reservation({
            id: reservation.id,
          })
          .customer()
          .user()

        sendTransactionalEmail({
          to: user.email,
          data: emails.returnReminderData({
            name: user.firstName,
            returnDate: formatReservationReturnDate(
              new Date(reservation.createdAt)
            ),
          }),
        })

        await prisma.updateReservation({
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

  console.log(report)
  return report
}

const returnNoticeNeeded = async (reservation: Reservation) => {
  const now = DateTime.local()
  const reservationCreatedAt = DateTime.fromISO(reservation.createdAt)
  const twentyEightToTwentyNineDaysAgo = Interval.fromDateTimes(
    now.minus({ days: 29 }),
    now.minus({ days: 28 })
  )
  const customer = await prisma
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
