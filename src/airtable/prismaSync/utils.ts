import {
  AirtableModelName,
  makeAirtableSyncCliProgressBar,
  getNumRecords,
} from "../utils"
import { ProductType, prisma, Size } from "../../prisma"

export const makeSingleSyncFuncMultiBarAndProgressBarIfNeeded = ({
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
    _cliProgressBar = createSubBar({
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
  return multibar.create(numRecords || (await getNumRecords(modelName)), 0, {
    modelName: `${modelName}`.padEnd("Homepage Product Rails".length + 1, " "),
  })
}

export const deepUpsertSize = async ({
  slug,
  type,
  airtableTopSize,
  airtableBottomSize,
}: {
  slug: string
  type: ProductType
  airtableTopSize: any
  airtableBottomSize: any
}): Promise<Size> => {
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
        letter: airtableTopSize?.model.letterSize,
        sleeve: airtableTopSize?.model.sleeve,
        shoulder: airtableTopSize?.model.shoulder,
        chest: airtableTopSize?.model.chest,
        neck: airtableTopSize?.model.neck,
        length: airtableTopSize?.model.length,
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
        type: airtableBottomSize?.model.type,
        value:
          airtableBottomSize?.model.type === "Letter"
            ? airtableBottomSize.model.letterValue
            : airtableBottomSize.model.otherValue,
        waist: airtableBottomSize?.model.waist,
        rise: airtableBottomSize?.model.rise,
        hem: airtableBottomSize?.model.hem,
        inseam: airtableBottomSize?.model.inseam,
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
