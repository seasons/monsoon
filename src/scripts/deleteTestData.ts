import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allTestCustomers = await ps.binding.query.customers(
    {
      where: { user: { firstName: "SamTest" } },
    },
    `{
        id
        user {
          id
        }
    }`
  )
  for (const testCust of allTestCustomers) {
    await ps.client.deleteManyBagItems({ customer: { id: testCust.id } })
    await ps.client.deleteManyProductVariantFeedbackQuestions({
      variantFeedback: {
        reservationFeedback: { reservation: { customer: { id: testCust.id } } },
      },
    })
    await ps.client.deleteManyProductVariantFeedbacks({
      reservationFeedback: { reservation: { customer: { id: testCust.id } } },
    })
    await ps.client.deleteManyReservationFeedbacks({
      reservation: { customer: { id: testCust.id } },
    })
    await ps.client.deleteManyReservations({ customer: { id: testCust.id } })
    await ps.client.deleteCustomer({ id: testCust.id })
    await ps.client.deleteUser({ id: testCust.user.id })
  }
}

run()
