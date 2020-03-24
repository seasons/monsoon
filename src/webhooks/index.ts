import express from "express"
import { PrismaClientService } from "../prisma/client.service"
import { CustomerService } from "../modules/User/services/customer.service"

const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed"

const app = express()

app.post("/chargebee_events", async (req, res) => {
  const prisma = new PrismaClientService()
  const customerService = new CustomerService(null, null, null, prisma, null)

  const data = req.body
  const { event_type: eventType } = data
  switch (eventType) {
    case CHARGEBEE_CUSTOMER_CHANGED:
      const { content } = data
      const { id: userID } = content.customer
      const {
        card_type: brand,
        expiry_month,
        expiry_year,
        first_name,
        last_name,
        last4,
      } = content.card
      const customers = await prisma.client.customers({
        where: { user: { id: userID } },
      })
      if (customers?.length) {
        const customer = customers[0]
        customerService.updateCustomerBillingInfo({
          customerId: customer.id,
          billingInfo: {
            brand,
            expiration_month: expiry_month,
            expiration_year: expiry_year,
            last_digits: last4,
            name: `${first_name} ${last_name}`,
          },
        })
      }
      break
    default:
      break
  }

  res.sendStatus(200)
})

export { app }
