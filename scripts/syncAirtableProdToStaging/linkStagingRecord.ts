import { AirtableData, AirtableModelName } from "../../src/airtable/utils"
import { stagingBase } from "./index"

export const linkStagingRecord = async ({
  rootProductionRecord,
  rootRecordName,
  allRootStagingRecords,
  allTargetProductionRecords,
  allTargetStagingRecords,
  matchRootRecords,
  matchTargetRecords,
  getTargetProductionIds,
  createFieldsData,
}: {
  rootProductionRecord: any
  rootRecordName: AirtableModelName
  allRootStagingRecords: AirtableData
  allTargetProductionRecords: AirtableData
  allTargetStagingRecords: AirtableData
  matchRootRecords: (prodRec, stagingRec) => boolean
  matchTargetRecords: (prodRec, stagingRec) => boolean
  getTargetProductionIds: (rootProdRec) => string[]
  createFieldsData: (targetRecordIds: string[]) => any
}) => {
  // Find the staging record that corresponds to the production record
  const correspondingRootStagingRecord = allRootStagingRecords.find(rsr =>
    matchRootRecords(rootProductionRecord, rsr)
  )
  // Find the linked record(s) id(s) on staging
  const targetProductionRecords = allTargetProductionRecords.filter(r =>
    getTargetProductionIds(rootProductionRecord).includes(r.id)
  )
  const targetStagingRecords = allTargetStagingRecords.filter(r =>
    targetProductionRecords.reduce(
      (acc, curVal) => acc || matchTargetRecords(curVal, r),
      false
    )
  )
  //   Do the update
  await stagingBase(`${rootRecordName}`).update([
    {
      id: correspondingRootStagingRecord.id,
      fields: createFieldsData(targetStagingRecords.map(r => r.id)),
    },
  ])
}
