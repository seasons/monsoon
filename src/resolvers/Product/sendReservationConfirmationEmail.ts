import { sendTransactionalEmail } from "../../sendTransactionalEmail"
import { Prisma, Product as PrismaProduct, Reservation } from "../../prisma"
import { UserRequestObject } from "../../auth/utils"
import { emails } from "../../emails"

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
      reservedItems
    ),
  })

  // *************************************************************************
  async function getReservationConfirmationDataForProduct(
    prisma: Prisma,
    product: PrismaProduct
  ) {
    return {
      url: product.images[0].url,
      brand: await prisma
        .product({ id: product.id })
        .brand()
        .name(),
      name: product.name,
      price: product.retailPrice,
    }
  }
}
