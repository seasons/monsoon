import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const physicalProductID = "ck2zedq9a0wut0734ujyregz6"

  // Update to the customer you're using
  const customerID = "ckko86kkj00990970yvniai59"

  const orderItem = await ps.client.createOrderItem({
    recordID: physicalProductID,
    recordType: "PhysicalProduct",
    needShipping: false,
    taxRate: 12.0,
    taxName: "",
    taxPercentage: 12.0,
    taxPrice: 300,
    price: 8000,
    currencyCode: "USD",
  })

  const order = await ps.client.createOrder({
    // sentPackage: Package
    customer: { connect: { id: customerID } },
    orderNumber: 12123123123,
    items: {
      connect: [{ id: orderItem.id }],
    },
    type: "New",
    status: "Submitted",
    subTotal: 8000,
    total: 9000,
    cancelReason: null,
    couponID: "",
    paymentStatus: "NotPaid",
    note: "",
  })
}

run()
