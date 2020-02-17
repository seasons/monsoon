import { AirtableData, AirtableModelName } from "../utils"
import { getStagingBase } from "../config"

export const linkStagingRecord = async ({
  rootProductionRecord,
  rootRecordName,
  targetFieldNameOnRootRecord,
  allRootStagingRecords,
  allTargetProductionRecords,
  allTargetStagingRecords,
  getRootRecordIdentifer,
  getTargetRecordIdentifer,
}: LinkStagingRecordInput) => {
  // Find the staging record that corresponds to the production record
  const correspondingRootStagingRecord = allRootStagingRecords.find(
    rsr =>
      getRootRecordIdentifer(rootProductionRecord) ===
      getRootRecordIdentifer(rsr)
  )
  // Find the linked record(s) id(s) on staging
  const targetProductionRecords = allTargetProductionRecords.filter(r =>
    rootProductionRecord.fields[`${targetFieldNameOnRootRecord}`].includes(r.id)
  )
  const targetStagingRecords = allTargetStagingRecords.filter(r =>
    targetProductionRecords.reduce(
      (acc, curVal) =>
        acc || getTargetRecordIdentifer(curVal) === getTargetRecordIdentifer(r),
      false
    )
  )
  //   Do the update
  await getStagingBase()(`${rootRecordName}`).update([
    {
      id: correspondingRootStagingRecord.id,
      fields: {
        [targetFieldNameOnRootRecord]: targetStagingRecords.map(r => r.id),
      },
    },
  ])
}

export interface LinkStagingRecordInput {
  rootProductionRecord: any
  rootRecordName: AirtableModelName
  targetFieldNameOnRootRecord: string
  allRootStagingRecords: AirtableData
  allTargetProductionRecords: AirtableData
  allTargetStagingRecords: AirtableData
  getRootRecordIdentifer: (rec) => any
  getTargetRecordIdentifer: (rec) => any
}
