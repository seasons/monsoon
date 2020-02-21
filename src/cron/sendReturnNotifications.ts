import { prisma, Reservation } from "../prisma"
import { DateTime, Interval } from "luxon"
import { sendTransactionalEmail } from "../sendTransactionalEmail"
import { emails } from "../emails"
import { formatReservationReturnDate } from "../resolvers/Product/formatReservationReturnDate"

export const sendReturnNotifications = async () => {
  const reservations = await prisma.reservations({
    orderBy: "createdAt_DESC",
  })

  for (const reservation of reservations) {
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
    }
  }
}

const returnNoticeNeeded = async (reservation: Reservation) => {
  const now = DateTime.local()
  const reservationCreatedAt = DateTime.fromISO(reservation.createdAt)
  const twentyEightToThirtyDaysAgo = Interval.fromDateTimes(
    now.minus({ days: 29 }),
    now.minus({ days: 28 })
  )
  const customer = await prisma
    .reservation({
      id: reservation.id,
    })
    .customer()

  return (
    twentyEightToThirtyDaysAgo.contains(reservationCreatedAt) &&
    !reservation.reminderSentAt &&
    customer.plan === "Essential" &&
    !["Cancelled", "Completed"].includes(reservation.status)
  )
}

sendReturnNotifications()
