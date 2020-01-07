import { getAllBrands, getAllCategories, getAllProducts } from "./utils"
import { prisma, ProductCreateInput } from "../prisma"
import slugify from "slugify"
import { isEmpty, uniqBy } from "lodash"

export const syncProducts = async () => {
  const allBrands = await getAllBrands()
  const allProducts = await getAllProducts()
  const allCategories = await getAllCategories()

  let i = 1

  for (let record of allProducts) {
    try {
      const { model } = record
      const { name } = model

      const brand = allBrands.findByIds(model.brand)
      const category = allCategories.findByIds(model.category)

      if (
        isEmpty(model) ||
        isEmpty(name) ||
        isEmpty(brand) ||
        isEmpty(category)
      ) {
        continue
      }

      const {
        color,
        description,
        images,
        availableSizes,
        modelSize,
        modelHeight,
        externalURL,
        tags,
        retailPrice,
        innerMaterials,
        outerMaterials,
        status,
      } = model

      const slug = slugify(name + " " + color).toLowerCase()

      const data = {
        brand: {
          connect: {
            slug: brand.model.slug,
          },
        },
        category: {
          connect: {
            slug: category.model.slug,
          },
        },
        color: {
          connect: {
            slug: slugify(color).toLowerCase(),
          },
        },
        availableSizes: {
          set: availableSizes,
        },
        innerMaterials: {
          set: (innerMaterials || []).map(a => a.replace(/\ /g, "")),
        },
        outerMaterials: {
          set: (outerMaterials || []).map(a => a.replace(/\ /g, "")),
        },
        tags: {
          set: tags,
        },
        name,
        slug,
        description,
        images,
        retailPrice,
        modelSize,
        modelHeight,
        externalURL,
        status: (status || "Available").replace(" ", ""),
      } as ProductCreateInput

      const product = await prisma.upsertProduct({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(i++, product)
    } catch (e) {
      console.error(e)
    }
  }
}

syncProducts()
