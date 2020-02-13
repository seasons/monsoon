import { AirtableModelName, AirtableData } from "../../src/airtable/utils"
import { linkStagingRecord, LinkStagingRecordInput } from "./linkStagingRecord"

export const linkStagingRecords = async ({
  rootRecordName,
  targetFieldNameOnRootRecord,
  allRootProductionRecords,
  allRootStagingRecords,
  allTargetProductionRecords,
  allTargetStagingRecords,
  getRootRecordIdentifer,
  getTargetRecordIdentifer,
}: Omit<LinkStagingRecordsInput, "rootProductionRecord">) => {
  for (const rootProductionRecord of allRootProductionRecords) {
    if (!rootProductionRecord.fields[`${targetFieldNameOnRootRecord}`]) {
      continue
    }
    await linkStagingRecord({
      rootProductionRecord,
      rootRecordName,
      targetFieldNameOnRootRecord,
      allRootStagingRecords,
      allTargetProductionRecords,
      allTargetStagingRecords,
      getRootRecordIdentifer,
      getTargetRecordIdentifer,
    })
  }
}

interface LinkStagingRecordsInput extends LinkStagingRecordInput {
  rootRecordName: AirtableModelName
  allRootProductionRecords: AirtableData
}
