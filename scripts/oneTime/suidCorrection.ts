/**
  Pseudo code for SUIDs correction script
    1. pull all products from prisma sorted by createdAt ASC
    2. generate style code
        - for each brand get filtered subset array based on previous order
        - use index of product in filtered brand array as style code
    3. generate new SKUs for existing product variants based on new style code
    4. diff between old and new product variant SKUs
    5. generate new SUIDs based on new product variant SKUs
    6. diff between old SUIDs and new SUIDs
 */

import { prisma } from "../../src/prisma"
import { db } from "../../src/server"
import { sizeToSizeCode } from "../../src/utils"

export const SUIDcorrection = async () => {
  // Get all the physical products from airtable
  const allPrismaProducts = await db.query.products(
    {
      orderBy: "createdAt_ASC",
    },
    `
    {
        id
        slug
        name
        brand {
            id
            name
            brandCode
        }
        color {
            name
            colorCode
        }
        variants {
            sku
            size
        }
        createdAt
    }
  `
  )
  const allBrands = await prisma.brands()
  let mismatchedSKUs = 0
  let productsNoVariants = 0

  for (let brand of allBrands) {
    const productsForBrand = allPrismaProducts.filter(
      a => a.brand.id === brand.id
    )
    // console.log(productsForBrand)
    let i = 0

    for (let product of productsForBrand) {
      const brandCode = product.brand.brandCode
      const colorCode = product.color.colorCode
      //   if (product.variants.length === 0) {
      if (toDeleteSlugs.includes(product.slug)) {
        // productsNoVariants++
        continue
      }
      const styleCode = (++i).toString().padStart(3, "0")
      console.log(product.name, product.color.name)

      for (let variant of product.variants) {
        const sizeCode = sizeToSizeCode(variant.size)
        const sku = `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
        if (sku !== variant.sku) {
          mismatchedSKUs++
          console.log(sku, " - ", variant.sku)
        }
      }
    }
  }
  console.log("Number of mismatched SKUs: ", mismatchedSKUs)
  //   console.log("Number with no variants: ", productsNoVariants)
}

SUIDcorrection()

const toDeleteSlugs = [
  "cotton-twill-jacket-blue",
  "single-breasted-wool-coat-green",
  "relaxed-oatmeal-coat-brown",
  "poplin-zip-up-jacket-black",
  "wool-all-over-logo-sweater-red",
  "all-over-logo-zip-turtleneck-black",
  "og-detroit-jacket-black",
  "og-detroit-jacket-brown",
  "volta-liner-bomber-jacket-gray",
  "michigan-jacket-brown",
  "bleached-denim-parka-blue",
  "herringbone-bomber-jacket-green",
  "three-layer-coat-blue",
  "madison-parka-black",
  "denim-sherpa-hooded-long-trucker-jacket-blue",
  "corduroy-sherpa-trucker-jacket-brown",
  "sherpa-type-3-trucker-jacket-blue",
  "sherpa-jackson-overshirt-blue",
  "nylon-gabardine-shirt-black",
  "nylon-knit-jacket-black",
  "classic-cropped-denim-jacket-black",
  "faux-fur-trim-down-parka-black",
  "herringbone-down-shirt-jacket-gray",
  "polo-wool-blend-peacoat-blue",
  "washable-cashmere-sweater-gray",
  "denim-sportsman-trucker-jacket-blue",
  "leopard-faux-fur-blouson-jacket-black",
  "denim-jacket-black",
  "black-ma-1-bomber-jacket-black",
  "corduroy-coach-jacket-brown",
  "ghost-piece-wool-sweatshirt-l-black",
  "tie-dye-sweatshirt-white",
  "tie-dye-skill-sweatshirt-white",
]
