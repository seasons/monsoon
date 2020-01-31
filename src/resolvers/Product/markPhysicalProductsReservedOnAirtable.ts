import { PhysicalProduct } from "../../prisma"
import { getPhysicalProducts } from "../../airtable/utils"
import { fill } from "lodash"
import { AirtablePhysicalProductFields } from "../../airtable/updatePhysicalProduct"
import { updatePhysicalProducts } from "../../airtable/updatePhysicalProducts"

export async function markPhysicalProductsReservedOnAirtable(
  physicalProducts: PhysicalProduct[]
): Promise<Function> {
  // Get the record ids of all relevant airtable physical products
  const airtablePhysicalProductRecords = await getPhysicalProducts(
    physicalProducts.map(prod => prod.seasonsUID)
  )
  let airtablePhysicalProductRecordIds = airtablePhysicalProductRecords.map(
    a => a.id
  ) as [string]

  // Update their statuses on airtable
  const airtablePhysicalProductRecordsData = fill(
    new Array(airtablePhysicalProductRecordIds.length),
    {
      "Inventory Status": "Reserved",
    }
  ) as [AirtablePhysicalProductFields]
  await updatePhysicalProducts(
    airtablePhysicalProductRecordIds,
    airtablePhysicalProductRecordsData
  )

  // Create and return a rollback function
  const airtablePhysicalProductRecordsRollbackData = fill(
    new Array(airtablePhysicalProductRecordIds.length),
    {
      "Inventory Status": "Reservable",
    }
  ) as [AirtablePhysicalProductFields]
  const rollbackMarkPhysicalProductReservedOnAirtable = async () => {
    await updatePhysicalProducts(
      airtablePhysicalProductRecordIds,
      airtablePhysicalProductRecordsRollbackData
    )
  }
  return rollbackMarkPhysicalProductReservedOnAirtable
}
