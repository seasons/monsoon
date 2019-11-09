import express from "express"
import { base } from "../airtable/config"
import { prisma } from "../prisma"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"
const app = express()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.post("/airtable_events", async (req, res) => {
  console.log(req.body)
  const data = req.body
  for (let row of data) {
    const { tableId, recordId, updates } = row

    console.log("Table ID: ", tableId, updates)

    const record = await base(tableId).find(recordId)
    if (!record) {
      return res.sendStatus(400)
    }

    // Check if record is user
    if (record.fields.status === "Authorized") {
      // create the custom link
      const user = await prisma.user({ email: record.fields.email })
      const idHash = crypto
        .createHash("sha256")
        .update(`${user.id}${process.env.HASH_SECRET}`)
        .digest("hex")
      const link = `${process.env.SEEDLING_URL}?id=${idHash}`

      // Set prisma user object status to authorized
      let customerArray = await prisma.customers({
        where: { user: { id: user.id } },
      })
      const customer = customerArray[0]
      await prisma.updateCustomer({
        data: { status: "Authorized" },
        where: { id: customer.id },
      })

      // Send email via sendgrid
      const msg = {
        to: user.email,
        from: "membership@seasons.nyc",
        templateId: "d-a62e1c840166432abd396d1536e4489d",
        dynamic_template_data: {
          name: user.firstName,
          url: link,
        },
      }
      sgMail.send(msg)
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

export { app }
