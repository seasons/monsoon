import { getAllBrands, getAllCategories, getAllProducts } from "./utils"
import {
  prisma,
  ProductCreateInput,
  ProductFunctionCreateManyInput,
} from "../prisma"
import slugify from "slugify"
import { isEmpty } from "lodash"

export const syncProducts = async () => {
  const allBrands = await getAllBrands()
  const allCategories = await getAllCategories()
  const allProducts = await getAllProducts()
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
        functions,
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
        functions: {
          connect: functions.map(a => ({ name: a })),
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
console.log("Done processing products...")
