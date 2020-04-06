import { Injectable } from "@nestjs/common"

import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncSizesService } from "./syncSizes.service"

@Injectable()
export class SyncBottomSizesService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncSizesService: SyncSizesService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getBottomSizeRecordIdentifer = rec =>
    `${rec.fields.Name}${rec.fields.Waist}${rec.fields.Rise}${rec.fields.Hem}${rec.fields.Inseam}`

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Bottom Sizes", cliProgressBar)
    const allProductionRecords = await this.airtableService.getAllBottomSizes(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Bottom Sizes",
      allProductionRecords: allProductionRecords,
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          Size: [],
          "Product Variants": [],
          "Manufacturer Sizes": [],
        }),
      cliProgressBar,
    })

    this.addSizeLinks(
      allProductionRecords,
      await this.airtableService.getAllBottomSizes(
        this.airtableService.getStagingBase()
      ),
      cliProgressBar
    )
    this.addManufacturerSizeLinks(
      allProductionRecords,
      await this.airtableService.getAllBottomSizes(
        this.airtableService.getStagingBase()
      ),
      cliProgressBar
    )
  }

  private addManufacturerSizeLinks = async (
    allBottomSizesProduction: AirtableData,
    allBottomSizesStaging: AirtableData,
    cliProgressBar?: any
  ) => {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Bottom Sizes",
      targetFieldNameOnRootRecord: "Manufacturer Sizes",
      allRootProductionRecords: allBottomSizesProduction,
      allRootStagingRecords: allBottomSizesStaging,
      allTargetProductionRecords: await this.airtableService.getAllSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getBottomSizeRecordIdentifer,
      getTargetRecordIdentifer: this.syncSizesService.getSizeRecordIdentifer,
      cliProgressBar,
    })
  }

  private addSizeLinks = async (
    allBottomSizesProduction: AirtableData,
    allBottomSizesStaging: AirtableData,
    cliProgressBar?: any
  ) => {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Bottom Sizes",
      targetFieldNameOnRootRecord: "Size",
      allRootProductionRecords: allBottomSizesProduction,
      allRootStagingRecords: allBottomSizesStaging,
      allTargetProductionRecords: await this.airtableService.getAllSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getBottomSizeRecordIdentifer,
      getTargetRecordIdentifer: this.syncSizesService.getSizeRecordIdentifer,
      cliProgressBar,
    })
  }
}
