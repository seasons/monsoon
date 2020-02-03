import { sendTransactionalEmail } from "../../utils"
import { Prisma, Product as PrismaProduct, Reservation } from "../../prisma"
import { UserRequestObject } from "../../auth/utils"

export async function sendReservationConfirmationEmail(
  prisma: Prisma,
  user: UserRequestObject,
  products: Array<PrismaProduct>,
  reservation: Reservation
) {
  const prod1Data = await getReservationConfirmationDataForProduct(
    prisma,
    products[0],
    "item1"
  )
  let [prod2Data, prod3Data] = [{}, {}]
  if (!!products[1]) {
    prod2Data = await getReservationConfirmationDataForProduct(
      prisma,
      products[1],
      "item2"
    )
  }
  if (!!products[2]) {
    prod3Data = await getReservationConfirmationDataForProduct(
      prisma,
      products[2],
      "item3"
    )
  }
  sendTransactionalEmail(user.email, "d-2b8bb24a330740b7b3acfc7f4dea186a", {
    order_number: reservation.reservationNumber,
    ...prod1Data,
    ...prod2Data,
    ...prod3Data,
  })

  // *************************************************************************
  async function getReservationConfirmationDataForProduct(
    prisma: Prisma,
    product: PrismaProduct,
    prefix: String
  ) {
    let data = {}
    data[`${prefix}_url`] = product.images[0].url
    data[`${prefix}_brand`] = await prisma
      .product({ id: product.id })
      .brand()
      .name()
    data[`${prefix}_name`] = product.name
    data[`${prefix}_price`] = product.retailPrice
    return data
  }
}
