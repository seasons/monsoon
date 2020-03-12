import {
  getAllBrands,
  getAllCategories,
  getAllProducts,
  getAllSizes,
} from "../utils"
import {
  prisma,
  ProductCreateInput,
  LetterSize,
  BottomSizeType,
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
  const allSizes = await getAllSizes()

  const [
    multibar,
    _cliProgressBar,
  ] = await makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
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
      const modelSize = allSizes.findByIds(model.modelSize)

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

      if (isEmpty(images)) {
        continue
      }

      const slug = slugify(name + " " + color).toLowerCase()

      let modelSizeRecord
      if (!!modelSize) {
        const {
          display: modelSizeDisplay,
          type: modelSizeType,
          name: modelSizeName,
        } = modelSize.model
        modelSizeRecord = await deepUpsertSize({
          slug,
          type,
          display: modelSizeDisplay,
          topSizeData: type === "Top" && {
            letter: modelSizeName as LetterSize,
          },
          bottomSizeData: type === "Bottom" && {
            type: modelSizeType as BottomSizeType,
            value: modelSizeName,
          },
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
      console.log(record)
      console.error(e)
    }
  }
  multibar?.stop()
}
