import { Injectable } from "@nestjs/common"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncCategoriesService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  getCategoryRecordIdentifier = rec => rec.fields.Name

  getNumLinksCategories = () => 1

  async syncAirtableToAirtable(cliProgressBar?) {
    const allProductionCategories = await this.airtableService.getAllCategories(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords("Categories", cliProgressBar)

    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Categories",
      allProductionRecords: allProductionCategories,
      sanitizeFunc: fields =>
        this.syncUtils.deleteFieldsFromObject(
          {
            ...fields,
            Image: [],
            Parent: [],
            Products: [],
          },
          ["Products 2"]
        ),
      cliProgressBar,
    })

    const allStagingCategories = await this.airtableService.getAllCategories(
      this.airtableService.getStagingBase()
    )
    await this.addParentCategoryLinks(
      allProductionCategories,
      allStagingCategories,
      cliProgressBar
    )
  }

  private async addParentCategoryLinks(
    allProductionCategories,
    allStagingCategories,
    cliProgressBar?
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Categories",
      targetFieldNameOnRootRecord: "Parent",
      allRootProductionRecords: allProductionCategories,
      allRootStagingRecords: allStagingCategories,
      allTargetProductionRecords: allProductionCategories,
      allTargetStagingRecords: allStagingCategories,
      getRootRecordIdentifer: rec => rec.fields.Name,
      getTargetRecordIdentifer: rec => rec.fields.Name,
      cliProgressBar,
    })
  }
}
