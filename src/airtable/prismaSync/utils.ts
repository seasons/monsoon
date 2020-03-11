import {
  AirtableModelName,
  makeAirtableSyncCliProgressBar,
  getNumRecords,
  AirtableData,
} from "../utils"
import {
  ProductType,
  prisma,
  Size,
  LetterSize,
  BottomSizeType,
  TopSizeCreateInput,
  BottomSizeCreateInput,
} from "../../prisma"

export const makeSingleSyncFuncMultiBarAndProgressBarIfNeeded = async ({
  cliProgressBar,
  numRecords,
  modelName,
}: {
  cliProgressBar?: any
  numRecords: number
  modelName: AirtableModelName
}) => {
  let multibar
  let _cliProgressBar = cliProgressBar
  if (!_cliProgressBar) {
    multibar = makeAirtableSyncCliProgressBar()
    _cliProgressBar = await createSubBar({
      multibar,
      modelName,
      numRecords,
    })
  }
  return [multibar, _cliProgressBar]
}

export const createSubBar = async ({
  multibar,
  modelName,
  numRecords,
  numRecordsModifier,
}: {
  multibar: any
  modelName: AirtableModelName
  numRecords?: number
  numRecordsModifier?: (num: number) => number
}) => {
  const _numRecords =
    !!numRecordsModifier && !!numRecords
      ? numRecordsModifier(numRecords)
      : numRecords
  return multibar.create(_numRecords || (await getNumRecords(modelName)), 0, {
    modelName: `${modelName}`.padEnd("Homepage Product Rails".length + 1, " "),
  })
}

export const deepUpsertSize = async ({
  slug,
  type,
  topSizeData,
  bottomSizeData,
}: {
  slug: string
  type: ProductType
  topSizeData?: TopSizeCreateInput
  bottomSizeData?: BottomSizeCreateInput
}): Promise<Size> => {
  // Update if needed
  const sizeRecord = await prisma.upsertSize({
    where: { slug },
    create: { slug, productType: type },
    update: { slug, productType: type },
  })
  switch (type) {
    case "Top":
      if (!topSizeData) {
        throw new Error("topSizeData must be non null if type is Top")
      }
      const prismaTopSize = await prisma.size({ id: sizeRecord.id }).top()
      const topSize = await prisma.upsertTopSize({
        where: { id: prismaTopSize?.id || "" },
        update: { ...topSizeData },
        create: { ...topSizeData },
      })
      if (!prismaTopSize) {
        await prisma.updateSize({
          where: { slug },
          data: { top: { connect: { id: topSize.id } } },
        })
      }
      break
    case "Bottom":
      if (!bottomSizeData) {
        throw new Error("bottomSizeData must be non null if type is Bottom")
      }
      const prismaBottomSize = await prisma
        .size({ id: sizeRecord?.id })
        .bottom()
      const bottomSize = await prisma.upsertBottomSize({
        where: { id: prismaBottomSize?.id || "" },
        create: { ...bottomSizeData },
        update: { ...bottomSizeData },
      })
      if (!prismaBottomSize) {
        await prisma.updateSize({
          where: { slug },
          data: { bottom: { connect: { id: bottomSize.id } } },
        })
      }
  }

  return sizeRecord
}
