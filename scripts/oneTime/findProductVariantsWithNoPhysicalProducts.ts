import { db } from "../../src/server"
import { getAllProducts, getAllProductVariants } from "../../src/airtable/utils"
import { PhysicalProduct } from "../../src/resolvers/PhysicalProduct"
import { PhysicalProductUpdateInput, prisma } from "../../src/prisma"

export async function findProductVariantsWithNoPhysicalProducts() {
  const allPrismaProductVariants = await db.query.productVariants(
    {},
    `{
            id
            product { 
                slug
            }
            physicalProducts {
                id
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

  const set = []

  for (let productVariant of allPrismaProductVariants) {
    const physicalProductCount = productVariant.physicalProducts.length
    const { sku, total } = productVariant

    const newPhysicalProducts = []

    if (physicalProductCount <= 0) {
      set.push(productVariant)
      console.log(productVariant.sku, ", ", productVariant.total)

      for (let i = 1; i <= total - physicalProductCount; i++) {
        const physicalProductID = (physicalProductCount + i)
          .toString()
          .padStart(2, "0")

        newPhysicalProducts.push({
          seasonsUID: sku + `-${physicalProductID}`,
          productVariant: {
            connect: {
              sku,
            },
          },
          location: {
            connect: {
              slug: `seasons-hq-official`,
            },
          },
          inventoryStatus: "Reservable",
          productStatus: "New",
        } as PhysicalProductUpdateInput)
      }

      newPhysicalProducts.forEach(async p => {
        const updatePhysicalProduct = await prisma.upsertPhysicalProduct({
          where: {
            seasonsUID: p.seasonsUID,
          },
          create: p,
          update: p,
        })

        console.log(updatePhysicalProduct)
      })
    }
  }
}

findProductVariantsWithNoPhysicalProducts()
