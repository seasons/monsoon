/* This script was written to look into the scope of the issue elucidated
on this ticket: https://app.asana.com/0/1141411134053249/1152833785783081
*/

import {
  getAllPhysicalProducts,
  getAllProductVariants,
} from "../src/airtable/utils"
import { prisma } from "../src/prisma"

async function queryMismatchedProductVariants(onlyReserved: boolean) {
  // Get all the physical products from airtable
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()
  const allAirtableProductVariants = await getAllProductVariants()
  const allPhysicalProductsEverReserved = await allPhysicalProductsOnAReservation()

  let aligned = []
  let misaligned = []
  let errors = []
  let physicalProdsInAirtableButNotPrisma = []
  let totalCount = 0
  for (let airtablePhysicalProduct of allAirtablePhysicalProducts) {
    const SUID = airtablePhysicalProduct.fields.SUID.text
    if (onlyReserved && !allPhysicalProductsEverReserved.includes(SUID)) {
      continue
    }
    totalCount++

    try {
      // Get the corresponding physical product
      const prismaPhysicalProduct = await prisma.physicalProduct({
        seasonsUID: SUID,
      })
      if (!prismaPhysicalProduct) {
        physicalProdsInAirtableButNotPrisma.push(
          `Physical Product SUID: ${SUID}`
        )
      } else {
        // Get the corresponding product variants on both airtable and prisma
        const productVariantOnAirtablePhysicalProduct = getAirtableProductVariantRecord(
          airtablePhysicalProduct.fields["Product Variant"][0],
          allAirtableProductVariants
        )
        const productVariantOnPrismaPhysicalProduct = await prisma
          .physicalProduct({ id: prismaPhysicalProduct.id })
          .productVariant()

        // Check if they have the same SKU
        const airtableProdVarSKU =
          productVariantOnAirtablePhysicalProduct.fields.SKU
        const prismaProdVarSKU = productVariantOnPrismaPhysicalProduct.sku

        // Set up reporting
        if (airtableProdVarSKU !== prismaProdVarSKU) {
          misaligned.push(
            `Physical Product SUID: ${SUID} AirtableProdVar SKU: ${airtableProdVarSKU} PrismaProdVar SKU: ${prismaProdVarSKU}`
          )
        } else {
          aligned.push(
            `Physical Product SUID: ${SUID} AirtableProdVar SKU: ${airtableProdVarSKU} PrismaProdVar SKU: ${prismaProdVarSKU}`
          )
        }
      }
    } catch (err) {
      console.log(err)
      errors.push(`PhysicalProduct SUID: ${SUID}`)
    }
  }

  console.log(
    `*** TOTAL RECORDS UPDATED: ${totalCount}\n. TOTAL ALIGNED: ${aligned.length}. TOTAL MISALIGNED: ${misaligned.length}. TOTAL IN AIRTABLE BUT NOT PRISMA: ${physicalProdsInAirtableButNotPrisma.length}. TOTAL ERRORS: ${errors.length}`
  )
  console.log(`*** ALIGNED ***`)
  for (let rec of aligned) {
    console.log(rec)
  }
  console.log(`*** MISALIGNED ***`)
  for (let rec of misaligned) {
    console.log(rec)
  }
  console.log(`*** PHYSICAL PRODUCTS IN AIRTABLE BUT NOT PRISMA ***`)
  for (let rec of physicalProdsInAirtableButNotPrisma) {
    console.log(rec)
  }
  console.log(`*** ERRORS ***`)
  for (let rec of errors) {
    console.log(rec)
  }
}

queryMismatchedProductVariants(true)

function getAirtableProductVariantRecord(
  airtableProductVariantRecordID,
  allAirtableProductVariants
): any {
  return allAirtableProductVariants.filter(
    prodVar => prodVar.id === airtableProductVariantRecordID
  )[0]
}

async function allPhysicalProductsOnAReservation() {
  let items = []
  const allReservations = await prisma.reservations()
  for (let resy of allReservations) {
    const physicalProds = await prisma.reservation({ id: resy.id }).products()
    physicalProds.forEach(prod => items.push(prod.seasonsUID))
  }
  return items
}
