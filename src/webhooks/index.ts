import express from "express"
import { base } from "../airtable/config"
import { prisma } from "../prisma"
const app = express()

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
