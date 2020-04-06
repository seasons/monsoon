import { Injectable } from "@nestjs/common"

import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncSizesService } from "./syncSizes.service"

@Injectable()
export class SyncTopSizesService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncSizesService: SyncSizesService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Top Sizes", cliProgressBar)
    const allProductionRecords = await this.airtableService.getAllTopSizes(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Top Sizes",
      allProductionRecords: allProductionRecords,
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          Size: [],
          "Product Variants": [],
        }),
      cliProgressBar,
    })

    this.addSizeLinks(
      allProductionRecords,
      await this.airtableService.getAllTopSizes(
        this.airtableService.getStagingBase()
      ),
      cliProgressBar
    )
  }

  private async addSizeLinks(
    allTopSizesProduction: AirtableData,
    allTopSizesStaging: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Top Sizes",
      targetFieldNameOnRootRecord: "Size",
      allRootProductionRecords: allTopSizesProduction,
      allRootStagingRecords: allTopSizesStaging,
      allTargetProductionRecords: await this.airtableService.getAllSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getTopSizeRecordIdentifier,
      getTargetRecordIdentifer: this.syncSizesService.getSizeRecordIdentifer,
      cliProgressBar,
    })
  }

  getTopSizeRecordIdentifier = rec =>
    `${rec.fields.Name}${rec.fields.Length}${rec.fields.Sleeve}${rec.fields.Shoulder}${rec.fields.Chest}${rec.fields.Neck}`
}
