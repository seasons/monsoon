import { Injectable } from "@nestjs/common"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncProductsService } from "./syncProducts.service"

@Injectable()
export class SyncHomepageProductRailsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getNumLinksHomepageProductRails = () => 1

  async syncAirtableToAirtable(cliProgressBar?) {
    const allProductionRecs = await this.airtableService.getAllHomepageProductRails(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords(
      "Homepage Product Rails",
      cliProgressBar
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Homepage Product Rails",
      allProductionRecords: allProductionRecs,
      sanitizeFunc: fields => this.utils.Identity({ ...fields, Products: [] }),
      cliProgressBar,
    })

    await this.addProductsLinks(
      allProductionRecs,
      await this.airtableService.getAllHomepageProductRails(
        this.airtableService.getStagingBase()
      ),
      cliProgressBar
    )
  }

  private async addProductsLinks(
    allProductionRecords,
    allStagingRecords,
    cliProgressBar?
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Homepage Product Rails",
      targetFieldNameOnRootRecord: "Products",
      allRootProductionRecords: allProductionRecords,
      allRootStagingRecords: allStagingRecords,
      allTargetProductionRecords: await this.airtableService.getAllProducts(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllProducts(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: rec => rec.fields.Slug,
      getTargetRecordIdentifer: this.syncProductsService
        .getProductRecordIdentifer,
      cliProgressBar,
    })
  }
}
