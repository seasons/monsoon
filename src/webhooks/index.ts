import express from "express"
import { base } from "../airtable/config"
import { prisma, User } from "../prisma"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"

const CHARGEBEE_PAYMENT_UPDATED = "payment_source_updated"

const app = express()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.post("/airtable_events", async (req, res) => {
  const data = req.body
  for (let row of data) {
    const { tableId, recordId, updates } = row

    const record = await base(tableId).find(recordId)
    if (!record) {
      return res.sendStatus(400)
    }

    // Check if record is Physical Product
    if (!!record.fields.SUID) {
      const { text: SUID } = record.fields.SUID
      const physicalProduct = await prisma.physicalProduct({
        seasonsUID: SUID,
      })
      const productVariant = await prisma
        .physicalProduct({
          seasonsUID: SUID,
        })
        .productVariant()

      const currentInventoryStatus = physicalProduct.inventoryStatus
      const updatedInventoryStatus = updates.find(a => a.field)

      if (
        currentInventoryStatus === "NonReservable" &&
        updatedInventoryStatus === "Reservable"
      ) {
        await incrementReservableCount(productVariant, physicalProduct)
      } else if (
        currentInventoryStatus === "Reservable" &&
        updatedInventoryStatus === "Reserved"
      ) {
      }
    }
  }

  res.sendStatus(200)
})

app.post('/chargebee', async (req, res) => {
  console.log("REQUEST:", req.body)
  console.log("CARD:", req.body.content.payment_source.card)
  const data = req.body
  const { event_type: eventType } = data
  switch (eventType) {
    case CHARGEBEE_PAYMENT_UPDATED:
      const { first_name, id: userID, last_name } = data.customer
      const { brand, expiry_month, expiry_year, last4, } = data.content.payment_source.card
      const user = await prisma.user({ id: userID })
      const customers = await prisma.customers({
        where: { user: { id: user.id } },
      })
      if (customers?.length) {
        const customer = customers[0]
        const billingInfoId = await prisma.customer({ id: customer.id })
          .billingInfo()
          .id()
        if (billingInfoId) {
          await prisma.updateBillingInfo({
            data: {
              brand,
              expiration_month: expiry_month,
              expiration_year: expiry_year,
              last_digits: last4,
              name: `${first_name} ${last_name}`,
            },
            where: { id: billingInfoId }
          })
        }
      }
    default:
      console.log("webhooks.ts: Unhandled chargebee event type", eventType)
  }
  res.send()
})

const incrementReservableCount = async (productVariant, physicalProduct) => {
  await prisma.updateProductVariant({
    where: {
      sku: productVariant.sku,
    },
    data: {
      nonReservable:
        productVariant.nonReservable <= 0
          ? 0
          : productVariant.nonReservable - 1,
      reservable: productVariant.reservable + 1,
    },
  })

  console.log(physicalProduct, productVariant)
}

interface Update {
  field: string
  newValue: string
}

export { app }
