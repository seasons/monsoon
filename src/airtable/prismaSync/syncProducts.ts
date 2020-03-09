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
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

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
        modelSizeRecord = await deepUpsertSize(
          slug,
          type,
          modelTopSize,
          modelBottomSize
        )
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

const deepUpsertSize = async (slug, type, modelTopSize, modelBottomSize) => {
  // Update if needed
  const modelSizeRecord = await prisma.upsertSize({
    where: { slug },
    create: { slug, productType: type },
    update: { slug, productType: type },
  })
  let data
  switch (type) {
    case "Top":
      const prismaTopSize = await prisma.size({ id: modelSizeRecord.id }).top()
      data = {
        letter: modelTopSize?.model.letterSize,
        sleeve: modelTopSize?.model.sleeve,
        shoulder: modelTopSize?.model.shoulder,
        chest: modelTopSize?.model.chest,
        neck: modelTopSize?.model.neck,
      }
      const topSize = await prisma.upsertTopSize({
        where: { id: prismaTopSize?.id || "" },
        update: { ...data },
        create: { ...data },
      })
      if (!prismaTopSize) {
        await prisma.updateSize({
          where: { slug },
          data: { top: { connect: { id: topSize.id } } },
        })
      }
      break
    case "Bottom":
      const prismaBottomSize = await prisma
        .size({ id: modelSizeRecord?.id })
        .bottom()
      data = {
        type: modelBottomSize?.model.type,
        value: modelBottomSize?.model.value,
        waist: modelBottomSize?.model.waist,
        rise: modelBottomSize?.model.rise,
        hem: modelBottomSize?.model.hem,
        inseam: modelBottomSize?.model.inseam,
      }
      const bottomSize = await prisma.upsertBottomSize({
        where: { id: prismaBottomSize?.id || "" },
        create: { ...data },
        update: { ...data },
      })
      if (!prismaBottomSize) {
        await prisma.updateSize({
          where: { slug },
          data: { bottom: { connect: { id: bottomSize.id } } },
        })
      }
  }

  return modelSizeRecord
}
