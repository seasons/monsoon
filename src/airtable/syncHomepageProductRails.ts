import slugify from "slugify"
import { prisma } from "../prisma"
import { isEmpty } from "lodash"
import { getAllProducts, getAllHomepageProductRails } from "./utils"

export const syncHomepageProductRails = async () => {
  const records = await getAllHomepageProductRails()
  const allProducts = await getAllProducts()

  for (let record of records) {
    try {
      const { model } = record
      const products = allProducts.findMultipleByIds(model.products)
      const { name } = model

      if (isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()

      const data = {
        products: {
          connect: products.map(product => ({ slug: product.model.slug })),
        },
        slug,
        name,
      }

      const homepageProductRail = await prisma.upsertHomepageProductRail({
        where: {
          slug,
        },
        create: {
          slug,
          ...data,
        },
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(homepageProductRail)
    } catch (e) {
      console.error(e)
    }
  }
}
