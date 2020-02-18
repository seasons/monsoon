import { prisma } from "../prisma"
import { DateTime } from "luxon"
import { sendTransactionalEmail } from "../sendTransactionalEmail"
import { emails } from "../emails"

export const sendReturnNotifications = async () => {
  const reservations = await prisma.reservations({
    orderBy: "createdAt_DESC",
  })

  const timeDifference = 2

  for (const reservation of reservations) {
    const reservationCreatedAt = DateTime.fromISO(reservation.createdAt)
    const now = DateTime.local()
    // Remind customer to return items
    if (reservationCreatedAt.plus({ days: 28 }) >= now) {
      const user = await prisma
        .reservation({
          id: reservation.id,
        })
        .customer()
        .user()

      const customer = await prisma
        .reservation({
          id: reservation.id,
        })
        .customer()

      if (customer.plan === "Essential" && reservation) {
        console.log(reservation)

        sendTransactionalEmail({
          to: user.email,
          data: emails.returnReminderData({
            name: user.firstName,
            returnDate: "",
          }),
        })
      }
    }
  }
}

sendReturnNotifications()
