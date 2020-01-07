import { prisma } from "../../src/prisma"
import { db } from "../../src/server"
import { sizeToSizeCode } from "../../src/utils"
import { getAllProductVariants, getAllProducts } from "../../src/airtable/utils"

export const backfillStyleCode = async () => {
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
  const allAirtableProducts = await getAllProducts()
  const allAirtableProductVariants = await getAllProductVariants()

  for (let brand of allBrands) {
    const productsForBrand = allPrismaProducts.filter(
      a => a.brand.id === brand.id
    )
    console.log(productsForBrand.map(prod => prod.name))

    let i = 0

    for (let product of productsForBrand) {
      const brandCode = product.brand.brandCode
      const colorCode = product.color.colorCode
      const styleNumber = ++i
      const styleCode = styleNumber.toString().padStart(3, "0")

      console.log(product.name, product.color.name)

      for (let variant of product.variants) {
        const airtableProductVariant = allAirtableProductVariants.find(
          a => a.model.sKU === variant.sku
        )
        const airtableProduct = allAirtableProducts.findByIds(
          airtableProductVariant.model.product
        )
        const sizeCode = sizeToSizeCode(variant.size)
        const sku = `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`

        await airtableProduct.patchUpdate({
          "Style Code": styleNumber,
        })
        console.log(airtableProductVariant)
      }
    }
  }
}

backfillStyleCode()
