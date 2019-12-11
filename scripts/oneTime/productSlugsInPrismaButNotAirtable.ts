/* This script was written to look into the scope of the issue elucidated
on this ticket: https://app.asana.com/0/1141411134053249/1152833785783081
*/

import { getAllProducts } from "../../src/airtable/utils"
import { prisma } from "../../src/prisma"
import { xor } from "lodash"

async function allProdsInPrismaNotAirtable() {
  // Get all the physical products from airtable
  const allAirtableProducts = await getAllProducts()
  const allPrismaProducts = await prisma.products()

  const allAirtableProductSlugs = allAirtableProducts.map(
    prod => prod.fields.Slug
  )
  const allPrismaProductSlugs = allPrismaProducts.map(prod => prod.slug)

  const list = []

  for (let productSlug of allPrismaProductSlugs) {
    if (!allAirtableProductSlugs.includes(productSlug)) {
      list.push(productSlug)
    }
  }
  // const XOR = xor(allAirtableProductSlugs, allPrismaProductSlugs)

  for (let slug of list) {
    console.log(`"${slug}",`)
  }
  console.log("Number of products in prisma but not airtable: ", list.length)
}

allProdsInPrismaNotAirtable()
