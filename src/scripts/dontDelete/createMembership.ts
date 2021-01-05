import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  //   const customerID = "cki7o8qbb1jbz07597h5yq90x"
  //   const subscriptionID = "6oZl9SLE4yR21fF6"
  //   const planID = "essential-1"

  await ps.client.createCustomerMembership({
    customer: { connect: { id: customerID } },
    subscriptionId: subscriptionID,
    giftId: null,
    plan: { connect: { planID } },
  })
}

run()
