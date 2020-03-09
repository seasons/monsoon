import {
  AirtableModelName,
  makeAirtableSyncCliProgressBar,
  getNumRecords,
} from "../utils"

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
