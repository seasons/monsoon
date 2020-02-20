import { sendTransactionalEmail } from "../../sendTransactionalEmail"
import { Prisma, Product as PrismaProduct, Reservation } from "../../prisma"
import { UserRequestObject } from "../../auth/utils"
import { emails } from "../../emails"
import { Identity } from "../../utils"

export async function sendReservationConfirmationEmail(
  prisma: Prisma,
  user: UserRequestObject,
  products: PrismaProduct[],
  reservation: Reservation
) {
  const reservedItems = [
    await getReservationConfirmationDataForProduct(prisma, products[0]),
  ]
  if (!!products[1]) {
    reservedItems.push(
      await getReservationConfirmationDataForProduct(prisma, products[1])
    )
  }
  if (!!products[2]) {
    reservedItems.push(
      await getReservationConfirmationDataForProduct(prisma, products[2])
    )
  }

  sendTransactionalEmail({
    to: user.email,
    data: emails.reservationConfirmationData(
      reservation.reservationNumber,
      reservedItems,
      formatReservationReturnDate(new Date(reservation.createdAt))
    ),
  })
}

const formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
  const returnDate = new Date(reservationCreatedAtDate)
  returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
  return returnDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const getReservationConfirmationDataForProduct = async (
  prisma: Prisma,
  product: PrismaProduct
) =>
  Identity({
    url: product.images[0].url,
    brand: await prisma
      .product({ id: product.id })
      .brand()
      .name(),
    name: product.name,
    price: product.retailPrice,
  })
