import { getCorrespondingAirtableProductVariant } from "../utils"
import { getAllProducts, getAllProductVariants } from "../../src/airtable/utils"
import { db } from "../../src/server"
import { updateProductVariantCounts } from "../../src/airtable/updateProductVariantCounts"

async function oneTimeCountsCorrection() {
  const allPrismaProductVariants = await db.query.productVariants(
    {},
    `{
        id
        product { 
            slug
        }
        sku
        size
        nonReservable
        total
        reservable
        reserved
    }
    `
  )
  const allAirtableProducts = await getAllProducts()
  const allAirtableProductVariants = await getAllProductVariants()
  let numUpdates = 0
  for (let prismaProdVar of allPrismaProductVariants) {
    if (numUpdates >= 25) {
      break
    }
    const corespondingAirtableProdVar = getCorrespondingAirtableProductVariant(
      allAirtableProducts,
      allAirtableProductVariants,
      prismaProdVar
    )
    if (
      prismaProdVar.nonReservable !==
        corespondingAirtableProdVar.fields["Non-Reservable Count"] ||
      prismaProdVar.reserved !==
        corespondingAirtableProdVar.fields["Reserved Count"] ||
      prismaProdVar.reservable !==
        corespondingAirtableProdVar.fields["Reservable Count"]
    ) {
      numUpdates++
      const newAirtableCounts = {
        "Non-Reservable Count": prismaProdVar.nonReservable,
        "Reserved Count": prismaProdVar.reserved,
        "Reservable Count": prismaProdVar.reservable,
      }
      console.log(`Update ${prismaProdVar.sku}`)
      updateProductVariantCounts(
        corespondingAirtableProdVar.id,
        newAirtableCounts
      )
    }
  }
  console.log(`NUM UPDATES: ${numUpdates}`)
}

oneTimeCountsCorrection()
