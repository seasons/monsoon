import {
  getAllBrands,
  getAllCategories,
  getAllProducts,
  getAllTopSizes,
  getAllBottomSizes,
} from "../utils"
import {
  prisma,
  ProductCreateInput,
  ProductType,
  SizeCreateInput,
  SizeUpdateInput,
  TopSizeUpdateInput,
} from "../../prisma"
import slugify from "slugify"
import { isEmpty, head } from "lodash"
import {
  makeSingleSyncFuncMultiBarAndProgressBarIfNeeded,
  deepUpsertSize,
} from "./utils"

export const syncProducts = async (cliProgressBar?) => {
  const allBrands = await getAllBrands()
  const allProducts = await getAllProducts()
  const allCategories = await getAllCategories()
  const allTopSizes = await getAllTopSizes()
  const allBottomSizes = await getAllBottomSizes()

  const [
    multibar,
    _cliProgressBar,
  ] = makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allProducts.length,
    modelName: "Products",
  })

  for (const record of allProducts) {
    try {
      _cliProgressBar.increment()

      const { model } = record
      const { name } = model

      const brand = allBrands.findByIds(model.brand)
      const category = allCategories.findByIds(model.category)
      const modelTopSize = allTopSizes.findByIds(model.modelTopSize)
      const modelBottomSize = allBottomSizes.findByIds(model.modelBottomSize)

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
        modelHeight,
        externalURL,
        tags,
        retailPrice,
        innerMaterials,
        outerMaterials,
        status,
        type,
      } = model

      const slug = slugify(name + " " + color).toLowerCase()

      let modelSizeRecord
      if (!!modelTopSize || !!modelBottomSize) {
        modelSizeRecord = await deepUpsertSize({
          slug,
          type,
          airtableTopSize: modelTopSize,
          airtableBottomSize: modelBottomSize,
        })
      }

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
        type,
        description,
        images,
        retailPrice,
        externalURL,
        ...(() => {
          return !!modelSizeRecord
            ? { modelSize: { connect: { id: modelSizeRecord.id } } }
            : {}
        })(),
        modelHeight: head(modelHeight) ?? 0,
        status: (status || "Available").replace(" ", ""),
      } as ProductCreateInput

      await prisma.upsertProduct({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })
    } catch (e) {
      console.error(e)
    }
  }
  multibar?.stop()
}
