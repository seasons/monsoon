import { Injectable } from "@nestjs/common"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncBrandsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getNumLinksBrands = () => 0

  async syncAirtableToAirtable(cliProgressBar?: any) {
    await this.syncUtils.deleteAllStagingRecords("Brands", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Brands",
      allProductionRecords: await this.airtableService.getAllBrands(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          Logo: this.syncUtils.sanitizeAttachments(fields.Logo),
          Products: [],
        }),
      cliProgressBar,
    })
  }
}
